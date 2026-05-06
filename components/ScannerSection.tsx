"use client";

/**
 * components/ScannerSection.tsx
 *
 * The functional food scanner — users upload a meal photo and get
 * real-time AI nutritional analysis via the useGeminiVision hook.
 * This is the primary "wow" interactive feature for hackathon judges.
 */

import { useRef, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeminiVision, type NutritionalAnalysis } from "@/hooks/useGeminiVision";

// ─── Macro Bar ────────────────────────────────────────────────────────────────

function MacroBar({
  label,
  value,
  max,
  color,
  unit,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  unit: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] tracking-[0.25em] text-white/40 uppercase font-medium">{label}</span>
        <span className="text-xs font-mono font-bold tabular-nums" style={{ color }}>
          {value}<span className="text-[9px] opacity-50 ml-0.5">{unit}</span>
        </span>
      </div>
      <div className="h-px w-full bg-white/5 relative overflow-hidden rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ─── Confidence Gauge ─────────────────────────────────────────────────────────

function ConfidenceGauge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const circumference = 2 * Math.PI * 22;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="60" height="60" viewBox="0 0 60 60" aria-label={`Confidence: ${pct}%`}>
        <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(0,229,255,0.08)" strokeWidth="3"/>
        <motion.circle
          cx="30" cy="30" r="22"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
        <text x="30" y="34" textAnchor="middle" fill="#00e5ff" fontSize="11" fontWeight="700" fontFamily="monospace">
          {pct}%
        </text>
      </svg>
      <span className="text-[8px] tracking-[0.25em] text-white/30 uppercase">Confidence</span>
    </div>
  );
}

// ─── Results Panel ────────────────────────────────────────────────────────────

