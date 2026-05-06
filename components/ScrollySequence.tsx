"use client";

/**
 * components/ScrollySequence.tsx
 *
 * Core scroll-linked canvas animation for LogicBite.
 * • 80-frame JPG sequence driven by scroll position
 * • Framer Motion spring smoothing (stiffness:100, damping:30)
 * • 4 story beats with animated text overlays
 * • Holographic data panels + scan-beam overlay
 * • Accessible: aria-live region, role="img", role="progressbar"
 */

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  useScroll,
  useSpring,
  useTransform,
  motion,
  AnimatePresence,
} from "framer-motion";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_FRAMES = 80;

const getFramePath = (index: number): string =>
  `/sequence/ezgif-frame-${String(index).padStart(3, "0")}.jpg`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Beat {
  id: string;
  range: [number, number];
  announcement: string;
  align: "center" | "left" | "right";
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  hasCta?: boolean;
}

interface DataPoint {
  label: string;
  value: string;
  unit: string;
  color: string;
}

// ─── Story Beats ──────────────────────────────────────────────────────────────

const BEATS: Beat[] = [
  {
    id: "beat-a",
    range: [0, 0.22],
    announcement: "Decode Your Diet. LogicBite uses AI to transform visual context into actionable health intelligence.",
    align: "center",
    eyebrow: "Introducing LogicBite",
    title: (<>DECODE YOUR <span className="holo-text">DIET.</span></>),
    subtitle: "LogicBite uses AI to transform a single photo into complete nutritional intelligence.",
  },
  {
    id: "beat-b",
    range: [0.28, 0.47],
    announcement: "Beyond Calorie Counting. The Gemini Vision engine instantly extracts multi-spectral nutritional data.",
    align: "left",
    eyebrow: "Gemini Vision API",
    title: (<>BEYOND <span className="holo-text">CALORIE</span><br />COUNTING.</>),
    subtitle: "Upload a picture. The Gemini Vision engine instantly extracts multi-spectral nutritional data from your environment.",
  },
  {
    id: "beat-c",
    range: [0.53, 0.72],
    announcement: "Micro-Swaps, Macro Results. Personalized alternatives based on your behavior profile.",
    align: "right",
    eyebrow: "Behaviour AI",
    title: (<>MICRO-SWAPS,<br /><span className="holo-text">MACRO</span> RESULTS.</>),
    subtitle: "Cross-referenced with your historical behavior profile to surface painless, personalized alternatives.",
  },
  {
    id: "beat-d",
    range: [0.78, 0.97],
    announcement: "Initiate Gastro-Scan. Join the LogicBite beta and build sustainable habits.",
    align: "center",
    eyebrow: "Limited Beta",
    title: (<>INITIATE <span className="holo-text">GASTRO&#8209;SCAN.</span></>),
    subtitle: "Join 2,400+ beta users already building sustainable habits — one scan at a time.",
    hasCta: true,
  },
];

const DATA_POINTS: DataPoint[] = [
  { label: "Protein", value: "22", unit: "g", color: "#00e5ff" },
  { label: "Carbs",   value: "61", unit: "g", color: "#7c3aed" },
  { label: "Fat",     value: "14", unit: "g", color: "#f59e0b" },
  { label: "Fiber",   value: "9",  unit: "g", color: "#10b981" },
  { label: "kcal",   value: "487", unit: "",  color: "#00e5ff" },
  { label: "GI",      value: "54", unit: "",  color: "#f59e0b" },
];

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div
      role="status"
      aria-label={`Loading LogicBite: ${progress}%`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black gap-8"
    >
      <div className="flex flex-col items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <rect x="2"  y="2"  width="14" height="14" stroke="#00e5ff" strokeWidth="1.4"/>
          <rect x="20" y="2"  width="14" height="14" stroke="#00e5ff" strokeWidth="1.4"/>
          <rect x="2"  y="20" width="14" height="14" stroke="#00e5ff" strokeWidth="1.4"/>
          <rect x="20" y="20" width="14" height="14" stroke="#00e5ff" strokeWidth="1.4" opacity="0.3"/>
          <circle cx="18" cy="18" r="3" fill="#00e5ff"/>
        </svg>
        <span className="text-[10px] tracking-[0.35em] text-cyan-400 font-semibold uppercase">
          LogicBite
        </span>
      </div>

      <div className="flex flex-col items-center gap-2 w-52">
        <div
          className="w-full h-px bg-white/5 relative overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="absolute inset-y-0 left-0 bg-cyan-400 transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 progress-shimmer opacity-50" aria-hidden="true"/>
        </div>
        <span className="text-[10px] tracking-[0.3em] text-cyan-400/50 font-mono tabular-nums">
          {String(progress).padStart(3, "0")}%
        </span>
      </div>

      <p className="text-[10px] tracking-[0.3em] text-white/15 uppercase">
        Initialising scanner array
      </p>
    </div>
  );
}

