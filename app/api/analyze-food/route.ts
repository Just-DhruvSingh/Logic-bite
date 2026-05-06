import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface AnalyzeFoodRequestBody {
  imageBase64?: string;
  mimeType?: string;
}

interface AnalyzeFoodResponse {
  meal_identified: string;
  health_score_impact: number;
  contextual_advice: string;
  recommended_micro_swap: string;
}

const MODEL_NAME = "gemini-1.5-pro";

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "";
}

function coerceAnalyzeFoodResponse(value: unknown): AnalyzeFoodResponse | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.meal_identified !== "string" ||
    typeof candidate.health_score_impact !== "number" ||
    typeof candidate.contextual_advice !== "string" ||
    typeof candidate.recommended_micro_swap !== "string"
  ) {
    return null;
  }

  return {
    meal_identified: candidate.meal_identified,
    health_score_impact: candidate.health_score_impact,
    contextual_advice: candidate.contextual_advice,
    recommended_micro_swap: candidate.recommended_micro_swap,
  };
}

function fallbackAnalysis(): AnalyzeFoodResponse {
  return {
    meal_identified: "Unknown meal",
    health_score_impact: 0,
    contextual_advice:
      "We could not confidently identify the meal. Capture the plate in brighter light and keep the full serving in frame.",
    recommended_micro_swap: "Try rescanning with a clearer top-down photo.",
  };
}

function buildPrompt() {
  return [
    "You are LogicBite, an AI nutrition assistant.",
    "Analyze the provided meal image and respond with strict JSON only.",
    'Return exactly this schema: {"meal_identified":"string","health_score_impact":"number","contextual_advice":"string","recommended_micro_swap":"string"}',
    "health_score_impact must be a number in the range -100 to 100.",
    "Do not wrap the JSON in markdown.",
  ].join(" ");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeFoodRequestBody;
    const imageBase64 = body.imageBase64?.trim();
    const mimeType = body.mimeType?.trim() || "image/webp";

    if (!imageBase64) {
      return NextResponse.json(
        { error: "imageBase64 is required." },
        { status: 400 },
      );
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(fallbackAnalysis());
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: buildPrompt() },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Gemini request failed: ${errorText}` },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = text ? (JSON.parse(text) as unknown) : null;
    const normalized = coerceAnalyzeFoodResponse(parsed);

    if (!normalized) {
      return NextResponse.json(fallbackAnalysis());
    }

    return NextResponse.json(normalized);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to analyze food image.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
