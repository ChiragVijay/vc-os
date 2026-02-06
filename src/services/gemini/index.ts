import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";

const MODEL_FALLBACK_CHAIN = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite-001",
  "gemini-2.0-flash-001",
] as const;

const MAX_JSON_ATTEMPTS = 3;

const getApiKey = () => {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Add GOOGLE_GENAI_API_KEY.");
  }

  return apiKey;
};

const createClient = () => new GoogleGenAI({ apiKey: getApiKey() });

const extractJson = (text: string) => {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1];
  }

  const genericFenceMatch = text.match(/```\s*([\s\S]*?)```/i);
  if (genericFenceMatch?.[1]) {
    return genericFenceMatch[1];
  }

  return text;
};

const isRateLimitError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = "message" in error ? String(error.message) : "";
  return /rate limit|quota|429/i.test(message);
};

/**
 * Generate text with model fallback on rate limits
 */
export const generateText = async (prompt: string): Promise<string> => {
  const client = createClient();
  let lastError: Error | null = null;

  // Try each model in the fallback chain
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      console.log(`[Gemini] Attempting with model: ${model}`);
      const response = await client.models.generateContent({
        model,
        contents: prompt,
      });

      console.log(`[Gemini] Success with model: ${model}`);
      return response.text ?? "";
    } catch (error) {
      if (isRateLimitError(error)) {
        console.warn(`[Gemini] Rate limit hit for model: ${model}, trying next model...`);
        lastError = new Error(`LLM API rate limit exceeded for ${model}`);
        continue; // Try next model in chain
      }

      // Non-rate-limit error, throw immediately
      if (error instanceof Error) {
        throw new Error(`Gemini request failed: ${error.message}`);
      }

      throw new Error("Gemini request failed.");
    }
  }

  // All models failed due to rate limits
  throw new Error(
    `LLM API rate limit exceeded. All available models (${MODEL_FALLBACK_CHAIN.join(", ")}) have hit their rate limits. Please try again later.`,
  );
};

export const generateJson = async <T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_JSON_ATTEMPTS; attempt += 1) {
    try {
      const responseText = await generateText(prompt);
      const jsonText = extractJson(responseText).trim();
      const parsed = JSON.parse(jsonText);
      const result = schema.safeParse(parsed);

      if (result.success) {
        return result.data;
      }

      lastError = new Error(result.error.message);
    } catch (error) {
      if (error instanceof Error) {
        lastError = error;
        // If it's a rate limit error, propagate it immediately without retrying
        if (error.message.includes("LLM API rate limit exceeded")) {
          throw error;
        }
      } else {
        lastError = new Error("Failed to parse Gemini JSON response.");
      }
    }
  }

  throw new Error(
    `Gemini JSON generation failed after ${MAX_JSON_ATTEMPTS} attempts: ${
      lastError?.message ?? "Unknown error"
    }`,
  );
};
