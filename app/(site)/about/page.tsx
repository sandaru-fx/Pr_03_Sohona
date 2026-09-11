import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mathaka QR helps temples offer privacy-first digital memorials for families.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative min-h-[min(72vh,40rem)] overflow-hidden border-b border-[#2A2E33] sm:min-h-[min(78vh,46rem)]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/about-hero.jpg"
            alt="A family standing together at sunset"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[center_35%] brightness-[1.2] contrast-[1.05]"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#0B0D0F]/55 via-[#0B0D0F]/20 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-full max-w-2xl bg-gradient-to-r from-[#0B0D0F]/55 via-[#0B0D0F]/20 to-transparent sm:w-[50%]"
        />

        <div className="relative z-10 mx-auto flex min-h-[min(72vh,40rem)] w-full max-w-5xl flex-col justify-end px-6 pb-14 pt-28 sm:min-h-[min(78vh,46rem)] sm:pb-20 sm:pt-32">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            About
          </p>
          <h1 className="mt-4 max-w-3xl font-sans text-4xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl sm:leading-tight">
            Built for temples. Private for families.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-gray-300 sm:text-lg">
            Mathaka QR is a quiet digital memorial platform — remembrance with
            dignity, and privacy where it belongs.
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-24">
        <p className="text-lg leading-8 text-gray-400">
          Temples create the profile and QR. Families add words and media behind
          a PIN. Visitors remember with respect — without turning grief into
          engagement metrics.
        </p>

        <section className="mt-16 border-t border-[#2A2E33] pt-12">
          <h2 className="font-sans text-2xl font-medium tracking-tight text-[#F5F1E8] sm:text-3xl">
            What stays private
          </h2>
          <ul className="mt-8 space-y-4 text-base leading-8 text-gray-400">
            <li className="border-l border-gold/40 pl-4">
              Statements and personal messages
            </li>
            <li className="border-l border-gold/40 pl-4">
              Photos, video, and voice recordings
            </li>
            <li className="border-l border-gold/40 pl-4">
              Visitor comments on the QR memorial page
            </li>
          </ul>
          <p className="mt-8 text-base leading-8 text-gray-400">
            Temple administrators never see this content. They only manage
            memorial infrastructure — names, packages, links, and QR codes.
          </p>
        </section>

        <section className="mt-16 border-t border-[#2A2E33] pt-12">
          <h2 className="font-sans text-2xl font-medium tracking-tight text-[#F5F1E8] sm:text-3xl">
            Designed to feel calm
          </h2>
          <p className="mt-6 text-base leading-8 text-gray-400">
            No social feed. No public vault. Just a respectful place to preserve
            someone&apos;s memory — and keep family control where it belongs.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-flex h-12 min-h-12 items-center rounded-xl bg-gold px-6 text-sm font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90"
          >
            Speak with the temple
          </Link>
        </section>
      </div>
    </main>
  );
}
