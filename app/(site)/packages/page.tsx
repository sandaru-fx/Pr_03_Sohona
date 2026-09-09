import type { Metadata } from "next";
import Link from "next/link";
import {
  PACKAGE_CATALOG,
  PACKAGE_TIERS,
  SHARED_PACKAGE_LIMITS,
} from "@/lib/packages";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Sohona memorial packages A, B, and C — same content limits, 25 / 50 / 100 year retention.",
};

export default function PackagesPage() {
  const limits = SHARED_PACKAGE_LIMITS;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-20">
      <p className="text-sm tracking-wide text-[color:var(--site-muted)]">
        Packages
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-site-display)] text-4xl tracking-tight text-[color:var(--site-ink)] sm:text-5xl">
        Three packages. Same privacy. Different years.
      </h1>
      <p className="mt-6 text-base leading-7 text-[color:var(--site-muted)]">
        Every package includes the same memorial content limits. What changes is
        how long the memorial is designed to be kept — 25, 50, or 100 years.
        Pricing is arranged with your temple, not sold as a public checkout.
      </p>

      <section className="mt-12 border-t border-[color:var(--site-line)] pt-8">
        <h2 className="text-lg font-medium text-[color:var(--site-ink)]">
          Shared content limits
        </h2>
        <ul className="mt-4 space-y-2 text-base leading-7 text-[color:var(--site-muted)]">
          <li>Video up to {limits.maxVideoSeconds / 60} minute</li>
          <li>Audio / voice up to {limits.maxAudioSeconds / 60} minutes</li>
          <li>Up to {limits.maxImages} images</li>
          <li>
            Statements up to {limits.maxStatementWords} words (Sinhala or
            English)
          </li>
          <li>
            QR comments: first 5 up to 100 words each, next 5 up to 150 words
            each (max {limits.maxComments})
          </li>
          <li>Temple admin never sees private statements, media, or comments</li>
        </ul>
      </section>

      <ol className="mt-14 space-y-10">
        {PACKAGE_TIERS.map((tier, index) => {
          const item = PACKAGE_CATALOG[tier];
          return (
            <li
              key={item.tier}
              className="border-t border-[color:var(--site-line)] pt-8"
            >
              <p className="text-sm text-[color:var(--site-muted)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-site-display)] text-3xl text-[color:var(--site-ink)]">
                Package {item.tier}
              </h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-[color:var(--site-muted)]">
                Designed for <strong className="font-medium text-[color:var(--site-ink)]">{item.retentionYears} years</strong> of
                remembrance — same media and word limits as the other packages.
              </p>
            </li>
          );
        })}
      </ol>

      <p className="mt-14 text-base leading-7 text-[color:var(--site-muted)]">
        Ready to discuss what fits your temple?{" "}
        <Link
          href="/contact"
          className="font-medium text-[color:var(--site-ink)] underline-offset-2 hover:underline"
        >
          Contact us
        </Link>
        .
      </p>
    </main>
  );
}
