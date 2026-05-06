import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LogicBite | AI-Powered Smart Food Scanner",
  description:
    "LogicBite uses advanced computer vision and the Gemini Vision API to decode your diet, extract multi-spectral nutritional data, and suggest micro-swaps for macro results.",
  keywords: [
    "AI food scanner",
    "nutritional analysis",
    "Gemini Vision",
    "smart diet",
    "LogicBite",
  ],
  authors: [{ name: "LogicBite Team" }],
  openGraph: {
    title: "LogicBite | Decode Your Diet with AI",
    description:
      "Scroll-driven AI food intelligence with structured Gemini Vision outputs and behavior-aware guidance.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogicBite | AI Food Scanner",
    description: "Decode your diet. Micro-swaps. Macro results.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="noise-overlay">
      <body className="bg-black antialiased">
        <div className="scanline" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
