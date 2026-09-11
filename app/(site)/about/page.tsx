import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mathaka QR helps temples offer privacy-first digital memorials for families.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-border bg-[#0B0D0F]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/about-hero.jpg"
            alt="A family standing together at sunset"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[center_35%] brightness-[1.2] contrast-[1.05]"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[70%] max-w-2xl bg-gradient-to-r from-[#0B0D0F]/90 via-[#0B0D0F]/50 to-transparent sm:w-[54%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-[#0B0D0F]/25 to-transparent"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl flex-col justify-center px-10 pt-20 sm:px-14 lg:px-20 sm:pt-24">
          <div className="max-w-xl rounded-2xl bg-[#0B0D0F]/45 px-6 py-8 backdrop-blur-[2px] sm:max-w-2xl sm:px-9 sm:py-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.75)]">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              About
            </p>
            <h1 className="mt-4 font-sans text-5xl font-medium tracking-tight text-[#F5F1E8] sm:text-6xl sm:leading-tight">
              Built for temples. Private for families.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#F5F1E8]/90 sm:text-xl">
              Mathaka QR is a quiet digital memorial platform — remembrance with
              dignity, and privacy where it belongs.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-10 py-24 sm:px-14 lg:px-20 sm:py-32">
          <p className="text-xl leading-9 text-gray-400 sm:text-2xl sm:leading-10">
            Temples create the profile and QR. Families add words and media
            behind a PIN. Visitors remember with respect — without turning grief
            into engagement metrics.
          </p>
        </div>
      </section>

      {/* Family visual */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-10 py-28 sm:grid-cols-2 sm:gap-20 lg:gap-24 sm:px-14 lg:px-20 sm:py-36">
          <div className="relative min-h-[22rem] overflow-hidden rounded-xl sm:min-h-[32rem] lg:min-h-[36rem]">
            <Image
              src="/feature-family.jpg"
              alt="Family sitting together watching a sunset over the water"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover object-[center_55%]"
            />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Why it exists
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
              Remembrance should not feel like a social network.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Mathaka QR was shaped for temple communities and families who want
              a calm digital place — photographs, voice, and words — held with
              dignity, not displayed for attention.
            </p>
            <p className="mt-5 text-lg leading-8 text-gray-400">
              The temple helps start the memorial. The family keeps the keys to
              what stays private.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-10 py-28 sm:grid-cols-2 sm:gap-20 lg:gap-24 sm:px-14 lg:px-20 sm:py-36">
          <div className="order-2 sm:order-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              What stays private
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
              Family memories stay under family control.
            </h2>
            <ul className="mt-8 space-y-4 text-lg leading-8 text-gray-400">
              <li className="border-l border-gold/40 pl-4">
                Statements and personal messages
              </li>
              <li className="border-l border-gold/40 pl-4">
                Photos, video, and voice recordings
              </li>
              <li className="border-l border-gold/40 pl-4">
                Visitor comments on the QR memorial page
              </li>
            </ul>
            <p className="mt-8 text-lg leading-8 text-gray-400">
              Temple administrators never see this content. They only manage
              memorial infrastructure — names, packages, links, and QR codes.
            </p>
          </div>
          <div className="relative order-1 min-h-[22rem] overflow-hidden rounded-xl sm:order-2 sm:min-h-[32rem] lg:min-h-[36rem]">
            <Image
              src="/feature-privacy.jpg"
              alt="Locked journal representing private family memories"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover object-[center_40%]"
            />
          </div>
        </div>
      </section>

      {/* Calm design */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-10 py-28 sm:grid-cols-2 sm:gap-20 lg:gap-24 sm:px-14 lg:px-20 sm:py-36">
          <div className="relative min-h-[22rem] overflow-hidden rounded-xl sm:min-h-[32rem] lg:min-h-[36rem]">
            <Image
              src="/feature-words.jpg"
              alt="Handwritten note saying Always with you"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Designed to feel calm
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
              No feed. No vault. Just a place to remember.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              The memorial page is quiet by intention — space for a name,
              statements, media, and respectful visitor messages. Nothing here
              is built for likes, streaks, or public ranking.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-flex h-12 min-h-12 items-center rounded-xl bg-gold px-6 text-base font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90"
            >
              Speak with the temple
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
