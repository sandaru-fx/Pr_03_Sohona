import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Full-bleed atmospheric plane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 site-hero-plane"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] site-hero-mist"
      />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-end px-6 pb-16 pt-24 sm:pb-24 sm:pt-28">
        <p
          className="site-fade-up font-[family-name:var(--font-site-display)] text-6xl leading-none tracking-tight text-[color:var(--site-ink)] sm:text-7xl md:text-8xl"
          style={{ animationDelay: "40ms" }}
        >
          Sohona
        </p>
        <h1
          className="site-fade-up mt-6 max-w-xl text-xl font-medium leading-snug text-[color:var(--site-ink)] sm:text-2xl"
          style={{ animationDelay: "120ms" }}
        >
          A quiet digital memorial for the ones we keep remembering.
        </h1>
        <p
          className="site-fade-up mt-4 max-w-md text-base leading-7 text-[color:var(--site-muted)]"
          style={{ animationDelay: "200ms" }}
        >
          Temples create the profile. Families add private words and media.
          Visitors find remembrance through a unique QR — never an open vault.
        </p>
        <div
          className="site-fade-up mt-10 flex flex-wrap gap-3"
          style={{ animationDelay: "280ms" }}
        >
          <Link
            href="/about"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[color:var(--site-ink)] px-6 text-sm font-medium text-[color:var(--site-bg)] transition hover:bg-[color:var(--site-accent)]"
          >
            Learn about Sohona
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[color:var(--site-line)] bg-white/50 px-6 text-sm font-medium text-[color:var(--site-ink)] backdrop-blur-sm transition hover:bg-white/80"
          >
            Contact the temple
          </Link>
        </div>
      </section>
    </main>
  );
}
