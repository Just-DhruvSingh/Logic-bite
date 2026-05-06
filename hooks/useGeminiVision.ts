"use client";

import { useCallback, useState } from "react";

export interface GeminiVisionResult {
  meal_identified: string;
  health_score_impact: number;
  contextual_advice: string;
  recommended_micro_swap: string;
}

interface AnalyzeFoodRequestBody {
  imageBase64: string;
  mimeType?: string;
}

interface UseGeminiVisionState {
  data: GeminiVisionResult | null;
  error: string | null;
  isLoading: boolean;
}

export interface UseGeminiVisionReturn extends UseGeminiVisionState {
  analyzeFood: (payload: AnalyzeFoodRequestBody) => Promise<GeminiVisionResult | null>;
  reset: () => void;
}

export function useGeminiVision(): UseGeminiVisionReturn {
  const [data, setData] = useState<GeminiVisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeFood = useCallback(
    async ({ imageBase64, mimeType = "image/webp" }: AnalyzeFoodRequestBody) => {
      if (!imageBase64.trim()) {
        const message = "Image data is required for analysis.";
        setError(message);
        setData(null);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/analyze-food", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64,
            mimeType,
          }),
        });

        const payload = (await response.json()) as GeminiVisionResult | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in payload && typeof payload.error === "string"
              ? payload.error
              : "Food analysis failed.",
          );
        }

        setData(payload as GeminiVisionResult);
        return payload as GeminiVisionResult;
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : "Food analysis failed.";
        setError(message);
        setData(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    analyzeFood,
    reset,
  };
}
