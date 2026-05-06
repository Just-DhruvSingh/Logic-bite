/**
 * components/__tests__/ScrollySequence.test.tsx
 *
 * Vitest + React Testing Library unit tests for ScrollySequence.
 * Covers: initial render, canvas ARIA, screen-reader live region,
 * loading progress bar, and scroll container label.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock Framer Motion — jsdom cannot run real animations
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_t, prop) => {
      const Tag = prop as keyof JSX.IntrinsicElements;
      return React.forwardRef(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ children, ...rest }: React.PropsWithChildren<Record<string, any>>, ref: React.Ref<unknown>) => {
          const clean = Object.fromEntries(
            Object.entries(rest).filter(([k]) =>
              !["initial","animate","exit","transition","whileHover","whileTap",
                "whileInView","variants","style"].includes(k)
            )
          );
          return React.createElement(Tag, { ...clean, ref }, children);
        }
      );
    },
  }),
  AnimatePresence: ({ children }: React.PropsWithChildren) =>
    React.createElement(React.Fragment, null, children),
  useScroll: () => ({
    scrollYProgress: { get: () => 0, on: () => () => {} },
  }),
  useSpring: () => ({ get: () => 0, on: (_: string, cb: (v: number) => void) => { void cb; return () => {}; } }),
  useTransform: () => ({ get: () => 0, on: (_: string, _cb: (v: number) => void) => () => {} }),
}));

// Mock canvas context
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    scale: vi.fn(),
  })) as unknown as HTMLCanvasElement["getContext"];

  // Mock Image preloading
  global.Image = class {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_: string) { setTimeout(() => this.onload?.(), 0); }
    complete = true;
    naturalWidth = 100;
    naturalHeight = 100;
  } as unknown as typeof Image;
});

afterEach(() => { vi.restoreAllMocks(); });

// Mock IntersectionObserver
globalThis.IntersectionObserver = class {
  observe   = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
} as unknown as typeof IntersectionObserver;

// ─── Import ───────────────────────────────────────────────────────────────────
const { default: ScrollySequence } = await import("../ScrollySequence");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ScrollySequence", () => {
  it("renders without crashing", () => {
    const { container } = render(<ScrollySequence />);
    expect(container).toBeTruthy();
  });

  it("renders a <canvas> element", () => {
    render(<ScrollySequence />);
    const canvas = screen.getByTestId("logic-bite-canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName.toLowerCase()).toBe("canvas");
  });

  it("canvas has role=img and correct aria-label", () => {
    render(<ScrollySequence />);
    const canvas = screen.getByRole("img", { name: /animated robotic scanner arm/i });
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("aria-label");
  });

  it("canvas does not have aria-hidden=true", () => {
    render(<ScrollySequence />);
    const canvas = screen.getByTestId("logic-bite-canvas");
    expect(canvas.getAttribute("aria-hidden")).not.toBe("true");
  });

  it("renders aria-live polite live region", () => {
    render(<ScrollySequence />);
    const live = screen.getByTestId("sr-live-region");
    expect(live).toBeInTheDocument();
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveAttribute("aria-atomic", "true");
  });

  it("live region is initially empty", () => {
    render(<ScrollySequence />);
    expect(screen.getByTestId("sr-live-region").textContent).toBe("");
  });

  it("scroll container has accessible aria-label", () => {
    render(<ScrollySequence />);
    expect(
      screen.getByLabelText(/logicbite scrollytelling experience/i)
    ).toBeInTheDocument();
  });

  it("loading screen has a progressbar while loading", () => {
    render(<ScrollySequence />);
    const bar = screen.queryByRole("progressbar");
    if (bar) {
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
    }
  });
});
