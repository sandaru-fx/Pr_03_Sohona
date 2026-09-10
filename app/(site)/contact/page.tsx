import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the temple about a Sohona digital memorial.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-20">
      <p className="text-sm tracking-wide text-gold">Contact</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        Speak with the temple
      </h1>
      <p className="mt-6 text-base leading-7 text-foreground-secondary">
        Memorials begin with a quiet conversation. Reach out to arrange a
        package and receive your family setup link.
      </p>

      <section className="mt-10 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-sm font-medium text-foreground">Email</h2>
        <a
          href="mailto:temple@sohona.example"
          className="mt-3 inline-flex text-lg text-gold transition hover:text-gold-hover"
        >
          temple@sohona.example
        </a>
        <p className="mt-4 text-sm leading-6 text-foreground-muted">
          Replace this address with your temple&apos;s real contact when you go
          live. Until then, temple staff can also use the admin sign-in.
        </p>
      </section>

      <p className="mt-10 text-sm text-foreground-secondary">
        Temple staff?{" "}
        <Link
          href="/login"
          className="font-medium text-gold underline-offset-2 hover:underline"
        >
          Sign in here
        </Link>
        .
      </p>
    </main>
  );
}
