import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { getServerEnv } from "@/lib/env";
import "./globals.css";

// Fail fast on boot if Phase 2 required env is missing/invalid
getServerEnv();

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mathaka QR",
  description:
    "A respectful digital place to remember, while keeping family memories private.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-[#0B0D0F] font-sans text-[#F5F1E8] antialiased">
        {children}
      </body>
    </html>
  );
}
