/**
 * SSE streaming endpoint for AI transform requests.
 *
 * POST /api/ai/transform
 *
 * This route bridges the client-side `useTransformStream` hook with the server-side
 * `transform()` async generator. It:
 *   1. Validates the request body (`configId` + `input`).
 *   2. Resolves the transform config from the registry.
 *   3. Creates a `ReadableStream` that consumes the `transform()` generator and
 *      serializes each event as an SSE `data:` line.
 *   4. Returns the stream with `text/event-stream` content type.
 *
 * The SSE protocol:
 *   - Each event is a `data: {json}\n\n` line (double newline = SSE event boundary).
 *   - The terminal `data: [DONE]\n\n` signals end-of-stream to the client.
 *   - Errors mid-stream are sent as `{ type: "error", message }` events before closing.
 *
 * Why SSE instead of WebSockets?
 *   SSE is simpler, works over standard HTTP, is natively supported by browsers via
 *   `fetch` + `ReadableStream`, and aligns with OpenAI's own streaming format.
 *   The transform pipeline is request-response (not bidirectional), so SSE is sufficient.
 */
import { NextRequest } from "next/server";
import { transform } from "@/lib/openai/transform-service";
import { getConfigById } from "@/lib/openai/configs";
import type { TransformInput } from "@/lib/openai/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { configId, input } = body as { configId: string; input: TransformInput };

    // Validate configId — required so we know which model/prompt/tools to use
    if (!configId) {
      return new Response(JSON.stringify({ error: "configId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Resolve config from registry — returns undefined for unknown IDs
    const config = getConfigById(configId);
    if (!config) {
      return new Response(JSON.stringify({ error: `Unknown config: ${configId}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();

    // Create a ReadableStream that pulls events from the transform() async generator
    // and serializes them as SSE lines. The `start()` callback runs immediately when
    // the stream is created, consuming the generator to completion.
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Each yielded event from the generator becomes an SSE `data:` line
          for await (const event of transform(config, input)) {
            const data = JSON.stringify(event);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          // Send the SSE terminal marker so the client knows the stream is complete
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          // If the generator throws (unexpected), send an error event and close gracefully
          const message = error instanceof Error ? error.message : "Stream failed";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message })}\n\n`));
          controller.close();
        }
      },
    });

    // Return the SSE stream with appropriate headers:
    // - text/event-stream: tells the browser this is an SSE stream
    // - no-cache: prevents intermediary caching of the stream
    // - keep-alive: hints to proxies to keep the connection open
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // Catch errors from request parsing (invalid JSON, etc.)
    const message = error instanceof Error ? error.message : "Request failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
