import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  FileText,
  MessageCircle,
  ShieldCheck,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Packages | Mathaka QR",
  description: "Premium memorial packages with uncompromising privacy and lasting retention.",
};

const PACKAGES = [
  {
    name: "A",
    years: 25,
    specs: [
      { icon: FileVideo, text: "1 Minute Video Spec" },
      { icon: FileAudio, text: "2 Minutes Audio Spec" },
      { icon: ImageIcon, text: "5 Images" },
      { icon: FileText, text: "Word 500 Spec" },
    ],
    comments: {
      title: "Comment Section",
      line1: "Word 100*5",
      line2: "(After that Word 150*5 Spec)",
    }
  },
  {
    name: "B",
    years: 50,
    specs: [
      { icon: FileVideo, text: "1 Minute Video Spec" },
      { icon: FileAudio, text: "2 Minutes Audio Spec" },
      { icon: ImageIcon, text: "5 Images" },
      { icon: FileText, text: "Word 500 Spec" },
    ],
    comments: {
      title: "Comment Section",
      line1: "Word 100*5",
      line2: "(After that Word 150*5 Spec)",
    }
  },
  {
    name: "C",
    years: 100,
    specs: [
      { icon: FileVideo, text: "1 Minute Video Spec" },
      { icon: FileAudio, text: "2 Minutes Audio Spec" },
      { icon: ImageIcon, text: "5 Images" },
      { icon: FileText, text: "Word 500 Spec" },
    ],
    comments: {
      title: "Comment Section",
      line1: "Word 100*5",
      line2: "(After that Word 150*5 Spec)",
    }
  }
];

