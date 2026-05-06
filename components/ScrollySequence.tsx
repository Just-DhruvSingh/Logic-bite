"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TOTAL_FRAMES = 120;

const STORY_BEATS = [
  {
    id: "beat-a",
    label: "Beat A: Decode Your Diet",
    title: "Decode Your Diet",
    body: "The robotic scanner arm isolates the signals hidden in every plate, translating food imagery into usable health context.",
    start: 0,
    end: 0.24,
    align: "left" as const,
  },
  {
    id: "beat-b",
    label: "Beat B: Beyond Calorie Counting",
    title: "Beyond Calorie Counting",
    body: "LogicBite frames texture, composition, and probable ingredients as richer evidence than a single calorie number.",
    start: 0.25,
    end: 0.49,
    align: "right" as const,
  },
  {
    id: "beat-c",
    label: "Beat C: Micro-Swaps",
    title: "Micro-Swaps",
    body: "Personalized alternatives appear at the exact moment a choice can change, without asking people to rebuild their routine.",
    start: 0.5,
    end: 0.74,
    align: "left" as const,
  },
  {
    id: "beat-d",
    label: "Beat D: Initiate Gastro-Scan",
    title: "Initiate Gastro-Scan",
    body: "The landing sequence resolves into a clear call to action: scan faster, decide smarter, and build better habits over time.",
    start: 0.75,
    end: 1,
    align: "center" as const,
  },
];

function getFramePath(index: number): string {
  return `/sequence/frame_${String(index).padStart(3, "0")}.webp`;
}

function getFallbackFramePath(index: number): string {
  const jpgIndex = Math.min(index, 80);
  return `/sequence/ezgif-frame-${String(jpgIndex).padStart(3, "0")}.jpg`;
}

function getBeatFromProgress(progress: number) {
  return (
    STORY_BEATS.find((beat) => progress >= beat.start && progress <= beat.end) ??
    STORY_BEATS[STORY_BEATS.length - 1]
  );
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let drawX = 0;
  let drawY = 0;

  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imageRatio;
    drawX = (canvasWidth - drawWidth) / 2;
  } else {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imageRatio;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function renderBeatOverlay({
  title,
  body,
  align,
}: {
  title: string;
  body: string;
  align: "left" | "right" | "center";
}) {
  const alignmentClass =
    align === "left"
      ? "items-start text-left"
      : align === "right"
        ? "items-end text-right"
        : "items-center text-center";

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-12 z-10 mx-auto flex max-w-6xl px-6 md:px-10 ${alignmentClass}`}
    >
      <div className="max-w-xl rounded-sm border border-white/12 bg-black/55 p-6 backdrop-blur-md">
        <p className="text-[0.72rem] uppercase tracking-[0.4em] text-cyan-300/70">
          LogicBite Narrative
        </p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/75 md:text-base">{body}</p>
      </div>
    </div>
  );
}

export default function ScrollySequence() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);

  const [isLoaded, setIsLoaded] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [activeBeatId, setActiveBeatId] = useState(STORY_BEATS[0].id);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.45,
  });

  const activeBeat = useMemo(
    () => STORY_BEATS.find((beat) => beat.id === activeBeatId) ?? STORY_BEATS[0],
    [activeBeatId],
  );

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const image = framesRef.current[frameIndex];

    if (!canvas || !image?.complete || image.naturalWidth === 0) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const targetWidth = Math.floor(cssWidth * devicePixelRatio);
    const targetHeight = Math.floor(cssHeight * devicePixelRatio);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    drawCoverImage(context, image, cssWidth, cssHeight);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;

    const preloadFrames = async () => {
      const images = await Promise.all(
        Array.from({ length: TOTAL_FRAMES }, (_, index) => {
          return new Promise<HTMLImageElement>((resolve) => {
            const image = new Image();

            const handleSettled = () => {
              loadedCount += 1;
              if (!isCancelled) {
                setLoadingProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
              }
              resolve(image);
            };

            image.onload = handleSettled;
            image.onerror = () => {
              image.onerror = handleSettled;
              image.src = getFallbackFramePath(index + 1);
            };
            image.src = getFramePath(index + 1);
          });
        }),
      );

      if (isCancelled) {
        return;
      }

      framesRef.current = images;
      setIsLoaded(true);
      setLiveText(STORY_BEATS[0].label);
      drawFrame(0);
    };

    void preloadFrames();

    return () => {
      isCancelled = true;
    };
  }, [drawFrame]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const handleResize = () => {
      drawFrame(frameRef.current);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [drawFrame, isLoaded]);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (!isLoaded) {
      return;
    }

    const progress = Math.min(Math.max(latest, 0), 1);
    const nextFrame = Math.min(TOTAL_FRAMES - 1, Math.round(progress * (TOTAL_FRAMES - 1)));

    if (nextFrame !== frameRef.current) {
      frameRef.current = nextFrame;
      drawFrame(nextFrame);
    }

    const beat = getBeatFromProgress(progress);
    if (beat.id !== activeBeatId) {
      setActiveBeatId(beat.id);
      setLiveText(beat.label);
    }
  });

  return (
    <section
      ref={containerRef}
      aria-label="LogicBite scrollytelling experience"
      className="relative h-[400vh] bg-black"
    >
      <div
        aria-live="polite"
        aria-atomic="true"
        data-testid="sr-live-region"
        className="sr-only"
      >
        {liveText}
      </div>

      <div className="sticky top-0 h-screen overflow-hidden">
        {!isLoaded ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
            <div className="w-full max-w-sm px-6 text-center">
              <p className="text-[0.72rem] uppercase tracking-[0.4em] text-cyan-300/70">
                Loading Sequence
              </p>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={loadingProgress}
                className="mt-6 h-1 overflow-hidden rounded-full bg-white/10"
              >
                <div
                  className="h-full bg-cyan-300 transition-[width] duration-200"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-white/55">{loadingProgress}%</p>
            </div>
          </div>
        ) : null}

        <canvas
          ref={canvasRef}
          data-testid="logic-bite-canvas"
          role="img"
          aria-label="Animated robotic scanner arm deconstructing a meal for the LogicBite story sequence"
          className="h-full w-full"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.75))]"
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[18%] w-px bg-gradient-to-b from-transparent via-cyan-300 to-transparent"
          animate={{ opacity: [0.2, 0.9, 0.2], x: [0, 16, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {renderBeatOverlay({
          title: activeBeat.title,
          body: activeBeat.body,
          align: activeBeat.align,
        })}
      </div>
    </section>
  );
}
