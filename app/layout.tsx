import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LogicBite — AI-Powered Smart Food Scanner",
  description:
    "LogicBite uses advanced computer vision and the Gemini Vision API to decode your diet, extract multi-spectral nutritional data, and suggest micro-swaps for macro results. Join the beta today.",
  keywords: [
    "AI food scanner",
    "nutritional analysis",
    "Gemini Vision",
    "smart diet",
    "LogicBite",
  ],
  authors: [{ name: "LogicBite Team" }],
  openGraph: {
    title: "LogicBite — Decode Your Diet with AI",
    description:
      "Scroll-driven AI food intelligence. Beyond calorie counting.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogicBite — AI Food Scanner",
    description: "Decode your diet. Micro-swaps. Macro results.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="noise-overlay">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-black antialiased">
        {/* Ambient scanline effect */}
        <div className="scanline" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
