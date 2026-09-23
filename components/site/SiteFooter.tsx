import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[#2A2E33] bg-background-secondary overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/new-footer-bg.png"
          alt="Footer Background"
          fill
          className="object-cover object-[center_65%] opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F]/95 via-[#0B0D0F]/70 to-[#0B0D0F]/20" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 px-10 py-24 sm:px-14 lg:px-20 sm:py-32">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Brand & Tagline */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-3">
              <Image
                src="/logo.jpeg"
                alt="Mathaka QR Logo"
                width={44}
                height={44}
                className="h-11 w-11 rounded-lg object-contain drop-shadow-lg"
              />
              <p className="whitespace-nowrap font-sans text-2xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-3xl">
                Mathaka <span className="text-gold">QR</span>
              </p>
            </div>
            <p className="max-w-sm text-base font-medium leading-7 text-gray-100 drop-shadow-lg">
              Remember. Preserve. Protect. Share. Respect. — private by design.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-white drop-shadow-lg">Quick Links</h3>
            <div className="flex flex-col gap-4 text-base font-medium text-gray-100 drop-shadow-lg">
              <Link href="/about" className="w-fit transition-colors duration-300 hover:text-gold">
                About Us
              </Link>
              <Link href="/packages" className="w-fit transition-colors duration-300 hover:text-gold">
                Packages
              </Link>
              <Link href="/contact" className="w-fit transition-colors duration-300 hover:text-gold">
                Contact Us
              </Link>
              <Link href="/family" className="w-fit transition-colors duration-300 hover:text-gold">
                Family Access
              </Link>
            </div>
          </div>

          {/* Contact & Socials */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-white drop-shadow-lg">Get in Touch</h3>
            <div className="flex flex-col gap-4 text-base font-medium text-gray-100 drop-shadow-lg">
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <span className="leading-tight">076 804 6019<br />077 488 0604<br />077 948 9397</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 shrink-0 text-gold" />
                <span>076 894 6019 (WhatsApp)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-gold" />
                <span>mathakaqr@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-gold" />
                <span>Galigamuwa, Kegalle</span>
              </div>
            </div>
            {/* Social Icons 
                Removed because lucide-react brand icons are missing in this version
            */}
          </div>
        </div>

        {/* Bottom Bar & Copyright (with Hidden Admin Link) */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-8 text-sm font-medium text-gray-200 drop-shadow-lg sm:flex-row">
          <p>
            © {new Date().getFullYear()}{" "}
            <Link href="/login" className="transition-colors duration-300 hover:text-gold">
              Mathaka QR
            </Link>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors duration-300 hover:text-gold">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors duration-300 hover:text-gold">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
