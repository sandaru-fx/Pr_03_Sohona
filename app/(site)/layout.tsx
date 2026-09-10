import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/site/SiteChrome";

export const metadata: Metadata = {
  title: {
    default: "Sohona",
    template: "%s · Sohona",
  },
  description:
    "A respectful digital place to remember, while keeping family memories private.",
};

/**
 * Public marketing shell (Home / About / Packages / Contact / Family).
 * Uses global dark design tokens from root layout.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <SiteChrome>{children}</SiteChrome>
    </div>
  );
}
