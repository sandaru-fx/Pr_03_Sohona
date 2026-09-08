import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Packages",
  description: "Light package outline for temple digital memorial programs.",
};

const packages = [
  {
    name: "Remembrance",
    line: "One memorial profile, QR marker support, family setup, and private manage access.",
  },
  {
    name: "Continuance",
    line: "Several memorials for ongoing temple programs, with the same privacy rules for every family.",
  },
  {
    name: "Sanctuary",
    line: "Larger temple programs — talk with us about volume, training, and long-term care.",
  },
] as const;

export default function PackagesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-20">
      <p className="text-sm tracking-wide text-[color:var(--site-muted)]">
        Packages
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-site-display)] text-4xl tracking-tight text-[color:var(--site-ink)] sm:text-5xl">
        Simple offerings. Same privacy promise.
      </h1>
      <p className="mt-6 text-base leading-7 text-[color:var(--site-muted)]">
        This is a light outline for conversations with temple administrators.
        Pricing and exact limits are arranged with your temple — not sold as a
        public checkout.
      </p>

      <ol className="mt-14 space-y-10">
        {packages.map((item, index) => (
          <li key={item.name} className="border-t border-[color:var(--site-line)] pt-8">
            <p className="text-sm text-[color:var(--site-muted)]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-site-display)] text-3xl text-[color:var(--site-ink)]">
              {item.name}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-[color:var(--site-muted)]">
              {item.line}
            </p>
          </li>
        ))}
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
