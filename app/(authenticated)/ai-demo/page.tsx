"use client";

import { useState } from "react";
import { useTransformStream } from "@/app/hooks/use-transform-stream";
import { useAudioRecorder } from "@/app/hooks/use-audio-recorder";
import { Button } from "@/app/components/Button";
import { InputField } from "@/app/components/InputField";
import { Icon } from "@/app/components/icons";

export default function AIDemoPage() {
  const [inputText, setInputText] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const { text, isStreaming, error: streamError, startTransform, reset } = useTransformStream();
  const { state: recorderState, startRecording, stopRecording, error: recorderError } = useAudioRecorder();

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await startTransform("food-logger", { text: inputText.trim() });
  };

  const handleMicToggle = async () => {
    if (recorderState === "recording") {
      const blob = await stopRecording();
      if (!blob) return;

      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append("audio", blob);
        const res = await fetch("/api/ai/transcribe", { method: "POST", body: formData });
        const result = await res.json();
        if (result.text) {
          setTranscriptText(result.text);
          setInputText(result.text);
          await startTransform("food-logger", { text: result.text });
        }
      } catch (err) {
        console.error("Transcription failed:", err);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
      <div className="flex flex-col gap-2">
        <h1
          className="font-[var(--typography-heading-lg-weight)]"
          style={{
            fontSize: "var(--typography-heading-lg-size)",
            lineHeight: "var(--typography-heading-lg-leading)",
            color: "var(--typography-primary)",
          }}
        >
          AI Food Logger Demo
        </h1>
        <p
          style={{
            fontSize: "var(--typography-body-md-size)",
            color: "var(--typography-muted)",
          }}
        >
          Type or speak what you ate and get nutritional info from the USDA database.
        </p>
      </div>

      {/* Input area */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <InputField
            label="What did you eat?"
            placeholder="e.g. a large apple, grilled chicken breast..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <Button
          variant="primary"
          size="md"
          label={isStreaming ? "Streaming..." : "Send"}
          onClick={handleSend}
          disabled={!inputText.trim() || isStreaming}
          isLoading={isStreaming}
        />
        <Button
          variant={recorderState === "recording" ? "danger" : "secondary"}
          size="md"
          label={recorderState === "recording" ? "Stop" : "Record"}
          leadingIcon={<Icon name={recorderState === "recording" ? "Stop" : "Microphone"} size="md" />}
          onClick={handleMicToggle}
          disabled={isStreaming || isTranscribing}
        />
      </div>

      {/* Status indicators */}
      {recorderState === "recording" && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: "var(--surfaces-danger-default)", color: "var(--typography-on-danger)" }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "currentColor" }}
          />
          <span style={{ fontSize: "var(--typography-body-sm-size)" }}>Recording... tap stop when done</span>
        </div>
      )}
      {isTranscribing && (
        <p style={{ fontSize: "var(--typography-body-sm-size)", color: "var(--typography-muted)" }}>
          Transcribing audio...
        </p>
      )}
      {transcriptText && (
        <div
          className="px-3 py-2 rounded-lg"
          style={{
            backgroundColor: "var(--surfaces-base-secondary)",
            fontSize: "var(--typography-body-sm-size)",
            color: "var(--typography-secondary)",
          }}
        >
          <strong>Transcript:</strong> {transcriptText}
        </div>
      )}

      {/* AI Response */}
      {(text || isStreaming) && (
        <div
          className="rounded-xl p-4 min-h-[120px] whitespace-pre-wrap"
          style={{
            backgroundColor: "var(--surfaces-base-secondary)",
            color: "var(--typography-primary)",
            fontSize: "var(--typography-body-md-size)",
            lineHeight: "var(--typography-body-md-leading)",
            border: "1px solid var(--border-default)",
          }}
        >
          {text || "Thinking..."}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: "var(--typography-primary)" }} />
          )}
        </div>
      )}

      {/* Errors */}
      {(streamError || recorderError) && (
        <div
          className="px-3 py-2 rounded-lg"
          style={{
            backgroundColor: "var(--surfaces-danger-default)",
            color: "var(--typography-on-danger)",
            fontSize: "var(--typography-body-sm-size)",
          }}
        >
          {streamError || recorderError}
        </div>
      )}

      {text && !isStreaming && (
        <Button variant="tertiary" size="sm" label="Clear & start over" onClick={() => { reset(); setInputText(""); setTranscriptText(""); }} />
      )}
    </div>
  );
}
