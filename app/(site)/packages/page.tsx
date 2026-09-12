import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Clock3,
  FileAudio,
  FileImage,
  FileVideo,
  Lock,
  MessageCircle,
  Shield,
  Sparkles,
  TextQuote,
} from "lucide-react";
import {
  PACKAGE_CATALOG,
  PACKAGE_TIERS,
  SHARED_PACKAGE_LIMITS,
  type PackageTierId,
} from "@/lib/packages";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Mathaka QR memorial packages A, B, and C — same content limits, 25 / 50 / 100 year retention.",
};

const PACKAGE_STORIES: Record<
  PackageTierId,
  { name: string; blurb: string; bestFor: string; highlight?: boolean }
> = {
  A: {
    name: "Heritage",
    blurb:
      "A generation of remembrance — enough for family visits, temple gatherings, and quiet returns over decades.",
    bestFor: "Families planning a meaningful first memorial window.",
  },
  B: {
    name: "Continuum",
    blurb:
      "Half a century of care — chosen when families want the memorial to walk with children and grandchildren.",
    bestFor: "Temples offering a balanced long-horizon option.",
    highlight: true,
  },
  C: {
    name: "Legacy",
    blurb:
      "A full century of remembrance — the longest horizon, for families who want the story held for generations.",
    bestFor: "Enduring temple memorials and multi-generation families.",
  },
};

const SHARED_FEATURES = [
  {
    icon: FileImage,
    title: "Photographs",
    body: `Up to ${SHARED_PACKAGE_LIMITS.maxImages} private images, shown only on the memorial page.`,
  },
  {
    icon: FileVideo,
    title: "Video",
    body: `Up to ${SHARED_PACKAGE_LIMITS.maxVideoSeconds / 60} minute of video — short, respectful clips.`,
  },
  {
    icon: FileAudio,
    title: "Voice & audio",
    body: `Up to ${SHARED_PACKAGE_LIMITS.maxAudioSeconds / 60} minutes of voice or audio remembrance.`,
  },
  {
    icon: TextQuote,
    title: "Statements",
    body: `Up to ${SHARED_PACKAGE_LIMITS.maxStatementWords} words total in Sinhala or English.`,
  },
  {
    icon: MessageCircle,
    title: "QR comments",
    body: `Up to ${SHARED_PACKAGE_LIMITS.maxComments} visitor messages — first 5 up to 100 words, next 5 up to 150.`,
  },
  {
    icon: Lock,
    title: "Family PIN privacy",
    body: "Temple admin never sees private statements, media, or comments.",
  },
] as const;

const JOURNEY = [
  {
    title: "Temple chooses a package",
    body: "Staff create the memorial shell, select A, B, or C, and print the QR.",
  },
  {
    title: "Family completes setup",
    body: "With a private link and PIN, the family adds words and media at their pace.",
  },
  {
    title: "Retention begins",
    body: "The remembrance window starts only when setup is finished — not on create day.",
  },
] as const;

