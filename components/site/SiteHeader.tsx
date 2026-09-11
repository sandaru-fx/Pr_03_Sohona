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
] as const;

type SiteHeaderProps = {
  pathname: string;
};

export function SiteHeader({ pathname }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-[#0B0D0F]/90 backdrop-blur-md">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-4 px-10 sm:px-14 lg:px-20">
        <Link
          href="/"
          className="font-sans text-3xl font-semibold tracking-tight text-[#F5F1E8] transition-opacity duration-300 hover:opacity-80 sm:text-4xl"
        >
          Mathaka QR
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 md:flex lg:gap-8"
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
                  "rounded-lg px-4 py-2.5 text-base font-semibold tracking-wide transition duration-300 sm:text-lg",
                  active
                    ? "bg-gold-subtle text-gold"
                    : "text-[#F5F1E8] hover:bg-[#181C20] hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#2A2E33] text-[#F5F1E8] md:hidden"
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
          className="border-t border-[#2A2E33] bg-[#181C20] px-8 py-5 md:hidden"
        >
          <ul className="space-y-2">
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
                      "block rounded-xl px-4 py-3.5 text-lg font-semibold tracking-wide transition duration-300",
                      active
                        ? "bg-gold-subtle text-gold"
                        : "text-[#F5F1E8] hover:bg-[#0B0D0F] hover:text-white",
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
