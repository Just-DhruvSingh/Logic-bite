"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useId,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  useGeminiVision,
  type GeminiVisionResult,
} from "@/hooks/useGeminiVision";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read the selected image."));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the selected image."));
    };

    reader.readAsDataURL(file);
  });
}

function splitDataUrl(dataUrl: string): { base64: string; mimeType: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);

  if (!match) {
    return {
      base64: dataUrl,
      mimeType: "image/webp",
    };
  }

  return {
    mimeType: match[1],
    base64: match[2],
  };
}

function ResultCard({ data }: { data: GeminiVisionResult }) {
  const scoreLabel =
    data.health_score_impact > 0
      ? `+${data.health_score_impact}`
      : `${data.health_score_impact}`;

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
      aria-label="Food analysis results"
    >
      <div className="space-y-2">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-cyan-300/70">
          Meal Identified
        </p>
        <h3 className="text-2xl font-semibold text-white">{data.meal_identified}</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="data-panel p-4">
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/45">
            Health Score Impact
          </p>
          <p className="mt-3 text-4xl font-black text-cyan-300">{scoreLabel}</p>
        </article>
        <article className="data-panel p-4">
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/45">
            Recommended Micro-Swap
          </p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            {data.recommended_micro_swap}
          </p>
        </article>
      </div>

      <article className="data-panel p-4">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/45">
          Contextual Advice
        </p>
        <p className="mt-3 text-sm leading-6 text-white/80">{data.contextual_advice}</p>
      </article>
    </motion.div>
  );
}

export default function ScannerSection() {
  const fileInputId = useId();
  const { analyzeFood, data, error, isLoading, reset } = useGeminiVision();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);
      const { base64, mimeType } = splitDataUrl(dataUrl);

      setPreviewUrl(dataUrl);
      reset();
      await analyzeFood({
        imageBase64: base64,
        mimeType,
      });
    },
    [analyzeFood, reset],
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      await processFile(file);
    },
    [processFile],
  );

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files?.[0];
      if (!file) {
        return;
      }

      await processFile(file);
    },
    [processFile],
  );

  const clearScan = useCallback(() => {
    setPreviewUrl(null);
    reset();
  }, [reset]);

  return (
    <section
      id="scanner-section"
      aria-labelledby="scanner-heading"
      className="relative border-t border-white/10 bg-black px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[0.4em] text-cyan-300/70">
            Gemini 1.5 Pro Vision Demo
          </p>
          <h2
            id="scanner-heading"
            className="text-4xl font-black tracking-tight text-white md:text-5xl"
          >
            Scan a meal and get a behavior-aware recommendation.
          </h2>
          <p className="text-base leading-7 text-white/65">
            This mock scanner posts a base64 image to the LogicBite API route and renders
            the structured Gemini response exactly as the product would.
          </p>
        </header>

        <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.12),transparent_45%),#050505] p-8">
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] uppercase tracking-[0.35em] text-white/45">
                Image Input
              </span>
              {previewUrl ? (
                <button
                  type="button"
                  onClick={clearScan}
                  className="text-[0.7rem] uppercase tracking-[0.35em] text-cyan-300 transition hover:text-cyan-200"
                >
                  Reset Scan
                </button>
              ) : null}
            </div>

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-sm border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview of the uploaded meal for LogicBite analysis"
                  className="h-80 w-full object-cover"
                />
                {isLoading ? (
                  <div
                    aria-live="polite"
                    className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  >
                    <div className="space-y-3 text-center">
                      <motion.div
                        aria-hidden="true"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.25, repeat: Infinity }}
                        className="mx-auto h-12 w-12 rounded-full border border-cyan-300/70"
                      />
                      <p className="text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/85">
                        Analyzing with Gemini Vision
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <label
                htmlFor={fileInputId}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex h-80 cursor-pointer flex-col items-center justify-center rounded-sm border px-8 text-center transition ${
                  isDragging
                    ? "border-cyan-300 bg-cyan-300/10"
                    : "border-white/10 bg-white/[0.03] hover:border-cyan-300/40"
                }`}
              >
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <div className="space-y-3">
                  <p className="text-lg font-medium text-white">
                    Drop a food photo here or click to upload
                  </p>
                  <p className="text-sm leading-6 text-white/55">
                    JPG, PNG, or WEBP. The image is sent to the LogicBite API route as a
                    base64 payload for Gemini analysis.
                  </p>
                </div>
              </label>
            )}

            <div className="flex flex-wrap gap-3">
              {["Next.js 14", "Firebase", "Gemini 1.5 Pro Vision", "Cloud Run"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="data-panel px-3 py-1 text-[0.68rem] uppercase tracking-[0.28em] text-cyan-300/70"
                  >
                    {badge}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="bg-[#040404] p-8">
            <p className="mb-5 text-[0.7rem] uppercase tracking-[0.35em] text-white/45">
              Structured Output
            </p>
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  role="alert"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="data-panel p-5"
                >
                  <p className="text-sm leading-6 text-red-300">{error}</p>
                </motion.div>
              ) : data ? (
                <ResultCard data={data} />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[20rem] items-center justify-center rounded-sm border border-dashed border-white/10 px-8 text-center"
                >
                  <p className="max-w-sm text-sm leading-7 text-white/50">
                    Upload a meal image to preview the exact JSON-backed response shape
                    that LogicBite uses throughout the product.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
