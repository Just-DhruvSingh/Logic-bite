import type { Metadata } from "next";
import dynamic from "next/dynamic";
import FeaturesSection from "@/components/FeaturesSection";
import FooterSection from "@/components/FooterSection";
import NavBar from "@/components/NavBar";
import ScannerSection from "@/components/ScannerSection";

const ScrollySequence = dynamic(() => import("@/components/ScrollySequence"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "LogicBite | AI-Powered Smart Food Scanner",
  description:
    "LogicBite is an AI-powered smart food scanner that uses Gemini Vision, Firebase, and behavior-aware guidance to improve meal choices.",
};

export default function HomePage() {
  return (
    <main id="main-content" className="bg-black text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-cyan-300 focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to main content
      </a>

      <NavBar />

      <ScrollySequence />
      <ScannerSection />
      <FeaturesSection />

      <section
        id="beta-section"
        aria-labelledby="beta-heading"
        className="border-t border-white/10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.16),transparent_42%),#020202] px-6 py-24 md:px-10"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[0.72rem] uppercase tracking-[0.4em] text-cyan-300/70">
            Initiate Gastro-Scan
          </p>
          <h2
            id="beta-heading"
            className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl"
          >
            Make better food choices with less friction.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/70">
            LogicBite combines vision AI, behavioral context, and lightweight coaching
            into a product that helps people improve meals one micro-swap at a time.
          </p>
          <a href="#scanner-section" className="cta-btn mt-10">
            Try the scanner
          </a>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
