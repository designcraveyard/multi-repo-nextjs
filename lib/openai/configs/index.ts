/**
 * Transform config registry.
 *
 * Central lookup for all available AI transform configurations. Each config defines
 * a model, system prompt, tools, and tool handlers for a specific use case.
 *
 * The registry pattern decouples the API route from individual configs: the route
 * receives a `configId` string from the client and resolves it here. This makes it
 * easy to add new transform pipelines without modifying the route or service layer.
 *
 * To add a new config:
 *   1. Create a new file in this directory (e.g. `my-feature.ts`) exporting a `TransformConfig`.
 *   2. Import it here and add it to the `configs` map with a kebab-case key.
 *   3. The client can now use `configId: "my-feature"` in transform requests.
 */
import type { TransformConfig } from "../types";
import { foodLoggerConfig } from "./food-logger";
import {
  markdownSummariseConfig,
  markdownKeyPointersConfig,
  markdownActionItemsConfig,
  markdownCustomConfig,
} from "./markdown-transforms";

/** Map of config ID -> TransformConfig. IDs are kebab-case strings used by the client. */
const configs: Record<string, TransformConfig> = {
  "food-logger": foodLoggerConfig,
  "md-summarise": markdownSummariseConfig,
  "md-key-pointers": markdownKeyPointersConfig,
  "md-action-items": markdownActionItemsConfig,
  "md-custom": markdownCustomConfig,
};

/**
 * Looks up a transform config by its string ID.
 * Returns `undefined` if no config matches — the caller should return a 400 error.
 */
export function getConfigById(id: string): TransformConfig | undefined {
  return configs[id];
}
