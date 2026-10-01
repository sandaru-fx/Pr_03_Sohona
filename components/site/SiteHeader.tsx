"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
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
      <div className="flex h-24 w-full items-center gap-6 px-4 sm:gap-8 sm:px-5 lg:px-6">
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-3 transition-opacity duration-300 hover:opacity-90"
          aria-label="Mathaka QR home"
        >
          <Image
            src="/logo.jpeg"
            alt="Mathaka QR Logo"
            width={48}
            height={48}
            priority
            className="h-11 w-11 rounded-lg object-contain sm:h-12 sm:w-12"
          />
          <span className="whitespace-nowrap font-sans text-2xl font-semibold tracking-tight text-[#F5F1E8] sm:text-3xl">
            Mathaka <span className="text-gold">QR</span>
          </span>
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <nav
            aria-label="Primary"
            className="flex items-center gap-5 lg:gap-7"
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
        </div>

        <div className="hidden md:flex shrink-0 items-center gap-3 bg-gold px-4 py-3 rounded-xl ml-auto md:ml-0 shadow-lg shadow-gold/10 transition-transform duration-300 hover:scale-105">
          <Phone className="h-5 w-5 text-[#0B0D0F]" />
          <div className="flex flex-col items-start justify-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0B0D0F]/70 leading-tight mb-0.5">
              Call Us Now
            </span>
            <a href="tel:0768046019" className="text-base font-extrabold leading-none text-[#0B0D0F] tracking-wide hover:underline">
              076 804 6019
            </a>
          </div>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#2A2E33] text-[#F5F1E8] md:hidden"
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
