/**
 * Audio transcription endpoint using OpenAI Whisper.
 *
 * POST /api/ai/transcribe
 *
 * Accepts a FormData body with:
 *   - `audio` (required): Blob/File of recorded audio (typically audio/webm from the browser).
 *   - `language` (optional): ISO 639-1 language hint (e.g. "en") to improve accuracy.
 *
 * Returns JSON: `{ text: string, language?: string, duration?: number }`
 *
 * Why FormData instead of JSON?
 *   Audio data is binary — FormData supports native binary blob uploads without
 *   base64 encoding overhead. The client sends the raw Blob from `useAudioRecorder`
 *   directly in the form field, keeping the request size minimal.
 *
 * This is a simple request-response endpoint (not streaming) because Whisper
 * processes the entire audio file at once and returns the full transcription.
 */
import { NextRequest, NextResponse } from "next/server";
import { transcribe } from "@/lib/openai/transcribe-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    // Validate that the "audio" field exists and is a Blob (not a string form field)
    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Language hint is optional — Whisper auto-detects if omitted
    const language = formData.get("language") as string | null;
    const result = await transcribe(audioFile, language ?? undefined);

    return NextResponse.json(result);
  } catch (error) {
    // Catches Whisper API errors (rate limits, unsupported format, etc.)
    const message = error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
