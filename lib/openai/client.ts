/**
 * OpenAI client singleton (server-only).
 *
 * Uses the "server-only" import to guarantee this module is never bundled into
 * client-side code — importing it from a "use client" file causes a build error.
 * This prevents accidental API key leakage to the browser.
 *
 * The singleton pattern avoids creating a new OpenAI client on every request,
 * which would re-parse the API key and allocate a new HTTP agent each time.
 * In a serverless environment (Vercel), the singleton persists for the lifetime
 * of the warm function instance, so multiple requests reuse the same client.
 */
import "server-only";
import OpenAI from "openai";

/** Module-level singleton — lazily initialized on first call to `getOpenAIClient()`. */
let _client: OpenAI | null = null;

/**
 * Returns the shared OpenAI client instance, creating it on first call.
 *
 * @throws {Error} If `OPENAI_API_KEY` is not set in the environment.
 *   This is a hard fail because every downstream service depends on it.
 *
 * @example
 * ```ts
 * const client = getOpenAIClient();
 * const response = await client.audio.transcriptions.create({ ... });
 * ```
 */
export function getOpenAIClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}
