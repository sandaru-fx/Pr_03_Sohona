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
    "Mathaka QR memorial packages A, B, and C — same content limits, 25 / 50 / 100 year retention.",
};

export default function PackagesPage() {
  const limits = SHARED_PACKAGE_LIMITS;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 sm:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
        Packages
      </p>
      <h1 className="mt-4 font-sans text-4xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl sm:leading-tight">
        Three packages. Same privacy. Different years.
      </h1>
      <p className="mt-8 text-lg leading-8 text-gray-400">
        Every package includes the same memorial content limits. What changes is
        how long the memorial is designed to be kept. Pricing is arranged with
        your temple — not sold as a public checkout.
      </p>
      <p className="mt-4 text-sm leading-7 text-gray-500">
        Your retention period begins when family setup is completed.
      </p>

      <section className="mt-16 border-t border-[#2A2E33] pt-12">
        <h2 className="font-sans text-2xl font-medium tracking-tight text-[#F5F1E8]">
          Shared content limits
        </h2>
        <ul className="mt-8 space-y-3 text-base leading-8 text-gray-400">
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

      <ol className="mt-16 space-y-4">
        {PACKAGE_TIERS.map((tier, index) => {
          const item = PACKAGE_CATALOG[tier];
          return (
            <li
              key={item.tier}
              className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 sm:px-8 sm:py-10"
            >
              <p className="text-sm tabular-nums text-gold/80">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-sans text-2xl font-medium tracking-tight text-[#F5F1E8] sm:text-3xl">
                Package {item.tier}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-gray-400">
                Designed for{" "}
                <span className="font-medium text-[#F5F1E8]">
                  {item.retentionYears} years
                </span>{" "}
                of remembrance — same media and word limits as the other
                packages.
              </p>
            </li>
          );
        })}
      </ol>

      <p className="mt-16 text-base leading-8 text-gray-400">
        Ready to discuss what fits your temple?{" "}
        <Link
          href="/contact"
          className="font-medium text-gold transition-opacity duration-300 hover:opacity-80"
        >
          Contact us
        </Link>
        .
      </p>
    </main>
  );
}
