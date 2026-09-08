import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { SiteChrome } from "@/components/site/SiteChrome";

const siteDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-site-display",
});

const siteSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-site-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Sohona",
    template: "%s · Sohona",
  },
  description:
    "Privacy-first digital memorials for temples and families — statements, media, and QR remembrance.",
};

const siteStyle = {
  "--site-bg": "#eef2ef",
  "--site-wash": "#e2e8e3",
  "--site-ink": "#1c2e24",
  "--site-muted": "#5a6b60",
  "--site-line": "#c8d2cb",
  "--site-accent": "#2f5a43",
  fontFamily: "var(--font-site-sans), ui-sans-serif, system-ui, sans-serif",
  backgroundColor: "var(--site-bg)",
} as CSSProperties;

/**
 * Day 9.5 — light public marketing shell (Home / About / Packages / Contact).
 * Does not wrap admin, setup, manage, or memorial view routes.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${siteDisplay.variable} ${siteSans.variable} min-h-full flex-1 text-[color:var(--site-ink)]`}
      style={siteStyle}
    >
      <SiteChrome>{children}</SiteChrome>
    </div>
  );
}
