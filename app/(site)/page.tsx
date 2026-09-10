import Link from "next/link";
import {
  PACKAGE_CATALOG,
  PACKAGE_TIERS,
  SHARED_PACKAGE_LIMITS,
} from "@/lib/packages";

export default function HomePage() {
  const limits = SHARED_PACKAGE_LIMITS;

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_0%,rgba(201,164,92,0.12),transparent_55%),radial-gradient(60%_50%_at_10%_90%,rgba(125,157,181,0.08),transparent_50%)]"
        />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-end px-6 pb-16 pt-24 sm:pb-24 sm:pt-28">
          <p className="sohona-fade-up font-display text-6xl tracking-tight text-foreground sm:text-7xl md:text-8xl">
            Sohona
          </p>
          <h1
            className="sohona-fade-up mt-6 max-w-2xl font-display text-2xl leading-snug text-foreground sm:text-3xl"
            style={{ animationDelay: "80ms" }}
          >
            Digital remembrance. Private by design.
          </h1>
          <p
            className="sohona-fade-up mt-4 max-w-xl text-base leading-7 text-foreground-secondary"
            style={{ animationDelay: "140ms" }}
          >
            A respectful digital place for temples and families to preserve
            meaningful memories — while keeping private content under family
            control.
          </p>
          <div
            className="sohona-fade-up mt-10 flex flex-wrap gap-3"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gold px-6 text-sm font-medium text-background transition hover:bg-gold-hover"
            >
              Create a Memorial
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-medium text-foreground transition hover:border-gold/40"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="text-sm tracking-wide text-gold">How Sohona works</p>
          <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
            Three quiet steps
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Temple creates the memorial",
                body: "Staff set up a name-only profile, choose a package, and share a private setup link with the family.",
              },
              {
                title: "Family preserves memories",
                body: "With a 6-digit PIN, the family adds statements, photos, video, and voice — never through a public account.",
              },
              {
                title: "Visitors remember via QR",
                body: "A unique QR opens a calm memorial page. Optional PIN keeps the most private moments protected.",
              },
            ].map((item, index) => (
              <li key={item.title}>
                <p className="text-xs text-foreground-muted">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-xl text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-foreground-secondary">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Privacy */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="text-sm tracking-wide text-gold">Privacy promise</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl text-foreground sm:text-4xl">
            Your memories remain private to your family.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-foreground-secondary">
            Temple administrators manage profiles, packages, and QR codes only.
            They cannot open statements, photos, videos, audio, or visitor
            comments. Privacy is not a setting — it is the product.
          </p>
        </div>
      </section>

      {/* Packages preview */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="text-sm tracking-wide text-gold">Packages</p>
          <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
            Same care. Different years.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-foreground-secondary">
            Content limits are identical. What changes is how long the memorial
            is designed to be kept. Retention begins when family setup is
            completed.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {PACKAGE_TIERS.map((tier) => {
              const item = PACKAGE_CATALOG[tier];
              return (
                <li
                  key={item.tier}
                  className="rounded-2xl border border-border bg-surface p-6"
                >
                  <p className="text-sm text-foreground-muted">
                    Package {item.tier}
                  </p>
                  <p className="mt-2 font-display text-3xl text-foreground">
                    {item.retentionYears} years
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground-secondary">
                    Up to {limits.maxImages} photos · video ≤{" "}
                    {limits.maxVideoSeconds}s · statements ≤{" "}
                    {limits.maxStatementWords} words
                  </p>
                </li>
              );
            })}
          </ul>
          <Link
            href="/packages"
            className="mt-8 inline-flex text-sm font-medium text-gold transition hover:text-gold-hover"
          >
            Compare packages
          </Link>
        </div>
      </section>

      {/* Memorial preview */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="text-sm tracking-wide text-gold">Memorial experience</p>
          <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
            A quiet space to remember
          </h2>
          <div className="mt-10 rounded-2xl border border-border bg-surface p-8 sm:p-10">
            <p className="text-xs tracking-wide text-foreground-muted">
              Preview
            </p>
            <p className="mt-4 font-display text-4xl text-foreground sm:text-5xl">
              In loving memory
            </p>
            <p className="mt-4 max-w-lg text-sm leading-7 text-foreground-secondary">
              Statements, photographs, and voice — arranged with space to
              breathe. Visitors leave respectful messages. No likes. No noise.
            </p>
          </div>
        </div>
      </section>

      {/* About + Contact CTA */}
      <section className="bg-background-secondary">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2 sm:py-20">
          <div>
            <h2 className="font-display text-3xl text-foreground">About</h2>
            <p className="mt-4 text-base leading-7 text-foreground-secondary">
              Built for temples that need a dignified way to support families —
              without turning remembrance into a social feed.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex text-sm font-medium text-gold transition hover:text-gold-hover"
            >
              Read more
            </Link>
          </div>
          <div>
            <h2 className="font-display text-3xl text-foreground">Contact</h2>
            <p className="mt-4 text-base leading-7 text-foreground-secondary">
              Speak with your temple about starting a memorial for someone you
              love.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-gold px-5 text-sm font-medium text-background transition hover:bg-gold-hover"
            >
              Contact the temple
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
