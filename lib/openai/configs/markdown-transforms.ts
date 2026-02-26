/**
 * Markdown editor AI transform configs.
 *
 * These configs power the AI Transform feature in the MarkdownEditor toolbar.
 * Each one takes raw text input and returns transformed markdown — no tools needed.
 * Matches the iOS MarkdownTransformConfig presets.
 */
import type { TransformConfig } from "../types";

export const markdownSummariseConfig: TransformConfig = {
  id: "md-summarise",
  model: "gpt-4o",
  systemPrompt:
    "Summarise the following text concisely in well-structured markdown. " +
    "Preserve the original language. Output only the summary, no preamble.",
  tools: [],
  inputTypes: new Set(["text"]),
  temperature: 0.3,
};

export const markdownKeyPointersConfig: TransformConfig = {
  id: "md-key-pointers",
  model: "gpt-4o",
  systemPrompt:
    "Extract the key points from the following text as a markdown bullet list. " +
    "Each bullet should be a concise, self-contained statement. " +
    "Preserve the original language. Output only the bullet list, no preamble.",
  tools: [],
  inputTypes: new Set(["text"]),
  temperature: 0.3,
};

export const markdownActionItemsConfig: TransformConfig = {
  id: "md-action-items",
  model: "gpt-4o",
  systemPrompt:
    "Extract all action items from the following text as a markdown task list " +
    "using `- [ ]` format. Each item should be a clear, actionable task. " +
    "Preserve the original language. Output only the task list, no preamble.",
  tools: [],
  inputTypes: new Set(["text"]),
  temperature: 0.3,
};

export const markdownCustomConfig: TransformConfig = {
  id: "md-custom",
  model: "gpt-4o",
  systemPrompt:
    "You are a helpful writing assistant. Follow the user's instruction precisely. " +
    "Output well-structured markdown. No preamble or explanation unless asked.",
  tools: [],
  inputTypes: new Set(["text"]),
  temperature: 0.5,
};
