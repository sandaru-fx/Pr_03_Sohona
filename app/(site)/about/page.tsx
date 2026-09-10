import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sohona helps temples offer privacy-first digital memorials for families.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-20">
      <p className="text-sm tracking-wide text-gold">About</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        Built for temples. Private for families.
      </h1>
      <p className="mt-6 text-base leading-7 text-foreground-secondary">
        Sohona is a quiet digital memorial platform. Temples create the
        profile and QR. Families add words and media behind a PIN. Visitors
        remember with respect — without turning grief into engagement metrics.
      </p>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-display text-2xl text-foreground">
          What stays private
        </h2>
        <ul className="mt-4 space-y-3 text-base leading-7 text-foreground-secondary">
          <li>Statements and personal messages</li>
          <li>Photos, video, and voice recordings</li>
          <li>Visitor comments on the QR memorial page</li>
        </ul>
        <p className="mt-6 text-base leading-7 text-foreground-secondary">
          Temple administrators never see this content. They only manage
          memorial infrastructure — names, packages, links, and QR codes.
        </p>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-display text-2xl text-foreground">
          Designed to feel calm
        </h2>
        <p className="mt-4 text-base leading-7 text-foreground-secondary">
          No social feed. No public vault. Just a respectful place to preserve
          someone&apos;s memory — and keep family control where it belongs.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex h-11 items-center rounded-xl bg-gold px-5 text-sm font-medium text-background transition hover:bg-gold-hover"
        >
          Speak with the temple
        </Link>
      </section>
    </main>
  );
}
