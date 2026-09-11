import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the temple about a Mathaka QR digital memorial.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-border bg-[#0B0D0F]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/contact-hero.jpg"
            alt="Journal and coffee overlooking a sunrise valley"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[center_40%] brightness-[1.25] contrast-[1.05]"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[70%] max-w-2xl bg-gradient-to-r from-[#0B0D0F]/88 via-[#0B0D0F]/45 to-transparent sm:w-[52%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-[#0B0D0F]/25 to-transparent"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl flex-col justify-center px-10 pt-20 sm:px-14 lg:px-20 sm:pt-24">
          <div className="max-w-xl rounded-2xl bg-[#0B0D0F]/45 px-6 py-8 backdrop-blur-[2px] sm:max-w-2xl sm:px-9 sm:py-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.75)]">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Contact
            </p>
            <h1 className="mt-4 font-sans text-5xl font-medium tracking-tight text-[#F5F1E8] sm:text-6xl sm:leading-tight">
              Speak with the temple
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#F5F1E8]/90 sm:text-xl">
              Memorials begin with a quiet conversation. Reach out to arrange a
              package and receive your family setup link.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-10 py-24 sm:grid-cols-2 sm:gap-20 lg:gap-24 sm:px-14 lg:px-20 sm:py-32">
          <div className="relative min-h-[22rem] overflow-hidden rounded-xl sm:min-h-[32rem] lg:min-h-[36rem]">
            <Image
              src="/feature-words.jpg"
              alt="Handwritten note and pen by candlelight"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              How to begin
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
              A quiet conversation starts the memorial.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Reach out to your temple to choose a package, create the memorial
              shell, and receive a private family setup link. There is no public
              checkout — care stays personal.
            </p>
            <ol className="mt-8 space-y-4 text-base leading-7 text-gray-400">
              <li className="border-l border-gold/40 pl-4">
                01 — Email or visit the temple
              </li>
              <li className="border-l border-gold/40 pl-4">
                02 — Choose package A, B, or C together
              </li>
              <li className="border-l border-gold/40 pl-4">
                03 — Family completes setup with a PIN
              </li>
            </ol>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl flex-1 px-10 py-24 sm:px-14 lg:px-20 sm:py-32">
        <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-8 py-10 sm:px-10 sm:py-12">
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
            Email
          </h2>
          <a
            href="mailto:temple@sohona.example"
            className="mt-4 inline-flex font-sans text-xl font-medium text-gold transition-opacity duration-300 hover:opacity-80 sm:text-2xl"
          >
            temple@sohona.example
          </a>
          <p className="mt-5 text-base leading-7 text-gray-500">
            Replace this address with your temple&apos;s real contact when you
            go live. Until then, temple staff can also use admin sign-in.
          </p>
        </section>

        <p className="mt-12 text-base text-gray-400">
          Temple staff?{" "}
          <Link
            href="/login"
            className="font-medium text-gold transition-opacity duration-300 hover:opacity-80"
          >
            Sign in here
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
