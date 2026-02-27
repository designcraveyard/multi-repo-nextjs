/**
 * React hook for consuming the SSE transform stream from `/api/ai/transform`.
 *
 * This is the client-side counterpart to the server's SSE streaming endpoint.
 * It manages the full lifecycle of a transform request:
 *   1. Sends the config ID + input to the transform API via POST.
 *   2. Reads the SSE response stream, parsing `data:` lines into typed events.
 *   3. Accumulates `textDelta` events into a reactive `text` state (for live typing UI).
 *   4. Surfaces errors and tracks streaming state.
 *
 * ## SSE Client Consumption Pattern
 *
 * The hook reads the response body as a `ReadableStream` using `getReader()` and
 * manually parses SSE lines. This is necessary because the native `EventSource` API
 * only supports GET requests (not POST with a JSON body).
 *
 * The parsing logic mirrors the server-side pattern:
 *   - Accumulate bytes in a `buffer`, split on newlines.
 *   - Keep the last (potentially incomplete) line in the buffer for the next chunk.
 *   - Only process lines starting with `data: ` (SSE format).
 *   - Skip `[DONE]` terminal marker and malformed JSON lines.
 *
 * ## Abort Handling
 *
 * An `AbortController` is stored in a ref and passed as the `fetch` signal. This enables:
 *   - `reset()` to cancel an in-flight request (e.g. user navigates away or starts a new one).
 *   - `startTransform()` calls `reset()` first, so starting a new transform automatically
 *     cancels the previous one (no overlapping streams).
 *   - `AbortError` is silently ignored in the catch block since it is intentional cancellation.
 *
 * ## What this hook does NOT handle
 *
 * Function call events (`functionCallStart`, `functionCallDelta`, `functionCallDone`) are
 * currently ignored on the client side — they happen server-side transparently. The client
 * only sees the final text output after tool calls are resolved. A future UI could show
 * tool execution progress by handling these events.
 *
 * @example
 * ```tsx
 * const { text, isStreaming, error, startTransform, reset } = useTransformStream();
 *
 * // Start a transform
 * await startTransform("food-logger", { text: "I ate an apple" });
 *
 * // `text` updates reactively as tokens arrive
 * // `isStreaming` is true while the stream is active
 * // `error` is set if something goes wrong
 * // `reset()` cancels and clears everything
 * ```
 */
"use client";

import { useState, useCallback, useRef } from "react";
import type { TransformStreamEvent } from "@/lib/openai/types";

interface UseTransformStreamReturn {
  /** Accumulated text from all `textDelta` events so far. Updates reactively as tokens arrive. */
  text: string;
  /** True while the SSE stream is open and being read. */
  isStreaming: boolean;
  /** Error message from the API, stream, or network failure. Null when no error. */
  error: string | null;
  /** Initiates a new transform request, cancelling any in-flight stream first. */
  startTransform: (configId: string, input: { text?: string; imageUrl?: string }) => Promise<void>;
  /** Cancels any in-flight stream and resets text/error/streaming state. */
  reset: () => void;
}

export function useTransformStream(): UseTransformStreamReturn {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // AbortController ref for cancelling in-flight fetch requests
  const abortRef = useRef<AbortController | null>(null);

  /** Cancel any active stream and reset all state to initial values. */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setText("");
    setIsStreaming(false);
    setError(null);
  }, []);

  const startTransform = useCallback(
    async (configId: string, input: { text?: string; imageUrl?: string }) => {
      // Cancel any previous in-flight stream before starting a new one
      reset();
      setIsStreaming(true);

      // Create a new AbortController for this request — stored in ref so reset() can cancel it
      const abort = new AbortController();
      abortRef.current = abort;

      try {
        // POST to the SSE streaming endpoint with the config ID and user input
        const response = await fetch("/api/ai/transform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ configId, input }),
          signal: abort.signal, // Allows cancellation via abort.abort()
        });

        // Non-2xx responses return JSON error bodies (not SSE streams)
        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        // --- SSE stream parsing loop ---
        const decoder = new TextDecoder();
        let buffer = ""; // Accumulates partial lines across chunk boundaries

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode bytes and split into lines; keep the last (possibly partial) line in buffer
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            // SSE format: only process lines starting with "data: "
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue; // Terminal marker — stream is complete

            try {
              const event: TransformStreamEvent = JSON.parse(data);
              if (event.type === "textDelta") {
                // Append each text token to the accumulated text (drives the live typing UI)
                setText((prev) => prev + event.delta);
              } else if (event.type === "error") {
                // Surface server-side errors to the UI
                setError(event.message);
              }
              // Note: functionCall* events are intentionally not handled on the client —
              // tool execution happens server-side and the client only sees the final text.
            } catch {
              // Skip malformed SSE lines (e.g. partial JSON from a chunk boundary)
            }
          }
        }
      } catch (err) {
        // AbortError is expected when reset() or a new startTransform() cancels the stream
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Transform failed");
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [reset],
  );

  return { text, isStreaming, error, startTransform, reset };
}
