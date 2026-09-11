import Image from "next/image";
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
      {/* Hero — brand + one headline + CTAs over full-bleed image */}
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden border-b border-border bg-[#0B0D0F]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-plaque-v8.jpg"
            alt="Mathaka QR memorial plaque with candle, flowers, and sunset frame"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[72%_45%] sm:object-[65%_45%]"
          />
        </div>
        {/* Soft left wash for copy only — plaque, candle, and warmth stay untouched on the right */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[62%] max-w-xl bg-gradient-to-r from-[#0B0D0F]/85 via-[#0B0D0F]/40 to-transparent sm:w-[48%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-[#0B0D0F]/30 to-transparent"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center px-6 pt-20 sm:pt-28">
          <div className="max-w-md [text-shadow:0_1px_3px_rgba(0,0,0,0.55)] sm:max-w-lg">
            <p className="sohona-fade-up font-sans text-5xl font-semibold tracking-tight text-[#F5F1E8] sm:text-6xl md:text-7xl">
              Mathaka QR
            </p>
            <h1
              className="sohona-fade-up mt-5 font-sans text-xl font-medium leading-snug tracking-tight text-[#F5F1E8] sm:mt-6 sm:text-2xl md:text-[1.75rem] md:leading-snug"
              style={{ animationDelay: "80ms" }}
            >
              Digital remembrance. Private by design.
            </h1>
            <p
              className="sohona-fade-up mt-5 max-w-md font-sans text-base leading-7 text-[#e4dfd4] sm:text-[1.05rem] sm:leading-8"
              style={{ animationDelay: "140ms" }}
            >
              A respectful digital place for temples and families — private
              memories stay under family control.
            </p>
          </div>
          <div
            className="sohona-fade-up mt-10 flex flex-wrap gap-3"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              href="/contact"
              className="inline-flex h-12 min-h-12 items-center justify-center rounded-xl bg-gold px-7 font-sans text-sm font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90"
            >
              Create a Memorial
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 min-h-12 items-center justify-center rounded-xl border border-[#2A2E33] bg-[#181C20]/90 px-7 font-sans text-sm font-medium text-[#F5F1E8] backdrop-blur-sm transition duration-300 hover:border-gold/40"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            How Mathaka QR works
          </p>
          <h2 className="mt-4 max-w-xl font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
            Three quiet steps
          </h2>
          <ol className="mt-14 grid gap-12 sm:grid-cols-3 sm:gap-10">
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
              <li key={item.title} className="sohona-fade-up">
                <p className="font-sans text-sm tabular-nums text-gold/80">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-sans text-lg font-medium leading-snug text-[#F5F1E8] sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-7 text-gray-400">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Privacy */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Privacy promise
          </p>
          <h2 className="mt-4 max-w-2xl font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl sm:leading-tight">
            Your memories remain private to your family.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-gray-400 sm:text-lg">
            Temple administrators manage profiles, packages, and QR codes only.
            They cannot open statements, photos, videos, audio, or visitor
            comments. Privacy is not a setting — it is the product.
          </p>
        </div>
      </section>

      {/* Packages preview */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Packages
          </p>
          <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
            Same care. Different years.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-gray-400">
            Content limits are identical. What changes is how long the memorial
            is designed to be kept. Retention begins when family setup is
            completed.
          </p>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[#2A2E33] bg-[#2A2E33] sm:grid-cols-3">
            {PACKAGE_TIERS.map((tier) => {
              const item = PACKAGE_CATALOG[tier];
              return (
                <li
                  key={item.tier}
                  className="bg-[#181C20] px-6 py-8 sm:px-8 sm:py-10"
                >
                  <p className="text-sm text-gray-500">Package {item.tier}</p>
                  <p className="mt-3 font-sans text-4xl font-medium tracking-tight text-[#F5F1E8]">
                    {item.retentionYears}
                    <span className="ml-1 text-lg font-normal text-gray-400">
                      years
                    </span>
                  </p>
                  <p className="mt-4 text-sm leading-7 text-gray-400">
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
            className="mt-10 inline-flex text-sm font-medium text-gold transition-opacity duration-300 hover:opacity-80"
          >
            Compare packages →
          </Link>
        </div>
      </section>

      {/* Memorial preview */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Memorial experience
          </p>
          <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
            A quiet space to remember
          </h2>
          <div className="relative mt-14 overflow-hidden rounded-2xl border border-[#2A2E33]">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(70%_80%_at_80%_20%,rgba(201,164,92,0.12),transparent_55%)]"
            />
            <div className="relative px-8 py-14 sm:px-14 sm:py-20">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                Preview
              </p>
              <p className="mt-6 font-sans text-4xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl">
                In loving memory
              </p>
              <p className="mt-5 max-w-md text-base leading-8 text-gray-400">
                Statements, photographs, and voice — arranged with space to
                breathe. Visitors leave respectful messages. No likes. No noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About + Contact */}
      <section className="bg-background-secondary">
        <div className="mx-auto grid max-w-5xl gap-16 px-6 py-24 sm:grid-cols-2 sm:gap-12 sm:py-28">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              About
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
              Built for temples
            </h2>
            <p className="mt-5 text-base leading-8 text-gray-400">
              A dignified way to support families — without turning remembrance
              into a social feed.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex text-sm font-medium text-gold transition-opacity duration-300 hover:opacity-80"
            >
              Read more →
            </Link>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              Contact
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
              Begin with a conversation
            </h2>
            <p className="mt-5 text-base leading-8 text-gray-400">
              Speak with your temple about starting a memorial for someone you
              love.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex h-12 min-h-12 items-center rounded-xl bg-gold px-6 text-sm font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90"
            >
              Contact the temple
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
