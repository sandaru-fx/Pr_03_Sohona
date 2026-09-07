import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerEnv } from "@/lib/env";
import "./globals.css";

// Fail fast on boot if Phase 2 required env is missing/invalid
getServerEnv();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sohona",
  description: "Secure digital legacy platform for temples and families",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
