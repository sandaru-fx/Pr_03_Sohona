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
      <p className="text-sm tracking-wide text-gold">Packages</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        Three packages. Same privacy. Different years.
      </h1>
      <p className="mt-6 text-base leading-7 text-foreground-secondary">
        Every package includes the same memorial content limits. What changes is
        how long the memorial is designed to be kept. Pricing is arranged with
        your temple — not sold as a public checkout.
      </p>
      <p className="mt-4 text-sm leading-6 text-foreground-muted">
        Your retention period begins when family setup is completed.
      </p>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-display text-2xl text-foreground">
          Shared content limits
        </h2>
        <ul className="mt-4 space-y-2 text-base leading-7 text-foreground-secondary">
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
          <li>
            Temple admin never sees private statements, media, or comments
          </li>
        </ul>
      </section>

      <ol className="mt-14 space-y-8">
        {PACKAGE_TIERS.map((tier, index) => {
          const item = PACKAGE_CATALOG[tier];
          return (
            <li
              key={item.tier}
              className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
            >
              <p className="text-sm text-foreground-muted">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-display text-3xl text-foreground">
                Package {item.tier}
              </h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-foreground-secondary">
                Designed for{" "}
                <strong className="font-medium text-foreground">
                  {item.retentionYears} years
                </strong>{" "}
                of remembrance — same media and word limits as the other
                packages.
              </p>
            </li>
          );
        })}
      </ol>

      <p className="mt-14 text-base leading-7 text-foreground-secondary">
        Ready to discuss what fits your temple?{" "}
        <Link
          href="/contact"
          className="font-medium text-gold underline-offset-2 hover:underline"
        >
          Contact us
        </Link>
        .
      </p>
    </main>
  );
}
