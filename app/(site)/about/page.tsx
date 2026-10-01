import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutClient } from "./AboutClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mathaka QR helps organizations offer privacy-first digital memorials for families.",
};

export default function AboutPage() {
  return <AboutClient />;
}