export default function PackagesPage() {
  return (
    <main className="flex flex-1 flex-col bg-[#050608] selection:bg-gold/30 selection:text-white">
      {/* HERO SECTION */}
      <section className="relative flex min-h-[85vh] lg:min-h-[calc(100vh-6rem)] flex-col items-center justify-center overflow-hidden border-b border-[#1A1D21] pt-24 pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/packages-hero.jpg"
            alt="Vintage camera and family photographs on a wooden table"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[center_45%] brightness-[0.8] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/60 via-[#050608]/20 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 opacity-60 blur-[150px]" />
        </div>
        <div className="absolute inset-0 z-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay" />

        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 sm:px-10">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0B0D0F]/50 px-8 py-16 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-16 sm:py-20">
            {/* Top gold accent line */}
            <div className="absolute left-1/2 top-0 h-1 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold to-transparent" />
            
            <h1 className="font-sans text-5xl font-medium tracking-tight text-[#F5F1E8] drop-shadow-xl sm:text-6xl lg:text-7xl">
              Choose the Remembrance Horizon
            </h1>
            <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-[#F5F1E8]/90 drop-shadow-md sm:text-xl">
              A timeless tribute structured perfectly to preserve your memories exactly as you want. 
              Whether you choose a horizon of 25, 50, or 100 years, the uncompromising privacy 
              and rich media features remain the exact same. Secure your family's legacy today.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 animate-pulse opacity-70">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Scroll</span>
          <div className="h-12 w-px bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* PACKAGES SHOWCASE */}
      <section className="relative pb-32 pt-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-20">
          <div className="grid gap-8 lg:grid-cols-3">
            {PACKAGES.map((pkg) => {
              const isPremium = pkg.years === 100;

              return (
                <div
                  key={pkg.name}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-[2rem] border transition-all duration-500 hover:-translate-y-2",
                    isPremium
                      ? "border-gold/50 bg-gradient-to-b from-[#181C20] to-[#0B0D0F]"
                      : "border-[#2A2E33] bg-[#121518] hover:border-gold/30"
                  )}
                >
                  {isPremium && (
                    <div className="absolute inset-0 bg-gradient-to-b from-gold/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  )}
                  
                  <div className="relative z-10 flex flex-1 flex-col p-8 sm:p-10">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1D21] border border-[#2A2E33]">
                        <span className="font-sans text-xl font-bold text-gold">{pkg.name}</span>
                      </div>
                      {isPremium && (
                        <span className="flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold">
                          <Crown className="h-3 w-3" /> Premium
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-8 flex items-baseline gap-2 border-b border-[#2A2E33] pb-8">
                      <span className="font-sans text-6xl font-bold tracking-tighter text-[#F5F1E8]">
                        {pkg.years}
                      </span>
                      <span className="text-xl font-medium text-gray-500">Years Design</span>
                    </div>

                    <ul className="mt-10 flex flex-col gap-6">
                      {pkg.specs.map((spec, i) => (
                        <li key={i} className="flex items-center gap-5 rounded-xl bg-[#1A1D21]/30 p-3 transition-colors hover:bg-[#1A1D21]">
                          <div className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border",
                            isPremium ? "border-gold/40 bg-gold/10 text-gold shadow-[0_0_15px_rgba(201,162,112,0.2)]" : "border-[#2A2E33] bg-[#121518] text-gray-300"
                          )}>
                            <spec.icon className="h-6 w-6" />
                          </div>
                          <span className="text-[17px] font-semibold text-[#F5F1E8] sm:text-lg">{spec.text}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-10 rounded-2xl border border-gold/20 bg-gradient-to-br from-[#121518] to-[#0A0C0E] p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center gap-3 mb-5 border-b border-[#2A2E33] pb-4">
                        <MessageCircle className="h-7 w-7 text-gold" />
                        <h4 className="text-xl font-bold uppercase tracking-widest text-gold drop-shadow-sm">{pkg.comments.title}</h4>
                      </div>
                      <p className="text-xl font-bold text-white sm:text-2xl drop-shadow-md">{pkg.comments.line1}</p>
                      <p className="mt-2 text-base font-medium text-gray-400 sm:text-lg">{pkg.comments.line2}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          
          {/* DESCRIPTIVE CONTENT SECTION */}
          <div className="mx-auto mt-32 max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium uppercase tracking-widest text-gold">Our Promise</span>
            </div>
            <h2 className="font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl">
              Preserving Memories with Dignity
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
              We ensure every memory is treated with the utmost respect and care, creating a lasting legacy for your loved ones.
            </p>
            
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
              {/* Card 1 */}
              <div className="group relative overflow-hidden rounded-3xl border border-[#2A2E33] bg-gradient-to-b from-[#121518] to-[#0A0C0E] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20 text-gold shadow-[0_0_15px_rgba(201,162,112,0.15)] group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#F5F1E8] group-hover:text-gold transition-colors">Uncompromising Quality</h3>
                  <p className="mt-4 text-base leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
                    Every package at Mathaka QR is carefully crafted to honor your loved ones. 
                    While the remembrance horizons vary—from a meaningful 25 years to an enduring century—the 
                    quality of the memorial remains exactly the same. Your photos, videos, and audio clips are preserved securely.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative overflow-hidden rounded-3xl border border-[#2A2E33] bg-gradient-to-b from-[#121518] to-[#0A0C0E] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20 text-gold shadow-[0_0_15px_rgba(201,162,112,0.15)] group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#F5F1E8] group-hover:text-gold transition-colors">Absolute Privacy</h3>
                  <p className="mt-4 text-base leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
                    Your family's privacy is our highest priority. All media, statements, and comments are protected 
                    by a secure family PIN. This ensures that the digital space remains a calm, respectful sanctuary 
                    for those who truly matter.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative overflow-hidden rounded-3xl border border-[#2A2E33] bg-gradient-to-b from-[#121518] to-[#0A0C0E] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20 text-gold shadow-[0_0_15px_rgba(201,162,112,0.15)] group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#F5F1E8] group-hover:text-gold transition-colors">Thoughtful Tributes</h3>
                  <p className="mt-4 text-base leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
                    Our structured comment sections are designed to encourage profound, considered tributes. 
                    By guiding visitors with thoughtful word limits, we foster a respectful environment free from 
                    the noise of public social media. Every word left behind becomes a cherished part of the legacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-20 text-center flex justify-center">
             <Link
              href="/contact"
              className="inline-flex h-14 items-center justify-center rounded-full bg-gold px-10 font-medium text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(201,162,112,0.3)]"
            >
              Inquire with Us
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}
