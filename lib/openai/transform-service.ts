/**
 * OpenAI Responses API transform service (server-only).
 *
 * This module implements the core streaming transform pipeline that:
 *   1. Sends user input (text and/or image) to the OpenAI Responses API with streaming enabled.
 *   2. Parses the SSE (Server-Sent Events) stream and yields typed `TransformStreamEvent` objects.
 *   3. Detects function tool calls in the stream, executes them server-side via `ToolHandler`s,
 *      and loops back to submit tool outputs — allowing multi-turn tool use before final text output.
 *
 * Why raw `fetch` instead of the OpenAI SDK?
 *   The SDK's streaming types for the Responses API are complex and change frequently.
 *   Raw fetch gives us full control over SSE parsing and avoids SDK version coupling.
 *   The client singleton is still used to extract the API key consistently.
 *
 * The `transform()` function is an async generator, yielding events as they arrive.
 * The caller (the `/api/ai/transform` route) wraps these events into an outbound SSE stream
 * that the client-side `useTransformStream` hook consumes.
 */
import "server-only";
import { getOpenAIClient } from "./client";
import type { TransformConfig, TransformInput, TransformStreamEvent, TransformTool } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

/**
 * Converts our typed `TransformTool[]` into the raw JSON shape expected by the
 * OpenAI Responses API `/v1/responses` endpoint.
 *
 * Hosted tools (web_search_preview, code_interpreter, file_search) pass through
 * with minimal transformation. Function tools include name, description, and
 * JSON Schema parameters for the model to generate arguments against.
 */
function buildToolDefs(tools: TransformTool[]): AnyObj[] {
  return tools.map((tool) => {
    if (tool.type === "web_search_preview") return { type: "web_search_preview" };
    if (tool.type === "code_interpreter") return { type: "code_interpreter" };
    if (tool.type === "file_search") return { type: "file_search", vector_store_ids: tool.vectorStoreIds };
    return {
      type: "function",
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    };
  });
}

/**
 * Converts `TransformInput` into the Responses API `input` message array.
 * Supports multimodal input: text and/or image URL in a single user message.
 * The content array uses `input_text` / `input_image` types per the Responses API format.
 */
function buildInputMessages(input: TransformInput): AnyObj[] {
  const content: AnyObj[] = [];
  if (input.text) content.push({ type: "input_text", text: input.text });
  if (input.imageUrl) content.push({ type: "input_image", image_url: input.imageUrl });
  return [{ role: "user", content }];
}

/**
 * Streams an AI transform using the OpenAI Responses API with tool-call loop support.
 *
 * This is an async generator that yields `TransformStreamEvent` objects as the model
 * produces output. The caller iterates with `for await (const event of transform(...))`.
 *
 * ## Streaming + Tool-Call Loop
 *
 * The outer `while (true)` loop handles multi-turn tool execution:
 *
 * **Turn 1 (initial request):**
 *   - Sends user input + system prompt + tool definitions to `/v1/responses` with `stream: true`.
 *   - Reads the SSE stream, yielding text deltas and function call events to the caller.
 *   - If the model produces function calls, collects them in `pendingFunctionCalls`.
 *
 * **Turn 2+ (tool output submission):**
 *   - Executes each pending function call's `ToolHandler` server-side.
 *   - Sends `function_call_output` items back to the API with `previous_response_id`
 *     so the model can incorporate tool results and continue generating.
 *   - This loop repeats until the model produces a response with no function calls.
 *
 * The loop terminates with a `{ type: "done" }` event when:
 *   - The model finishes without requesting any tool calls, OR
 *   - An unrecoverable error occurs (API error, missing response body).
 *
 * ## SSE Parsing
 *
 * The inner `while (true)` loop reads raw bytes from the response body, decodes them,
 * and splits on newlines to extract `data: {...}` SSE lines. A `buffer` accumulates
 * partial lines across chunk boundaries (the last line in a chunk may be incomplete).
 *
 * Recognized SSE event types from the Responses API:
 *   - `response.output_text.delta` — incremental text token
 *   - `response.output_item.added` — new output item (we check for function_call type)
 *   - `response.function_call_arguments.delta` — incremental function call argument chunk
 *   - `response.function_call_arguments.done` — complete function call arguments
 *   - `response.completed` — response finished, contains the response ID for chaining
 *
 * @param config - The transform configuration (model, prompt, tools, handlers).
 * @param input - User input (text and/or image URL).
 * @yields {TransformStreamEvent} Events as the model streams its response.
 */
