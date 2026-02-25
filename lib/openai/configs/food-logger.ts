/**
 * Food logger transform config.
 *
 * This config powers a food logging assistant that uses GPT-4o with two tools:
 *   1. `web_search_preview` — OpenAI-hosted web search for general food questions.
 *   2. `food_search` — Custom function tool that queries the USDA FoodData Central API
 *      for verified nutritional data (calories, protein, fat, carbs).
 *
 * The flow: user describes food (text or photo) -> model calls `food_search` ->
 * handler fetches USDA data -> model formats results with nutritional breakdown.
 *
 * Supports both text and image input (`inputTypes: Set(["text", "image"])`), so
 * users can photograph a meal and the model will identify foods and look them up.
 */
import type { TransformConfig, ToolHandler } from "../types";

/**
 * USDA FoodData Central search handler.
 *
 * Called server-side when the model invokes the `food_search` function tool.
 * Queries the USDA FDC API (https://fdc.nal.usda.gov/api-guide.html) and extracts
 * the four key macronutrients from each result.
 *
 * USDA nutrient IDs used:
 *   - 1008 = Energy (kcal / calories)
 *   - 1003 = Protein (g)
 *   - 1004 = Total lipid / fat (g)
 *   - 1005 = Carbohydrate, by difference (g)
 *
 * Returns top 5 results to keep the token count manageable while giving the model
 * enough options to disambiguate (e.g. "apple" -> raw, juice, dried, etc.).
 *
 * @returns JSON string with `{ results: [...] }` — always returns a string per ToolHandler contract.
 */
const foodSearchHandler: ToolHandler = async (args) => {
  const { query } = args as { query: string };
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) return JSON.stringify({ error: "USDA_API_KEY not configured" });

  // Fetch from USDA FoodData Central search endpoint (limited to 5 results)
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=5`,
  );
  const data = await res.json();

  // Extract only the fields the model needs — reduces token usage vs. sending raw USDA response.
  // Each nutrient is found by its USDA-assigned nutrientId (stable numeric identifiers).
  const foods = (data.foods || []).map((f: Record<string, unknown>) => ({
    fdcId: f.fdcId,
    description: f.description,
    brand: f.brandName || null,
    nutrients: {
      calories: (f.foodNutrients as Array<Record<string, unknown>>)?.find(
        (n) => n.nutrientId === 1008, // Energy (kcal)
      )?.value,
      protein: (f.foodNutrients as Array<Record<string, unknown>>)?.find(
        (n) => n.nutrientId === 1003, // Protein (g)
      )?.value,
      fat: (f.foodNutrients as Array<Record<string, unknown>>)?.find(
        (n) => n.nutrientId === 1004, // Total lipid / fat (g)
      )?.value,
      carbs: (f.foodNutrients as Array<Record<string, unknown>>)?.find(
        (n) => n.nutrientId === 1005, // Carbohydrate (g)
      )?.value,
    },
  }));

  return JSON.stringify({ results: foods });
};

/**
 * The complete food logger config, registered as "food-logger" in the config registry.
 *
 * Uses GPT-4o for multimodal support (text + image). The system prompt instructs the
 * model to always use the food_search tool for nutritional data rather than guessing,
 * and to present results in a user-friendly format with macronutrient breakdowns.
 */
export const foodLoggerConfig: TransformConfig = {
  id: "food-logger",
  model: "gpt-4o",
  systemPrompt: `You are a food logging assistant. When the user describes food they ate, use the food_search tool to look up nutritional information from the USDA database. Present the results in a clear, readable format with calories and macronutrients. If there are multiple matches, help the user pick the right one.`,
  tools: [
    // OpenAI-hosted web search — fallback for foods not in the USDA database
    { type: "web_search_preview" },
    // Custom function tool — model generates the query, we execute it server-side
    {
      type: "function",
      name: "food_search",
      description: "Search the USDA FoodData Central database for nutritional information",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The food item to search for, e.g. 'apple' or 'chicken breast'",
          },
        },
        required: ["query"],
      },
    },
  ],
  // Accepts both text descriptions and food photos
  inputTypes: new Set(["text", "image"]),
  // Maps function tool names to their server-side handlers
  toolHandlers: {
    food_search: foodSearchHandler,
  },
};
