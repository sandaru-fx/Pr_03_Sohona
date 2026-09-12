import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[#2A2E33] bg-background-secondary">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-10 py-16 sm:px-14 lg:px-20 sm:py-20">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-3">
              <Image
                src="/mathaka-qr-mark.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 rounded-lg object-contain"
              />
              <p className="whitespace-nowrap font-sans text-2xl font-semibold tracking-tight text-[#F5F1E8] sm:text-3xl">
                Mathaka <span className="text-gold">QR</span>
              </p>
            </div>
            <p className="mt-4 max-w-sm text-base leading-7 text-gray-400">
              Remember. Preserve. Protect. Share. Respect. — private by design.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-base text-gray-400">
            <Link
              href="/about"
              className="transition-opacity duration-300 hover:text-gold"
            >
              About
            </Link>
            <Link
              href="/packages"
              className="transition-opacity duration-300 hover:text-gold"
            >
              Packages
            </Link>
            <Link
              href="/contact"
              className="transition-opacity duration-300 hover:text-gold"
            >
              Contact
            </Link>
            <Link
              href="/family"
              className="transition-opacity duration-300 hover:text-gold"
            >
              Family access
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#2A2E33] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-7 text-gray-500">
            Temple staff manage memorials from the admin panel.
          </p>
          <Link
            href="/login"
            className="inline-flex h-12 min-h-12 items-center justify-center rounded-xl border border-[#2A2E33] bg-[#181C20] px-6 font-sans text-sm font-medium text-[#F5F1E8] transition duration-300 hover:border-gold/40 hover:text-gold focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C]"
          >
            Admin login
          </Link>
        </div>
      </div>
    </footer>
  );
}