export async function* transform(
  config: TransformConfig,
  input: TransformInput,
): AsyncGenerator<TransformStreamEvent> {
  const client = getOpenAIClient();
  // Tracks the response ID across turns so the API can chain tool outputs onto the same conversation.
  let previousResponseId: string | undefined;
  // Set when function calls are detected — contains the tool output payloads for the next turn.
  let toolOutputs: AnyObj[] | undefined;

  // --- Outer loop: handles multi-turn tool calls ---
  // Each iteration is one API round-trip. Breaks when the model finishes without tool calls.
  while (true) {
    // Build request body for the Responses API
    const body: AnyObj = {
      model: config.model,
      instructions: config.systemPrompt,
      stream: true,
    };

    if (toolOutputs) {
      // Subsequent turn: send tool outputs and reference the previous response
      body.input = toolOutputs;
      body.previous_response_id = previousResponseId;
    } else if (!previousResponseId) {
      // First turn: send the user's original input
      body.input = buildInputMessages(input);
    }

    if (config.tools.length > 0) body.tools = buildToolDefs(config.tools);
    if (config.maxOutputTokens) body.max_output_tokens = config.maxOutputTokens;
    if (config.temperature != null) body.temperature = config.temperature;

    // Use raw fetch for streaming — the SDK's Responses API streaming types are unwieldy.
    // We extract the API key from the client instance (falling back to env var).
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(client as AnyObj).apiKey || process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    // Non-2xx from OpenAI — surface the error and terminate the stream
    if (!response.ok) {
      const errorText = await response.text();
      yield { type: "error", message: `API error ${response.status}: ${errorText}` };
      yield { type: "done" };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: "error", message: "No response body" };
      yield { type: "done" };
      return;
    }

    // --- Inner loop: parse SSE stream from this response ---
    const decoder = new TextDecoder();
    let buffer = ""; // Accumulates partial lines across chunk boundaries
    const pendingFunctionCalls = new Map<string, { name: string; args: string }>();
    let hasFunctionCalls = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode bytes and split into lines. The last element may be a partial line,
      // so we keep it in `buffer` and prepend it to the next chunk.
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        // SSE format: only process lines starting with "data: "
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue; // Terminal SSE marker from OpenAI

        let event: AnyObj;
        try { event = JSON.parse(data); } catch { continue; } // Skip malformed JSON

        const eventType = event.type as string;

        // --- Text output: yield incremental tokens to the caller ---
        if (eventType === "response.output_text.delta") {
          if (event.delta) yield { type: "textDelta", delta: event.delta };

        // --- Function call detected: register it in pendingFunctionCalls ---
        } else if (eventType === "response.output_item.added") {
          const item = event.item;
          if (item?.type === "function_call" && item.call_id && item.name) {
            yield { type: "functionCallStart", callId: item.call_id, name: item.name };
            pendingFunctionCalls.set(item.call_id, { name: item.name, args: "" });
            hasFunctionCalls = true;
          }

        // --- Function call arguments streaming in chunks ---
        } else if (eventType === "response.function_call_arguments.delta") {
          const callId = event.call_id || event.item_id || "";
          if (event.delta) {
            yield { type: "functionCallDelta", callId, delta: event.delta };
            // Accumulate argument chunks so we have the full JSON when done
            const pending = pendingFunctionCalls.get(callId);
            if (pending) pending.args += event.delta;
          }

        // --- Function call arguments complete ---
        } else if (eventType === "response.function_call_arguments.done") {
          const callId = event.call_id || event.item_id || "";
          const args = event.arguments || "";
          const pending = pendingFunctionCalls.get(callId);
          if (pending) {
            pending.args = args; // Use the final complete arguments (not accumulated deltas)
            yield { type: "functionCallDone", callId, name: pending.name, arguments: args };
          }

        // --- Response completed: capture ID for multi-turn chaining ---
        } else if (eventType === "response.completed") {
          if (event.response?.id) previousResponseId = event.response.id;
        }
      }
    }

    // --- Tool execution phase ---
    // If the model requested function calls, execute them and loop back to submit results.
    // This enables the model to use tool results in its next response.
    if (hasFunctionCalls && config.toolHandlers && pendingFunctionCalls.size > 0) {
      const results: AnyObj[] = [];
      for (const [callId, { name, args }] of pendingFunctionCalls) {
        const handler = config.toolHandlers[name];
        if (handler) {
          try {
            const parsed = args ? JSON.parse(args) : {};
            const result = await handler(parsed);
            results.push({ type: "function_call_output", call_id: callId, output: result });
          } catch (err) {
            // Tool errors are non-fatal: we report the error to the model so it can recover
            const msg = err instanceof Error ? err.message : "Tool execution failed";
            yield { type: "error", message: `Tool '${name}' error: ${msg}` };
            results.push({ type: "function_call_output", call_id: callId, output: JSON.stringify({ error: msg }) });
          }
        }
      }

      if (results.length > 0) {
        toolOutputs = results;
        continue; // Loop back to submit tool outputs in the next API call
      }
    }

    // No (more) tool calls — stream is complete
    yield { type: "done" };
    break;
  }
}
