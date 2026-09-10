import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Family access",
  description:
    "How families open their private Sohona memorial manage link.",
};

export default function FamilyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-20">
      <p className="text-sm tracking-wide text-gold">Family access</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        These memories belong to your family
      </h1>
      <p className="mt-6 text-base leading-7 text-foreground-secondary">
        Sohona does not use family email accounts. Your temple sends a private
        manage link. Open that link, enter your 6-digit PIN, and continue.
      </p>

      <section className="mt-10 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-subtle text-gold">
          <Lock className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-5 font-display text-2xl text-foreground">
          How to continue
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-foreground-secondary">
          <li>Find the manage link from your temple (or setup completion).</li>
          <li>Open it on a trusted device.</li>
          <li>Enter the PIN your family created during setup.</li>
        </ol>
        <p className="mt-6 text-sm leading-6 text-foreground-muted">
          Lost the link? Contact the temple — they can help without reading your
          private memories.
        </p>
      </section>

      <Link
        href="/contact"
        className="mt-10 inline-flex h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-foreground transition hover:border-gold/40"
      >
        Contact the temple
      </Link>
    </main>
  );
}
