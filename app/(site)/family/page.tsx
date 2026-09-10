import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Family access",
  description:
    "How families open their private Mathaka QR memorial manage link.",
};

export default function FamilyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 sm:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
        Family access
      </p>
      <h1 className="mt-4 font-sans text-4xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl sm:leading-tight">
        These memories belong to your family
      </h1>
      <p className="mt-8 text-lg leading-8 text-gray-400">
        Mathaka QR does not use family email accounts. Your temple sends a
        private manage link. Open that link, enter your 6-digit PIN, and
        continue.
      </p>

      <section className="mt-14 rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-subtle text-gold">
          <Lock className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-6 font-sans text-2xl font-medium tracking-tight text-[#F5F1E8]">
          How to continue
        </h2>
        <ol className="mt-6 space-y-4 text-base leading-8 text-gray-400">
          <li className="flex gap-4">
            <span className="shrink-0 tabular-nums text-gold/80">01</span>
            <span>
              Find the manage link from your temple (or setup completion).
            </span>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 tabular-nums text-gold/80">02</span>
            <span>Open it on a trusted device.</span>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 tabular-nums text-gold/80">03</span>
            <span>Enter the PIN your family created during setup.</span>
          </li>
        </ol>
        <p className="mt-8 text-sm leading-7 text-gray-500">
          Lost the link? Contact the temple — they can help without reading your
          private memories.
        </p>
      </section>

      <Link
        href="/contact"
        className="mt-12 inline-flex h-12 min-h-12 items-center rounded-xl border border-[#2A2E33] bg-[#181C20] px-6 text-sm font-medium text-[#F5F1E8] transition duration-300 hover:border-gold/40"
      >
        Contact the temple
      </Link>
    </main>
  );
}
