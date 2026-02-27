/**
 * Audio transcription service using OpenAI's Whisper API (server-only).
 *
 * Converts audio blobs (typically recorded via `useAudioRecorder` on the client)
 * into text using the `whisper-1` model. The blob arrives from the `/api/ai/transcribe`
 * route as a FormData file upload.
 *
 * Uses `verbose_json` response format to get metadata (detected language, duration)
 * alongside the transcription text, which the UI can use for display/analytics.
 */
import "server-only";
import { getOpenAIClient } from "./client";
import type { TranscribeResult } from "./types";

/**
 * Transcribes an audio blob using OpenAI's Whisper model.
 *
 * The blob is wrapped in a `File` object with a `.webm` filename because the
 * OpenAI SDK expects a File-like object (with name and type) for multipart upload.
 * The actual audio format is determined by the blob's MIME type from the MediaRecorder.
 *
 * @param audioBlob - The raw audio data (typically audio/webm from the browser MediaRecorder).
 * @param language - Optional ISO 639-1 hint (e.g. "en") to improve accuracy. If omitted,
 *   Whisper auto-detects the language from the first 30 seconds of audio.
 * @returns Transcription text plus optional language/duration metadata.
 * @throws If the Whisper API returns an error (e.g. unsupported format, rate limit).
 */
export async function transcribe(audioBlob: Blob, language?: string): Promise<TranscribeResult> {
  const client = getOpenAIClient();
  // Wrap the blob as a File — the SDK needs a name for the multipart form field.
  // Default MIME type to audio/webm since that is what the browser MediaRecorder produces.
  const file = new File([audioBlob], "audio.webm", { type: audioBlob.type || "audio/webm" });

  const response = await client.audio.transcriptions.create({
    model: "whisper-1",
    file,
    ...(language ? { language } : {}),
    // verbose_json returns language detection + duration alongside the text
    response_format: "verbose_json",
  });

  // Map the verbose response to our simplified TranscribeResult type.
  // Nullish coalescing to undefined ensures optional fields are omitted (not null).
  return {
    text: response.text,
    language: response.language ?? undefined,
    duration: response.duration ?? undefined,
  };
}
