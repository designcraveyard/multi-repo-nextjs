/**
 * React hook for browser audio recording via the MediaRecorder API.
 *
 * Provides a simple state machine (idle -> recording <-> paused -> idle) for capturing
 * microphone audio as a WebM blob. The resulting blob can be sent to the `/api/ai/transcribe`
 * endpoint for Whisper transcription.
 *
 * ## MediaRecorder Lifecycle
 *
 * 1. `startRecording()` requests microphone permission via `getUserMedia`, creates a
 *    `MediaRecorder` with Opus codec (preferred) or plain WebM fallback, and begins
 *    capturing in 100ms chunks.
 *
 * 2. During recording, `ondataavailable` fires every 100ms (the `timeslice` param in
 *    `start(100)`), pushing each chunk into `chunksRef`. Small timeslices ensure low
 *    latency — if the user stops quickly, we still have data.
 *
 * 3. `stopRecording()` returns a `Promise<Blob>` — this is the key design decision:
 *    `MediaRecorder.stop()` is async (it fires `onstop` later), so we bridge the
 *    callback to a promise via `resolveStopRef`. The `onstop` handler assembles all
 *    chunks into a single blob, stops the media tracks (releases the microphone), and
 *    resolves the promise. This lets callers `await` the final blob cleanly.
 *
 * 4. `pause()`/`resume()` delegate to MediaRecorder's native pause support, which
 *    suspends chunk emission without releasing the microphone stream.
 *
 * ## Edge Cases
 * - If the user denies microphone access, `getUserMedia` throws and we surface the error.
 * - If `stopRecording` is called when already idle, it returns `null` (no-op).
 * - All refs are used for mutable state that should not trigger re-renders (recorder instance,
 *   chunks array, stop resolver). Only `state` and `error` are reactive.
 */
"use client";

import { useState, useRef, useCallback } from "react";

/** Three-state machine: idle (no recording), recording (capturing audio), paused (suspended). */
type RecorderState = "idle" | "recording" | "paused";

interface UseAudioRecorderReturn {
  state: RecorderState;
  startRecording: () => Promise<void>;
  /** Returns the recorded audio blob, or null if no recording was active. */
  stopRecording: () => Promise<Blob | null>;
  pause: () => void;
  resume: () => void;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  // Refs for mutable state that should not trigger re-renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // Bridges the MediaRecorder.onstop callback to the Promise returned by stopRecording()
  const resolveStopRef = useRef<((blob: Blob) => void) | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      // Request microphone access — may throw if denied or unavailable
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Prefer Opus codec for better compression; fall back to plain WebM
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      // Reset chunk accumulator for this new recording session
      chunksRef.current = [];
      // Collect audio data chunks as they arrive (every 100ms)
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      // When recording stops, assemble chunks into a single blob and clean up
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        // Release the microphone by stopping all tracks on the media stream
        stream.getTracks().forEach((t) => t.stop());
        // Resolve the promise that stopRecording() returned
        if (resolveStopRef.current) {
          resolveStopRef.current(blob);
          resolveStopRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      // Start recording with 100ms timeslice — fires ondataavailable every 100ms
      mediaRecorder.start(100);
      setState("recording");
    } catch (err) {
      // Handles permission denied, no microphone, or other getUserMedia failures
      setError(err instanceof Error ? err.message : "Failed to start recording");
      setState("idle");
    }
  }, []);

  /**
   * Stops recording and returns the final audio blob as a promise.
   *
   * Uses a ref-based promise bridge pattern: we store the `resolve` function in a ref,
   * call `recorder.stop()`, and the `onstop` callback resolves it with the assembled blob.
   * This avoids exposing raw callbacks to the caller.
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const recorder = mediaRecorderRef.current;
    // Guard: no-op if no recording is active
    if (!recorder || recorder.state === "inactive") return null;

    return new Promise((resolve) => {
      resolveStopRef.current = resolve;
      recorder.stop(); // Triggers onstop asynchronously, which resolves this promise
      setState("idle");
    });
  }, []);

  const pause = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.pause();
      setState("paused");
    }
  }, []);

  const resume = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "paused") {
      recorder.resume();
      setState("recording");
    }
  }, []);

  return { state, startRecording, stopRecording, pause, resume, error };
}
