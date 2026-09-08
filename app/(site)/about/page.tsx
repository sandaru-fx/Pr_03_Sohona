import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Sohona helps temples offer private digital memorials for families.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-20">
      <p className="text-sm tracking-wide text-[color:var(--site-muted)]">
        About
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-site-display)] text-4xl tracking-tight text-[color:var(--site-ink)] sm:text-5xl">
        Built for temples. Private for families.
      </h1>
      <p className="mt-6 text-base leading-7 text-[color:var(--site-muted)]">
        Sohona is a digital legacy platform: a memorial profile tied to a
        physical QR marker, held with care rather than put on public display.
      </p>

      <section className="mt-14 space-y-8">
        <div>
          <h2 className="text-lg font-medium text-[color:var(--site-ink)]">
            Temple staff
          </h2>
          <p className="mt-2 text-base leading-7 text-[color:var(--site-muted)]">
            Create a name-only profile, print the QR, and share a one-time setup
            link with the family. Admins never see private statements or media.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-medium text-[color:var(--site-ink)]">
            Families
          </h2>
          <p className="mt-2 text-base leading-7 text-[color:var(--site-muted)]">
            Set a 6-digit PIN, add words and private media, then keep a secret
            manage link for later edits. The manage link alone is never enough —
            the PIN always gates owner access.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-medium text-[color:var(--site-ink)]">
            Visitors
          </h2>
          <p className="mt-2 text-base leading-7 text-[color:var(--site-muted)]">
            Scan the monument QR to open the memorial. Families choose whether
            public viewing also asks for a PIN. Media stays in private storage
            and is shown only through short-lived signed links.
          </p>
        </div>
      </section>

      <p className="mt-14 text-base leading-7 text-[color:var(--site-muted)]">
        Looking for options for your temple?{" "}
        <Link
          href="/packages"
          className="font-medium text-[color:var(--site-ink)] underline-offset-2 hover:underline"
        >
          See packages
        </Link>{" "}
        or{" "}
        <Link
          href="/contact"
          className="font-medium text-[color:var(--site-ink)] underline-offset-2 hover:underline"
        >
          get in touch
        </Link>
        .
      </p>
    </main>
  );
}
