import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/packages", label: "Packages" },
  { href: "/contact", label: "Contact" },
] as const;

type SiteHeaderProps = {
  pathname: string;
};

export function SiteHeader({ pathname }: SiteHeaderProps) {
  return (
    <header className="relative z-20 border-b border-[color:var(--site-line)] bg-[color:var(--site-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-site-display)] text-2xl tracking-tight text-[color:var(--site-ink)] transition hover:opacity-80"
        >
          Sohona
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-sm transition sm:px-3",
                  active
                    ? "bg-[color:var(--site-ink)] text-[color:var(--site-bg)]"
                    : "text-[color:var(--site-muted)] hover:bg-[color:var(--site-wash)] hover:text-[color:var(--site-ink)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
