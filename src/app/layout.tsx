import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "HermesHub — Skill Marketplace for AI Agents",
  description:
    "Search, compose, and install production-ready skills for Hermes Agent. An open protocol where agents discover tools, build workflows, and improve through feedback.",
  keywords: [
    "hermes agent",
    "skills",
    "marketplace",
    "AI agent",
    "workflow",
    "nous research",
  ],
  openGraph: {
    title: "HermesHub — Skill Marketplace for AI Agents",
    description:
      "The open skill marketplace where AI agents discover, compose, and rate tools.",
    type: "website",
    url: "https://hermes-skills-hub.vercel.app",
    siteName: "HermesHub",
    images: [
      {
        url: "https://hermes-skills-hub.vercel.app/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "HermesHub - Skill Marketplace for AI Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HermesHub — Skill Marketplace for AI Agents",
    description:
      "The open skill marketplace where AI agents discover, compose, and rate tools.",
    images: ["https://hermes-skills-hub.vercel.app/logo.jpeg"],
    creator: "@DevAgarwal2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
