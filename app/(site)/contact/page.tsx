import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the temple about a Mathaka QR digital memorial.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 sm:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
        Contact
      </p>
      <h1 className="mt-4 font-sans text-4xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl sm:leading-tight">
        Speak with the temple
      </h1>
      <p className="mt-8 text-lg leading-8 text-gray-400">
        Memorials begin with a quiet conversation. Reach out to arrange a
        package and receive your family setup link.
      </p>

      <section className="mt-14 rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 sm:px-8 sm:py-10">
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
          Replace this address with your temple&apos;s real contact when you go
          live. Until then, temple staff can also use admin sign-in.
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
    </main>
  );
}