function ResultsPanel({ data }: { data: NutritionalAnalysis }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-6"
      aria-label="Nutritional analysis results"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true"/>
            <span className="text-[9px] tracking-[0.3em] text-cyan-400/70 uppercase font-medium">
              Analysis Complete
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{data.foodLabel}</h3>
        </div>
        <ConfidenceGauge value={data.confidence} />
      </div>

      {/* Calories badge */}
      <div className="flex items-center gap-3">
        <div className="data-panel px-4 py-2.5 flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-white tabular-nums font-mono">
            {data.calories}
          </span>
          <span className="text-[10px] text-white/30 tracking-widest uppercase">kcal</span>
        </div>
        <span className="text-xs text-white/25">estimated per serving</span>
      </div>

      {/* Macro bars */}
      <div className="flex flex-col gap-3">
        <MacroBar label="Protein"     value={data.macros.protein}       max={60}  color="#00e5ff" unit="g"/>
        <MacroBar label="Carbohydrates" value={data.macros.carbohydrates} max={150} color="#7c3aed" unit="g"/>
        <MacroBar label="Fat"         value={data.macros.fat}           max={80}  color="#f59e0b" unit="g"/>
        <MacroBar label="Fiber"       value={data.macros.fiber}         max={40}  color="#10b981" unit="g"/>
      </div>

      {/* Micronutrients */}
      <div className="flex flex-col gap-2">
        <span className="text-[9px] tracking-[0.3em] text-white/30 uppercase font-medium">
          Micronutrient Highlights
        </span>
        <ul className="flex flex-wrap gap-2" role="list">
          {data.micronutrients.map((m) => (
            <li
              key={m}
              className="data-panel px-2.5 py-1 text-[10px] text-cyan-400/80 font-mono tracking-wide"
            >
              {m}
            </li>
          ))}
        </ul>
      </div>

      {/* Micro-swaps */}
      <div className="flex flex-col gap-2">
        <span className="text-[9px] tracking-[0.3em] text-white/30 uppercase font-medium">
          AI Micro-Swap Suggestions
        </span>
        <ul className="flex flex-col gap-2" role="list">
          {data.swapSuggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 w-4 h-4 rounded-[2px] border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <path d="M1.5 4l2 2 3-3.5" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="text-xs text-white/45 leading-relaxed">{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Raw response */}
      <details className="group">
        <summary className="text-[9px] tracking-[0.3em] text-white/20 uppercase cursor-pointer
                            hover:text-white/40 transition-colors duration-200 list-none flex items-center gap-1.5">
          <svg
            width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true"
            className="group-open:rotate-90 transition-transform duration-200"
          >
            <path d="M2 1.5l4 2.5-4 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Raw Gemini Response
        </summary>
        <p className="mt-2 text-[10px] text-white/25 leading-relaxed font-mono border-l border-white/[0.06] pl-3">
          {data.rawResponse}
        </p>
      </details>
    </motion.div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({
  onFile,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  inputId,
}: {
  onFile: (file: File) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  inputId: string;
}) {
  return (
    <label
      htmlFor={inputId}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center gap-5 h-64 rounded-[2px]
                  border cursor-pointer transition-all duration-300 select-none
                  ${isDragging
                    ? "border-cyan-400/70 bg-cyan-400/[0.04] shadow-[0_0_30px_rgba(0,229,255,0.08)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-cyan-400/30 hover:bg-white/[0.03]"
                  }`}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload a food photo for nutritional analysis"
        onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }}
      />

      <div
        className={`w-14 h-14 rounded-[2px] border flex items-center justify-center
                    transition-colors duration-300
                    ${isDragging ? "border-cyan-400/50" : "border-white/[0.08]"}`}
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v11M8 7l4-4 4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            stroke={isDragging ? "#00e5ff" : "rgba(255,255,255,0.25)"}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center px-6">
        <span className="text-sm text-white/50 font-medium">
          {isDragging ? "Drop your meal photo here" : "Drop a meal photo or click to upload"}
        </span>
        <span className="text-[10px] text-white/20 tracking-wide">
          JPG, PNG, WEBP · Max 10MB · Analysed by Gemini Vision
        </span>
      </div>
    </label>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function ScannerSection() {
  const { analyzeFrame, analysis, isLoading, error, reset } = useGeminiVision();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputId = useId();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      reset();
      await analyzeFrame(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [analyzeFrame, reset]);

  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true);  }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleReset = useCallback(() => {
    setPreview(null);
    reset();
  }, [reset]);

  return (
    <section
      id="scanner-section"
      className="relative z-10 bg-black py-28 px-6 md:px-10 border-t border-white/[0.04]"
      aria-labelledby="scanner-heading"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <header className="mb-12 flex flex-col gap-3">
          <span className="text-[9px] tracking-[0.4em] text-cyan-400/60 uppercase font-medium">
            Try It Now · Powered by Gemini 1.5 Pro Vision
          </span>
          <h2
            id="scanner-heading"
            className="text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            Scan your <span className="holo-text">meal.</span>
          </h2>
          <p className="text-white/30 text-base max-w-lg leading-relaxed">
            Upload any food photo and watch LogicBite extract full nutritional data
            in under 2 seconds.
          </p>
        </header>

        {/* Main scanner card */}
        <div className="grid md:grid-cols-2 gap-px bg-white/[0.04]">

          {/* Left: upload / preview */}
          <div className="bg-black p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] tracking-[0.3em] text-white/30 uppercase font-medium">Input</span>
              {preview && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[9px] tracking-[0.2em] text-white/20 uppercase
                             hover:text-white/50 transition-colors duration-200"
                  aria-label="Clear current scan and upload a new photo"
                >
                  Clear ×
                </button>
              )}
            </div>

            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <div className="relative rounded-[2px] overflow-hidden border border-white/[0.06] h-64">
                <img
                  src={preview}
                  alt="Uploaded meal photo for nutritional analysis"
                  className="w-full h-full object-cover"
                />
                {isLoading && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm"
                    aria-live="polite"
                    aria-label="Analysing your meal with Gemini Vision AI"
                  >
                    {/* Scanning animation */}
                    <div className="relative w-full h-full absolute inset-0" aria-hidden="true">
                      <motion.div
                        animate={{ y: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 right-0 h-0.5"
                        style={{ background: "linear-gradient(to right, transparent, #00e5ff, transparent)" }}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="flex gap-1" aria-hidden="true">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1 h-1 rounded-full bg-cyan-400"
                          />
                        ))}
                      </div>
                      <span className="text-[9px] tracking-[0.3em] text-cyan-400/80 uppercase">
                        Gemini analysing…
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <UploadZone
                onFile={handleFile}
                isDragging={isDragging}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                inputId={fileInputId}
              />
            )}

            {/* Tech badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {["Gemini 1.5 Pro", "Vision API", "Firebase"].map((b) => (
                <span
                  key={b}
                  className="data-panel px-2 py-1 text-[8px] tracking-[0.2em] text-cyan-400/50 uppercase font-mono"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Right: results */}
          <div className="bg-black p-8 min-h-[400px] flex flex-col">
            <span className="text-[9px] tracking-[0.3em] text-white/30 uppercase font-medium mb-5">
              Analysis Output
            </span>

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="flex flex-col gap-3 text-center py-12"
                >
                  <span className="text-2xl" aria-hidden="true">⚠</span>
                  <p className="text-sm text-red-400/70">{error}</p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[9px] tracking-widest text-cyan-400/60 uppercase hover:text-cyan-400 transition-colors"
                  >
                    Try again
                  </button>
                </motion.div>
              ) : analysis ? (
                <ResultsPanel key="results" data={analysis} />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-4 flex-1 py-12"
                  aria-label="Awaiting food photo upload"
                >
                  {/* Idle animation */}
                  <div className="relative w-16 h-16" aria-hidden="true">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border border-cyan-400/10"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-2 rounded-full border border-cyan-400/20"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-400/40" />
                    </div>
                  </div>
                  <p className="text-sm text-white/20 text-center max-w-[200px] leading-relaxed">
                    Upload a meal photo to initiate the Gemini Vision scan
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-[9px] text-white/15 leading-relaxed max-w-xl">
          * Analysis powered by Google Gemini 1.5 Pro Vision. Results are estimates for informational
          purposes only and should not replace professional dietary advice. Demo uses simulated API response.
        </p>
      </div>
    </section>
  );
}
