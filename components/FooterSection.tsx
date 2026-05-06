export default function FooterSection() {
  return (
    <footer
      className="relative z-10 bg-black border-t border-white/[0.04] py-16 px-6 md:px-10"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
        <div className="flex flex-col gap-3 max-w-xs">
          <span className="text-white font-bold tracking-tight">
            Logic<span className="text-cyan-400">Bite</span>
          </span>
          <p className="text-xs text-white/20 leading-relaxed">
            AI-powered food intelligence. Built on Gemini Vision.
            Designed for humans who want to eat smarter without the friction.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-6">
            {["Privacy", "Terms", "Contact", "GitHub", "Docs"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-[9px] text-white/20 tracking-widest uppercase
                             hover:text-white/50 transition-colors duration-200"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 items-start md:items-end">
          {["Gemini Vision API", "Firebase Auth", "Next.js 14", "Framer Motion"].map((tech) => (
            <span key={tech} className="text-[8px] tracking-[0.25em] uppercase text-cyan-400/30 font-mono">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/[0.03] flex items-center justify-between">
        <p className="text-[9px] text-white/10 tracking-widest">
          © {new Date().getFullYear()} LogicBite. All rights reserved.
        </p>
        <span className="text-[8px] font-mono text-cyan-400/15">v0.1.0-beta</span>
      </div>
    </footer>
  );
}
