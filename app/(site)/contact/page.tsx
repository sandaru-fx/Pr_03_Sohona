import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the temple about Sohona digital memorials.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-20">
      <p className="text-sm tracking-wide text-[color:var(--site-muted)]">
        Contact
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-site-display)] text-4xl tracking-tight text-[color:var(--site-ink)] sm:text-5xl">
        Speak with the temple.
      </h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-[color:var(--site-muted)]">
        Families receive setup and manage links from temple staff — not from
        this public page. Use the details below to ask about memorial packages
        or program setup.
      </p>

      <div className="mt-12 space-y-6 border-t border-[color:var(--site-line)] pt-10">
        <div>
          <h2 className="text-sm font-medium text-[color:var(--site-ink)]">
            Email
          </h2>
          <a
            href="mailto:temple@sohona.example"
            className="mt-2 inline-block text-lg text-[color:var(--site-accent)] underline-offset-4 hover:underline"
          >
            temple@sohona.example
          </a>
          <p className="mt-2 text-sm text-[color:var(--site-muted)]">
            Placeholder address for Day 9 — replace with your temple contact
            before launch.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-[color:var(--site-ink)]">
            Temple admin
          </h2>
          <p className="mt-2 text-base leading-7 text-[color:var(--site-muted)]">
            Staff already on the allow-list can{" "}
            <Link
              href="/login"
              className="font-medium text-[color:var(--site-ink)] underline-offset-2 hover:underline"
            >
              sign in here
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
