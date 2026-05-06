# LogicBite — AI-Powered Smart Food Scanner

A premium **scrollytelling landing page** built with Next.js 14, Framer Motion, and HTML5 Canvas. As users scroll, a 120-frame image sequence of a robotic scanner arm transitions into an exploded holographic engineering visualization.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
Logic-bite/
├── app/
│   ├── globals.css          # Design tokens, custom scrollbar, holographic effects
│   ├── layout.tsx           # Root layout with SEO metadata
│   └── page.tsx             # Landing page (Nav + ScrollySequence + Features + Footer)
├── components/
│   ├── ScrollySequence.tsx  # Core canvas animation + text overlays
│   └── __tests__/
│       └── ScrollySequence.test.tsx  # Vitest + RTL test suite
├── hooks/
│   └── useGeminiVision.ts   # Gemini 1.5 Pro Vision API hook
├── lib/
│   └── firebase.ts          # Firebase Auth + Firestore + Storage init
├── public/
│   └── sequence/            # Place 120 WebP frames here: frame_001.webp … frame_120.webp
└── scripts/
    └── generate-placeholder-frames.mjs  # Dev: generate black placeholder frames
```

---

## 🖼️ Image Sequence Setup

Place 120 WebP frames in `/public/sequence/`:

```
public/sequence/frame_001.webp
public/sequence/frame_002.webp
...
public/sequence/frame_120.webp
```

**For development**, generate placeholder frames:
```bash
npm install canvas   # Node.js canvas package
node scripts/generate-placeholder-frames.mjs
```

**For production**: Export frames from After Effects / Blender / Cinema 4D at 1920×1080px with pure black (`#000000`) background so they blend seamlessly with the page.

---

## 🔑 Environment Variables

Create `.env.local`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

---

## 🧪 Tests

```bash
npm test          # Run once
npm run test:watch  # Watch mode
```

Tests are in `components/__tests__/ScrollySequence.test.tsx` and cover:
- Initial render
- Canvas ARIA attributes (`role="img"`, `aria-label`)
- Screen-reader live region (`aria-live="polite"`)
- Loading progress bar accessibility
- Scroll container label

---

## ♿ Accessibility

| Feature | Implementation |
|---|---|
| Canvas description | `role="img"` + descriptive `aria-label` |
| Screen reader narration | `aria-live="polite"` region updated per beat |
| Skip navigation | Skip-to-content link for keyboard users |
| Loading state | `role="progressbar"` with `aria-valuenow` |
| Navigation | Semantic `<header>`, `<nav>`, `<main>`, `<footer>` |
| Interactive elements | `aria-label` on all buttons and links |
| Focus management | `focus-visible` styles on all interactive elements |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom CSS vars |
| Animation | Framer Motion 11 |
| Canvas | HTML5 Canvas API (120-frame sequence) |
| Testing | Vitest + React Testing Library |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Cloud Firestore |
| AI | Google Gemini 1.5 Pro Vision API |

---

## 📊 Performance Notes

- All 120 frames are preloaded before revealing the experience
- RAF loop only fires when the frame index actually changes
- Canvas DPR-aware rendering for sharp retina displays
- Dynamic import of `ScrollySequence` prevents SSR canvas errors
- `useSpring({ stiffness: 100, damping: 30 })` for 60fps smooth playback
