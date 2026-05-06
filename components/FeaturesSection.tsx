export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="9" stroke="#00e5ff" strokeWidth="1.3"/>
          <path d="M7 11l3 3 5-5" stroke="#00e5ff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Gemini Vision Scanning",
      body: "Multi-spectral nutritional extraction from a single photo. No barcodes. No manual input. Pure vision AI.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="7" height="7" stroke="#00e5ff" strokeWidth="1.3"/>
          <rect x="13" y="2" width="7" height="7" stroke="#00e5ff" strokeWidth="1.3"/>
          <rect x="2" y="13" width="7" height="7" stroke="#00e5ff" strokeWidth="1.3"/>
          <path d="M13 16h6M16 13v6" stroke="#00e5ff" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
      title: "Behaviour Profiling",
      body: "Cross-referenced with your eating history to surface painless micro-swaps that compound into macro results.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M3 19L7 11l4 4 4-7 4 11" stroke="#00e5ff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Trend Intelligence",
      body: "Weekly nutritional trends, inflammation scores, and longevity-weighted meal scoring — stored in Firebase.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 3v4M11 15v4M3 11h4M15 11h4" stroke="#00e5ff" strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="11" cy="11" r="4" stroke="#00e5ff" strokeWidth="1.3"/>
        </svg>
      ),
      title: "Instant Micro-Swaps",
      body: "AI-generated substitution suggestions calibrated to your taste profile, goals, and local availability.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="16" height="12" rx="1" stroke="#00e5ff" strokeWidth="1.3"/>
          <path d="M7 9h8M7 13h5" stroke="#00e5ff" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
      title: "Contextual Reports",
      body: "Daily digest with macro breakdowns, streak scores, and actionable week-over-week improvement metrics.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 3C6.58 3 3 6.58 3 11s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" stroke="#00e5ff" strokeWidth="1.3"/>
          <path d="M11 7v4l3 3" stroke="#00e5ff" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
      title: "Real-Time Processing",
      body: "Sub-2-second nutritional analysis powered by Gemini 1.5 Pro with 94%+ accuracy on 40k+ food items.",
    },
  ];

  return (
    <section
      id="features-section"
      className="relative z-10 bg-black py-28 px-6 md:px-10 border-t border-white/[0.04]"
      aria-labelledby="features-heading"
    >
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 flex flex-col gap-3">
          <span className="text-[9px] tracking-[0.4em] text-cyan-400/60 uppercase font-medium">
            Core Capabilities
          </span>
          <h2
            id="features-heading"
            className="text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            Intelligence at every{" "}
            <span className="holo-text">byte.</span>
          </h2>
        </header>

        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-px bg-white/[0.04]" role="list">
          {features.map((f) => (
            <li
              key={f.title}
              className="bg-black p-8 flex flex-col gap-5 group hover:bg-white/[0.02] transition-colors duration-300"
            >
              <div
                className="w-10 h-10 border border-cyan-400/20 rounded-[2px]
                           flex items-center justify-center
                           group-hover:border-cyan-400/50 transition-colors duration-300"
              >
                {f.icon}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-white font-semibold tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/30 leading-relaxed">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
