/**
 * hooks/useGeminiVision.ts
 *
 * Custom React hook that integrates with the Google Gemini 1.5 Pro Vision API
 * to perform nutritional analysis on a food image captured from the canvas.
 *
 * In production: replace GEMINI_API_KEY env variable and the stub response
 * with a real fetch call to the Gemini REST endpoint.
 */

"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NutritionalAnalysis {
  /** Short descriptive label of the detected food */
  foodLabel: string;
  /** Estimated calories per serving */
  calories: number;
  /** Macro breakdown in grams */
  macros: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  /** Micronutrient highlights */
  micronutrients: string[];
  /** AI-generated micro-swap suggestions */
  swapSuggestions: string[];
  /** Gemini confidence score 0–1 */
  confidence: number;
  /** Raw Gemini model response text */
  rawResponse: string;
}

export interface UseGeminiVisionReturn {
  /** Trigger an analysis pass on the given base64 image data */
  analyzeFrame: (imageDataUrl: string) => Promise<void>;
  /** Analysis result when available */
  analysis: NutritionalAnalysis | null;
  /** True while the API call is in-flight */
  isLoading: boolean;
  /** Error message if the call failed */
  error: string | null;
  /** Reset state back to initial */
  reset: () => void;
}

// ─── Stub Response ────────────────────────────────────────────────────────────
// This simulates what Gemini 1.5 Pro Vision would return after analysing
// a frame from the LogicBite scanner sequence.
const STUB_ANALYSIS: NutritionalAnalysis = {
  foodLabel: "Mediterranean Grain Bowl",
  calories: 487,
  macros: {
    protein: 22,
    carbohydrates: 61,
    fat: 14,
    fiber: 9,
  },
  micronutrients: [
    "Iron — 18% DV",
    "Magnesium — 24% DV",
    "Vitamin B6 — 32% DV",
    "Folate — 40% DV",
  ],
  swapSuggestions: [
    "Replace white rice with cauliflower rice → save 120 kcal",
    "Add 30g edamame for +9g complete protein",
    "Swap tahini dressing (50ml) for lemon-herb vinaigrette → save 80 kcal",
  ],
  confidence: 0.94,
  rawResponse:
    "Gemini 1.5 Pro Vision identified a Mediterranean Grain Bowl with high confidence. The composition includes quinoa, roasted chickpeas, cucumber, cherry tomatoes, and a tahini dressing. Estimated glycaemic index: moderate (54). Inflammation score: low.",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useGeminiVision
 *
 * Sends a canvas frame image to the Gemini 1.5 Pro Vision API for
 * multi-spectral nutritional extraction.
 *
 * @example
 * const { analyzeFrame, analysis, isLoading, error } = useGeminiVision();
 * await analyzeFrame(canvas.toDataURL("image/webp"));
 */
export function useGeminiVision(): UseGeminiVisionReturn {
  const [analysis, setAnalysis] = useState<NutritionalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFrame = useCallback(async (imageDataUrl: string) => {
    if (!imageDataUrl) {
      setError("No image data provided.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      /**
       * ── Production Implementation ──────────────────────────────────────────
       * Replace this block with a real Gemini API call:
       *
       * const response = await fetch(
       *   `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
       *   {
       *     method: "POST",
       *     headers: { "Content-Type": "application/json" },
       *     body: JSON.stringify({
       *       contents: [{
       *         parts: [
       *           {
       *             inline_data: {
       *               mime_type: "image/webp",
       *               data: imageDataUrl.split(",")[1],  // strip data: prefix
       *             },
       *           },
       *           {
       *             text: "Analyse this food image. Return JSON with fields: foodLabel, calories, macros {protein, carbohydrates, fat, fiber}, micronutrients[], swapSuggestions[], confidence, rawResponse.",
       *           },
       *         ],
       *       }],
       *       generationConfig: { temperature: 0.2, topP: 0.8, maxOutputTokens: 1024 },
       *     }),
       *   }
       * );
       * const data = await response.json();
       * const parsed: NutritionalAnalysis = JSON.parse(data.candidates[0].content.parts[0].text);
       * setAnalysis(parsed);
       * ──────────────────────────────────────────────────────────────────────
       */

      // ── Stub: simulate 1.2s network latency ──────────────────────────────
      await new Promise<void>((resolve) => setTimeout(resolve, 1200));
      setAnalysis(STUB_ANALYSIS);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gemini API call failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { analyzeFrame, analysis, isLoading, error, reset };
}