export default function PackagesPage() {
  const limits = SHARED_PACKAGE_LIMITS;

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-border bg-[#0B0D0F]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/packages-hero.jpg"
            alt="Vintage camera and family photographs on a wooden table"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[center_45%] brightness-[1.22] contrast-[1.05]"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[72%] max-w-2xl bg-gradient-to-r from-[#0B0D0F]/92 via-[#0B0D0F]/55 to-transparent sm:w-[56%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-[#0B0D0F]/25 to-transparent"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl flex-col justify-center px-10 pt-20 sm:px-14 lg:px-20 sm:pt-24">
          <div className="max-w-2xl rounded-2xl bg-[#0B0D0F]/50 px-6 py-8 backdrop-blur-[2px] sm:max-w-3xl sm:px-9 sm:py-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Packages
            </p>
            <h1 className="mt-4 font-sans text-5xl font-medium tracking-tight text-[#F5F1E8] sm:text-6xl sm:leading-tight lg:text-7xl">
              Three packages. Same privacy. Different years.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#F5F1E8]/90 sm:text-xl">
              Mathaka QR is not a public checkout. Your temple helps you choose
              the remembrance horizon — while every package keeps the same
              private content limits, PIN protection, and admin-blind privacy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex h-12 min-h-12 items-center rounded-xl bg-gold px-6 text-base font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90"
              >
                Speak with the temple
              </Link>
              <a
                href="#compare"
                className="inline-flex h-12 min-h-12 items-center rounded-xl border border-[#2A2E33] bg-[#181C20]/90 px-6 text-base font-medium text-[#F5F1E8] backdrop-blur-sm transition duration-300 hover:border-gold/40"
              >
                Compare packages
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Package cards */}
      <section
        id="compare"
        className="border-b border-[#2A2E33] bg-background-secondary"
      >
        <div className="mx-auto max-w-7xl px-10 py-28 sm:px-14 lg:px-20 sm:py-36">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
                Remembrance horizons
              </p>
              <h2 className="mt-3 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
                Choose how long the memory is kept
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-gray-500">
              Content is identical. Only retention years change. Pricing is
              arranged privately with your temple.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 lg:grid-cols-3">
            {PACKAGE_TIERS.map((tier, index) => {
              const item = PACKAGE_CATALOG[tier];
              const story = PACKAGE_STORIES[tier];
              return (
                <li
                  key={item.tier}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-2xl border bg-[#181C20] p-7 transition duration-300 sm:p-8",
                    story.highlight
                      ? "border-gold/50 shadow-[0_0_0_1px_rgba(201,164,92,0.12)]"
                      : "border-[#2A2E33] hover:border-gold/30",
                  )}
                >
                  {story.highlight ? (
                    <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold-subtle px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-gold">
                      <Sparkles className="h-3 w-3" aria-hidden />
                      Often chosen
                    </span>
                  ) : null}

                  <p className="text-sm tabular-nums text-gold/80">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Package {item.tier} · {story.name}
                  </p>
                  <h3 className="mt-2 font-sans text-xl font-medium text-[#F5F1E8]">
                    Package {item.tier}
                  </h3>
                  <p className="mt-5 font-sans text-5xl font-medium tracking-tight text-[#F5F1E8]">
                    {item.retentionYears}
                    <span className="ml-2 text-lg font-normal text-gray-400">
                      years
                    </span>
                  </p>
                  <p className="mt-5 flex-1 text-sm leading-7 text-gray-400">
                    {story.blurb}
                  </p>
                  <p className="mt-6 border-t border-[#2A2E33] pt-5 text-sm leading-7 text-gray-500">
                    Best for: {story.bestFor}
                  </p>
                  <ul className="mt-5 space-y-2.5 text-sm text-gray-400">
                    {[
                      "Same photo / video / audio limits",
                      "Same statement & comment caps",
                      "Family PIN + admin-blind privacy",
                      "Retention starts at setup complete",
                    ].map((line) => (
                      <li key={line} className="flex gap-2.5">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                          aria-hidden
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={cn(
                      "mt-8 inline-flex h-12 min-h-12 items-center justify-center rounded-xl text-sm font-medium transition duration-300",
                      story.highlight
                        ? "bg-gold text-[#0B0D0F] hover:opacity-90"
                        : "border border-[#2A2E33] text-[#F5F1E8] hover:border-gold/40",
                    )}
                  >
                    Ask the temple about Package {item.tier}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Voice reminder */}
      <section className="border-b border-[#2A2E33]">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-10 py-28 sm:grid-cols-2 sm:gap-20 lg:gap-24 sm:px-14 lg:px-20 sm:py-36">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#121518]">
            <Image
              src="/feature-voice.jpg"
              alt="Smartphone playing a private voice memory with headphones nearby"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-contain object-center"
            />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Every package includes
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
              Photos, voice, video, and words — same limits on A, B, and C.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              The remembrance horizon changes. The privacy model and content
              limits do not. Families keep a PIN; temple staff never open private
              media.
            </p>
          </div>
        </div>
      </section>

      {/* Shared limits */}
      <section className="border-b border-[#2A2E33]">
        <div className="mx-auto max-w-7xl px-10 py-28 sm:px-14 lg:px-20 sm:py-36">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Included in every package
          </p>
          <h2 className="mt-3 max-w-2xl font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
            Shared content limits
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-400">
            Whether you choose 25, 50, or 100 years, the memorial experience and
            privacy rules stay the same. Only the retention horizon changes.
          </p>

          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SHARED_FEATURES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="rounded-2xl border border-[#2A2E33] bg-[#181C20] p-6 transition duration-300 hover:border-gold/25"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-subtle text-gold">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-5 font-sans text-lg font-medium text-[#F5F1E8]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-400">{body}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm leading-7 text-gray-500">
            QR comments: first 5 up to 100 words each, next 5 up to 150 words
            each (max {limits.maxComments}). Temple admin never sees private
            statements, media, or comments.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-b border-[#2A2E33] bg-background-secondary">
        <div className="mx-auto max-w-7xl px-10 py-28 sm:px-14 lg:px-20 sm:py-36">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Side by side
          </p>
          <h2 className="mt-3 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
            What actually differs
          </h2>

          <div className="mt-12 overflow-x-auto rounded-2xl border border-[#2A2E33]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#181C20] text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium sm:px-6">Feature</th>
                  {PACKAGE_TIERS.map((tier) => (
                    <th
                      key={tier}
                      className="px-5 py-4 font-medium text-[#F5F1E8] sm:px-6"
                    >
                      Package {tier}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2E33] bg-[#0B0D0F]/40">
                <tr>
                  <td className="px-5 py-4 text-gray-400 sm:px-6">
                    Retention years
                  </td>
                  {PACKAGE_TIERS.map((tier) => (
                    <td
                      key={tier}
                      className="px-5 py-4 font-medium text-gold sm:px-6"
                    >
                      {PACKAGE_CATALOG[tier].retentionYears} years
                    </td>
                  ))}
                </tr>
                {[
                  ["Photos", `${limits.maxImages}`],
                  ["Video", `≤ ${limits.maxVideoSeconds}s`],
                  ["Audio", `≤ ${limits.maxAudioSeconds}s`],
                  ["Statement words", `≤ ${limits.maxStatementWords}`],
                  ["QR comments", `≤ ${limits.maxComments}`],
                  ["Admin sees private content", "Never"],
                  ["Family PIN for edits", "Always"],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="px-5 py-4 text-gray-400 sm:px-6">{label}</td>
                    {PACKAGE_TIERS.map((tier) => (
                      <td key={tier} className="px-5 py-4 text-[#F5F1E8] sm:px-6">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="border-b border-[#2A2E33]">
        <div className="mx-auto max-w-7xl px-10 py-28 sm:px-14 lg:px-20 sm:py-36">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            How packages work
          </p>
          <h2 className="mt-3 max-w-2xl font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
            From temple choice to living memorial
          </h2>
          <ol className="mt-14 grid gap-8 sm:grid-cols-3">
            {JOURNEY.map((item, index) => (
              <li key={item.title}>
                <p className="text-sm tabular-nums text-gold/80">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-sans text-xl font-medium text-[#F5F1E8]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Privacy + CTA */}
      <section className="bg-background-secondary">
        <div className="mx-auto grid max-w-7xl gap-16 px-10 py-28 sm:grid-cols-[1.2fr_0.8fr] sm:px-14 lg:px-20 sm:py-36">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-subtle text-gold">
              <Shield className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-6 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
              Privacy is identical across A, B, and C
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-gray-400">
              Longer years do not mean more exposure. Statements, media, and
              visitor comments stay family-controlled. Temple staff manage
              packages and QR infrastructure only.
            </p>
            <div className="mt-8 flex items-start gap-3 text-sm leading-7 text-gray-500">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <p>
                Your retention period begins when family setup is completed —
                not when the temple first creates the profile.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2A2E33] bg-[#181C20] p-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              Next step
            </p>
            <h3 className="mt-4 font-sans text-2xl font-medium text-[#F5F1E8]">
              Ready to discuss what fits your temple?
            </h3>
            <p className="mt-4 text-sm leading-7 text-gray-400">
              Contact us to arrange Package A, B, or C. There is no aggressive
              online checkout — just a calm conversation about remembrance.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex h-12 min-h-12 w-full items-center justify-center rounded-xl bg-gold px-6 text-sm font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90"
            >
              Contact us
            </Link>
            <Link
              href="/about"
              className="mt-3 inline-flex h-12 min-h-12 w-full items-center justify-center rounded-xl border border-[#2A2E33] text-sm font-medium text-[#F5F1E8] transition duration-300 hover:border-gold/40"
            >
              Learn about Mathaka QR
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
