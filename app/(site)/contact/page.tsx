import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the temple about a Mathaka QR digital memorial.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative min-h-[min(70vh,38rem)] overflow-hidden border-b border-[#2A2E33] bg-[#0B0D0F] sm:min-h-[min(75vh,44rem)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/contact-hero.jpg"
          alt="Journal and coffee overlooking a sunrise valley"
          className="absolute inset-0 z-0 h-full w-full object-cover object-[center_40%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#0B0D0F] via-[#0B0D0F]/70 to-[#0B0D0F]/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-full max-w-3xl bg-gradient-to-r from-[#0B0D0F]/90 to-transparent sm:w-[58%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-2/5 bg-gradient-to-t from-[#0B0D0F]/70 to-transparent"
        />

        <div className="relative z-10 mx-auto flex min-h-[min(70vh,38rem)] w-full max-w-5xl flex-col justify-end px-6 pb-14 pt-28 sm:min-h-[min(75vh,44rem)] sm:pb-20 sm:pt-32">
          <div className="max-w-2xl [text-shadow:0_1px_2px_rgba(0,0,0,0.65),0_8px_24px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              Contact
            </p>
            <h1 className="mt-4 font-sans text-4xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl sm:leading-tight">
              Speak with the temple
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#d6d1c7]">
              Memorials begin with a quiet conversation. Reach out to arrange a
              package and receive your family setup link.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-24">
        <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 sm:px-8 sm:py-10">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Email
          </h2>
          <a
            href="mailto:temple@sohona.example"
            className="mt-4 inline-flex font-sans text-xl font-medium text-gold transition-opacity duration-300 hover:opacity-80 sm:text-2xl"
          >
            temple@sohona.example
          </a>
          <p className="mt-5 text-sm leading-7 text-gray-500">
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
