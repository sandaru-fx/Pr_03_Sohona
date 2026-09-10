import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-border bg-background-secondary">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-2xl text-foreground">Sohona</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-foreground-secondary">
            Remember. Preserve. Protect. Share. Respect. — private by design.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground-secondary">
          <Link href="/about" className="transition hover:text-gold">
            About
          </Link>
          <Link href="/packages" className="transition hover:text-gold">
            Packages
          </Link>
          <Link href="/contact" className="transition hover:text-gold">
            Contact
          </Link>
          <Link href="/family" className="transition hover:text-gold">
            Family access
          </Link>
          <Link href="/login" className="transition hover:text-gold">
            Temple admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
