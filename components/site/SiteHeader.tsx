"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/packages", label: "Packages" },
  { href: "/contact", label: "Contact" },
  { href: "/family", label: "Family" },
] as const;

type SiteHeaderProps = {
  pathname: string;
};

export function SiteHeader({ pathname }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight text-foreground transition hover:text-gold"
        >
          Sohona
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
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
                  "rounded-lg px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-gold-subtle text-gold"
                    : "text-foreground-secondary hover:bg-surface hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav
          aria-label="Mobile"
          className="border-t border-border bg-surface px-6 py-4 md:hidden"
        >
          <ul className="space-y-1">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl px-3 py-3 text-sm",
                      active
                        ? "bg-gold-subtle text-gold"
                        : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
