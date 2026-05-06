/**
 * scripts/generate-placeholder-frames.mjs
 *
 * Generates 120 placeholder WebP frames (black PNGs renamed .webp) in
 * /public/sequence/ for development use when real frames aren't available.
 *
 * Usage:
 *   node scripts/generate-placeholder-frames.mjs
 *
 * In production: replace these with your actual image sequence.
 * Recommended source: export frames from After Effects / Blender as WebP.
 */

import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const TOTAL = 120;
const WIDTH = 1920;
const HEIGHT = 1080;
const OUT_DIR = join(process.cwd(), "public", "sequence");

mkdirSync(OUT_DIR, { recursive: true });

for (let i = 1; i <= TOTAL; i++) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Pure black background (matches page background #000000)
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Placeholder frame number indicator (only for dev reference)
  ctx.fillStyle = "rgba(0, 229, 255, 0.06)";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`Frame ${String(i).padStart(3, "0")} / ${TOTAL}`, WIDTH / 2, HEIGHT / 2);

  const buffer = canvas.toBuffer("image/png"); // Canvas lib exports PNG; rename to .webp for dev
  const filename = `frame_${String(i).padStart(3, "0")}.webp`;
  writeFileSync(join(OUT_DIR, filename), buffer);

  if (i % 20 === 0) {
    process.stdout.write(`Generated ${i}/${TOTAL} frames\n`);
  }
}

console.log("✅  All placeholder frames generated in /public/sequence/");
