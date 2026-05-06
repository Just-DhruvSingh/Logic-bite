import { render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, property) => {
        const tag = property as keyof JSX.IntrinsicElements;

        return React.forwardRef<
          HTMLElement,
          React.PropsWithChildren<Record<string, unknown>>
        >(({ children, ...props }, ref) =>
          React.createElement(tag, { ...props, ref }, children),
        );
      },
    },
  ),
  useScroll: () => ({
    scrollYProgress: { get: () => 0 },
  }),
  useSpring: <T,>(value: T) => value,
  useMotionValueEvent: vi.fn(),
}));

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    setTransform: vi.fn(),
  })) as HTMLCanvasElement["getContext"];

  global.Image = class {
    complete = true;
    naturalWidth = 1280;
    naturalHeight = 720;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    set src(_value: string) {
      setTimeout(() => {
        this.onload?.();
      }, 0);
    }
  } as unknown as typeof Image;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const { default: ScrollySequence } = await import("../ScrollySequence");

describe("ScrollySequence", () => {
  it("renders without crashing", () => {
    const { container } = render(<ScrollySequence />);
    expect(container).toBeTruthy();
  });

  it("renders the canvas and the polite live region", () => {
    render(<ScrollySequence />);

    expect(screen.getByTestId("logic-bite-canvas")).toBeInTheDocument();

    const liveRegion = screen.getByTestId("sr-live-region");
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
  });
});
