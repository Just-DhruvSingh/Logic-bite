"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      role="banner"
      className={`fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-10 py-4
                  transition-all duration-300
                  ${scrolled ? "bg-black/70 backdrop-blur-md border-b border-white/[0.04]" : ""}`}
    >
      {/* Logo */}
      <Link href="/" aria-label="LogicBite home" className="flex items-center gap-2.5 group">
        <div
          className="w-7 h-7 border border-cyan-400/40 rounded-[2px] flex items-center justify-center
                     group-hover:border-cyan-400 transition-colors duration-300"
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="5" height="5" stroke="#00e5ff" strokeWidth="0.9"/>
            <rect x="8" y="1" width="5" height="5" stroke="#00e5ff" strokeWidth="0.9"/>
            <rect x="1" y="8" width="5" height="5" stroke="#00e5ff" strokeWidth="0.9"/>
            <rect x="8" y="8" width="5" height="5" stroke="#00e5ff" strokeWidth="0.9" opacity="0.35"/>
          </svg>
        </div>
        <span className="text-white text-sm font-semibold tracking-tight">
          Logic<span className="text-cyan-400">Bite</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav aria-label="Primary navigation" className="hidden md:block">
        <ul className="flex items-center gap-8">
          {[
            { label: "Scanner",  href: "#scanner-section" },
            { label: "Science",  href: "#features-section" },
            { label: "Beta",     href: "#beta-section" },
          ].map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="text-[10px] text-white/35 tracking-[0.2em] uppercase font-medium
                           hover:text-cyan-400 transition-colors duration-200"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* CTA */}
      <a
        href="#beta-section"
        className="text-[10px] tracking-[0.18em] uppercase font-bold text-black
                   bg-cyan-400 hover:bg-cyan-300 px-4 py-2 rounded-[2px]
                   transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,229,255,0.35)]
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-4"
        aria-label="Request early access to LogicBite"
      >
        Early Access
      </a>
    </header>
  );
}