// ─── Beat Text Overlay ────────────────────────────────────────────────────────

interface BeatOverlayProps {
  beat: Beat;
  scrollProgress: number;
}

function BeatOverlay({ beat, scrollProgress }: BeatOverlayProps) {
  const [start, end] = beat.range;
  const fadeIn  = start + (end - start) * 0.15;
  const fadeOut = end   - (end - start) * 0.15;

  const opacity =
    scrollProgress < start  ? 0 :
    scrollProgress < fadeIn  ? (scrollProgress - start) / (fadeIn - start) :
    scrollProgress < fadeOut ? 1 :
    scrollProgress < end     ? 1 - (scrollProgress - fadeOut) / (end - fadeOut) :
    0;

  const y =
    scrollProgress < start  ? 28 :
    scrollProgress < fadeIn  ? 28 * (1 - (scrollProgress - start) / (fadeIn - start)) :
    scrollProgress > fadeOut ? -28 * ((scrollProgress - fadeOut) / (end - fadeOut)) :
    0;

  const isVisible = scrollProgress >= start && scrollProgress <= end;

  const alignClass =
    beat.align === "center" ? "items-center text-center mx-auto" :
    beat.align === "left"   ? "items-start text-left ml-8 md:ml-16 lg:ml-24" :
                              "items-end text-right mr-8 md:mr-16 lg:mr-24";

  return (
    <motion.div
      key={beat.id}
      animate={{ opacity, y, pointerEvents: isVisible ? "auto" : "none" }}
      transition={{ duration: 0 }}
      className={`absolute flex flex-col gap-3 z-20 max-w-2xl ${alignClass}`}
      style={{ bottom: "13%" }}
      aria-hidden={!isVisible}
    >
      <span className="text-[9px] tracking-[0.4em] text-cyan-400/70 uppercase font-medium">
        {beat.eyebrow}
      </span>

      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem]
                     font-black tracking-tight text-white leading-[1.02]">
        {beat.title}
      </h2>

      <p className="text-sm sm:text-base text-cyan-50/55 max-w-sm leading-relaxed font-light">
        {beat.subtitle}
      </p>

      {beat.hasCta && (
        <div className="flex items-center gap-4 mt-3">
          <button
            type="button"
            className="cta-btn"
            aria-label="Join LogicBite beta — initiate your gastro-scan"
            onClick={() => document.getElementById("beta-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M4.5 6.5h4M6.5 4.5l2 2-2 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            JOIN BETA
          </button>
          <span className="text-[9px] text-white/20 tracking-widest">No credit card required</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Holographic Data Panels ──────────────────────────────────────────────────

function HoloPanels({ opacity }: { opacity: number }) {
  return (
    <motion.aside
      animate={{ opacity }}
      transition={{ duration: 0.5 }}
      aria-label="Live nutritional analysis data"
      aria-hidden={opacity < 0.1}
      className="absolute top-20 right-5 md:right-8 flex flex-col gap-1.5 z-10"
    >
      <div className="data-panel px-3 py-1.5 mb-0.5">
        <span className="text-[8px] tracking-[0.3em] text-cyan-400/60 uppercase font-medium">
          Gemini Vision · Live
        </span>
      </div>
      {DATA_POINTS.map((dp) => (
        <div key={dp.label} className="data-panel px-3 py-2 flex items-center justify-between gap-5 min-w-[130px]">
          <span className="text-[9px] text-white/35 tracking-widest uppercase font-medium">{dp.label}</span>
          <span className="text-sm font-mono font-bold tabular-nums" style={{ color: dp.color }}>
            {dp.value}
            {dp.unit && <span className="text-[9px] opacity-50 ml-0.5">{dp.unit}</span>}
          </span>
        </div>
      ))}
    </motion.aside>
  );
}

// ─── Scan Beam ────────────────────────────────────────────────────────────────

function ScanBeam({ opacity }: { opacity: number }) {
  return (
    <motion.div
      animate={{ opacity }}
      className="absolute inset-0 pointer-events-none z-[5] overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        animate={{ x: [0, 60, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 bottom-0 w-px"
        style={{
          left: "18%",
          background: "linear-gradient(to bottom, transparent 0%, #00e5ff 25%, #00e5ff 75%, transparent 100%)",
          boxShadow: "0 0 16px 3px rgba(0,229,255,0.35)",
        }}
      />
      <motion.div
        animate={{ opacity: [0.1, 0.3, 0.1], scaleX: [0.8, 1.3, 0.8] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute w-1/3 h-px"
        style={{
          top: "38%", left: 0,
          background: "linear-gradient(to right, transparent, #00e5ff 40%, transparent)",
          transformOrigin: "left",
        }}
      />
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScrollySequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imagesRef    = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef       = useRef<number | null>(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded]         = useState(false);
  const [liveText, setLiveText]         = useState("");
  const [currentBeatId, setCurrentBeatId] = useState("");
  const [scrollVal, setScrollVal]       = useState(0);
  const [scanOpacity, setScanOpacity]   = useState(1);
  const [holoOpacity, setHoloOpacity]   = useState(0);

  // ── Framer Motion scroll ─────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const frameIndex = useTransform(smoothProgress, [0, 1], [0, TOTAL_FRAMES - 1]);
  const scanBeamOpacity  = useTransform(smoothProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const holoPanelOpacity = useTransform(smoothProgress, [0.45, 0.55, 0.92, 1], [0, 1, 1, 0]);

  // ── Image preloading ─────────────────────────────────────────────────────
  const preloadImages = useCallback(async () => {
    let loaded = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    await Promise.all(
      Array.from({ length: TOTAL_FRAMES }, (_, i) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = img.onerror = () => {
            loaded++;
            setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
            images[i] = img;
            resolve();
          };
          img.src = getFramePath(i + 1);
        })
      )
    );

    imagesRef.current = images;
    setIsLoaded(true);
  }, []);

  useEffect(() => { preloadImages(); }, [preloadImages]);

  // ── Canvas draw ──────────────────────────────────────────────────────────
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[index];
    if (!canvas || !img?.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw  = canvas.clientWidth;
    const ch  = canvas.clientHeight;

    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width  = cw * dpr;
      canvas.height = ch * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, cw, ch);

    // object-fit: cover — fills viewport, arm stays prominent
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth  * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - dw) / 2, 0, dw, dh);
  }, []);

  // ── RAF driven by frameIndex spring ─────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    const u1 = frameIndex.on("change", (v) => {
      const idx = Math.round(Math.max(0, Math.min(v, TOTAL_FRAMES - 1)));
      if (idx === currentFrameRef.current) return;
      currentFrameRef.current = idx;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(idx));
    });

    drawFrame(0);
    return () => { u1(); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isLoaded, frameIndex, drawFrame]);

  // ── Subscribe to derived motion values ──────────────────────────────────
  useEffect(() => {
    const u1 = smoothProgress.on("change", setScrollVal);
    const u2 = scanBeamOpacity.on("change", setScanOpacity);
    const u3 = holoPanelOpacity.on("change", setHoloOpacity);
    return () => { u1(); u2(); u3(); };
  }, [smoothProgress, scanBeamOpacity, holoPanelOpacity]);

  // ── Screen-reader beat announcements ────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    for (const beat of BEATS) {
      if (scrollVal >= beat.range[0] && scrollVal <= beat.range[1]) {
        if (currentBeatId !== beat.id) {
          setCurrentBeatId(beat.id);
          setLiveText(beat.announcement);
        }
        return;
      }
    }
  }, [scrollVal, isLoaded, currentBeatId]);

  // ── Canvas resize ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(currentFrameRef.current));
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [isLoaded, drawFrame]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div key="loader" exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
            <LoadingScreen progress={loadProgress} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 400vh scroll container */}
      <div
        ref={containerRef}
        style={{ height: "400vh" }}
        className="relative"
        aria-label="LogicBite scrollytelling experience"
      >
        {/* Sticky viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Animated robotic scanner arm performing AI food nutritional analysis"
            className="absolute inset-0 w-full h-full"
            data-testid="logic-bite-canvas"
          />

          {/* Screen-reader live region */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            data-testid="sr-live-region"
          >
            {liveText}
          </div>

          {/* Overlays */}
          <ScanBeam opacity={scanOpacity} />
          <HoloPanels opacity={holoOpacity} />

          {/* Beat text overlays */}
          {BEATS.map((beat) => (
            <BeatOverlay key={beat.id} beat={beat} scrollProgress={scrollVal} />
          ))}

          {/* HUD corners */}
          <div aria-hidden="true" className="absolute bottom-8 left-6 flex flex-col gap-1 opacity-25 pointer-events-none">
            <span className="text-[8px] font-mono tracking-[0.3em] text-cyan-400 uppercase">Sys · Online</span>
            <span className="text-[8px] font-mono tracking-[0.3em] text-white/40 uppercase">NPU 94% Util</span>
          </div>
          <div aria-hidden="true" className="absolute bottom-8 right-6 flex flex-col items-end gap-1 opacity-25 pointer-events-none">
            <span className="text-[8px] font-mono tracking-[0.3em] text-cyan-400 uppercase">Gemini 1.5 Pro</span>
            <span className="text-[8px] font-mono tracking-[0.3em] text-white/40 tabular-nums">Conf 94.2%</span>
          </div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ opacity: scrollVal > 0.04 ? 0 : 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
            aria-hidden="true"
          >
            <span className="text-[8px] tracking-[0.4em] text-white/20 uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8"
              style={{ background: "linear-gradient(to bottom, rgba(0,229,255,0.4), transparent)" }}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}
