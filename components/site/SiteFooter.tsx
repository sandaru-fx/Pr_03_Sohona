import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[color:var(--site-line)] bg-[color:var(--site-bg)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-site-display)] text-xl text-[color:var(--site-ink)]">
            Sohona
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[color:var(--site-muted)]">
            Digital memorials for temples and families — private by design.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--site-muted)]">
          <Link href="/about" className="hover:text-[color:var(--site-ink)]">
            About
          </Link>
          <Link href="/packages" className="hover:text-[color:var(--site-ink)]">
            Packages
          </Link>
          <Link href="/contact" className="hover:text-[color:var(--site-ink)]">
            Contact
          </Link>
          <Link href="/login" className="hover:text-[color:var(--site-ink)]">
            Temple admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
