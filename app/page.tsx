import type { Metadata } from "next";
import dynamic from "next/dynamic";
import ScannerSection from "@/components/ScannerSection";
import FeaturesSection from "@/components/FeaturesSection";
import FooterSection from "@/components/FooterSection";
import NavBar from "@/components/NavBar";

const ScrollySequence = dynamic(() => import("@/components/ScrollySequence"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center" aria-label="Loading">
      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
    </div>
  ),
});

export const metadata: Metadata = {
  title: "LogicBite — AI-Powered Smart Food Scanner",
  description:
    "Decode your diet. LogicBite uses Gemini Vision AI to extract multi-spectral nutritional data from any meal photo and suggest micro-swaps for macro results.",
  keywords: ["AI food scanner", "nutritional analysis", "Gemini Vision", "smart diet", "LogicBite"],
  openGraph: {
    title: "LogicBite — Decode Your Diet with AI",
    description: "Scroll-driven AI food intelligence. Beyond calorie counting.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "LogicBite", description: "Decode your diet." },
};

export default function Home() {
  return (
    <main id="main-content" role="main">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
                   focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-400 focus:text-black
                   focus:rounded focus:text-sm focus:font-bold"
      >
        Skip to main content
      </a>

      <NavBar />

      {/* Scrollytelling hero */}
      <article aria-label="LogicBite scrollytelling experience">
        <ScrollySequence />
      </article>

      {/* Live scanner demo */}
      <ScannerSection />

      {/* Features */}
      <FeaturesSection />

      {/* Final CTA */}
      <section
        id="beta-section"
        className="relative z-10 bg-black py-32 px-6 border-t border-white/[0.04]"
        aria-labelledby="cta-heading"
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-8">
          <span className="text-[9px] tracking-[0.4em] text-cyan-400/60 uppercase font-medium">
            Limited Beta
          </span>
          <h2
            id="cta-heading"
            className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight"
          >
            Ready to decode your{" "}
            <span className="holo-text">diet?</span>
          </h2>
          <p className="text-white/35 text-lg leading-relaxed max-w-xl">
            Join 2,400+ beta users already using LogicBite to make smarter
            food choices — one scan at a time.
          </p>
          <button
            type="button"
            className="cta-btn"
            aria-label="Request early beta access to LogicBite"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M4.5 6.5h4M6.5 4.5l2 2-2 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            REQUEST BETA ACCESS
          </button>
          <p className="text-[9px] text-white/15 tracking-widest uppercase">
            No credit card · Cancel anytime · Powered by Gemini
          </p>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
