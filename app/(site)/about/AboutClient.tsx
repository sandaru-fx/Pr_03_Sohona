"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export function AboutClient() {
  const { scrollY } = useScroll();
  
  // Hero Parallax
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroScale = useTransform(scrollY, [0, 800], [1, 1.1]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Intro text scroll highlight effect
  const introRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: introProgress } = useScroll({
    target: introRef,
    offset: ["start 80%", "end 50%"]
  });

  // Sticky Split Screen active section tracking
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  const isSec1InView = useInView(section1Ref, { margin: "-40% 0px -40% 0px" });
  const isSec2InView = useInView(section2Ref, { margin: "-40% 0px -40% 0px" });
  const isSec3InView = useInView(section3Ref, { margin: "-40% 0px -40% 0px" });

  let activeIndex = 0;
  if (isSec3InView) activeIndex = 2;
  else if (isSec2InView) activeIndex = 1;
  else if (isSec1InView) activeIndex = 0;

  return (
    <main className="flex flex-1 flex-col bg-[#0B0D0F]">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-border">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 z-0 transform-gpu">
          <Image
            src="/about-hero.jpg"
            alt="A family standing together at sunset"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[center_35%] brightness-[1.1] contrast-[1.05]"
          />
        </motion.div>
        
        {/* Vignette & Gradients */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,13,15,0.8)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-full max-w-3xl bg-gradient-to-r from-[#0B0D0F]/95 via-[#0B0D0F]/70 to-transparent sm:w-[60%]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-[#0B0D0F] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl flex-col justify-center px-10 pt-20 sm:px-14 lg:px-20 sm:pt-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.2em] text-gold drop-shadow-md">
              About Mathaka QR
            </motion.p>
            <motion.h1 variants={fadeUp} className="mt-6 font-sans text-5xl font-semibold tracking-tight text-white sm:text-7xl sm:leading-[1.1] drop-shadow-xl">
              Built for organizations.<br/>Private for families.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-xl text-xl leading-relaxed text-gray-300 drop-shadow-lg">
              A quiet digital memorial platform — remembrance with dignity, and privacy where it belongs.
            </motion.p>
          </motion.div>
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex h-12 w-8 justify-center rounded-full border-2 border-white/20 pt-2"
          >
            <div className="h-2 w-2 rounded-full bg-gold" />
          </motion.div>
        </motion.div>
      </section>

      {/* The Intro (Scroll-Triggered Text Highlight) */}
      <section ref={introRef} className="relative overflow-hidden border-b border-border py-40 sm:py-56">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[150px]" />
        
        <div className="relative mx-auto max-w-4xl px-10 text-center sm:px-14">
          <p className="text-3xl leading-relaxed sm:text-4xl sm:leading-loose font-medium">
            <span className="text-gray-600">Organizations create the profile and QR. </span>
            <motion.span style={{ color: useTransform(introProgress, [0, 0.4], ["#4B5563", "#F5F1E8"]) }}>Families add words and media behind a PIN. </motion.span>
            <motion.span style={{ color: useTransform(introProgress, [0.3, 0.7], ["#4B5563", "#F5F1E8"]) }}>Visitors remember with respect — </motion.span>
            <motion.span style={{ color: useTransform(introProgress, [0.6, 1], ["#4B5563", "#C9A45C"]) }} className="font-bold">without turning grief into engagement metrics.</motion.span>
          </p>
        </div>
      </section>

      {/* Sticky Split-Screen Core Values */}
      <section className="relative bg-[#0B0D0F] border-b border-border hidden md:block">
        <div className="mx-auto max-w-7xl flex items-start px-10 lg:px-20">
          
          {/* Left Sticky Image Container */}
          <div className="sticky top-24 w-1/2 h-[calc(100vh-12rem)] py-10 pr-10">
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-[#121518] shadow-2xl border border-white/5">
              <motion.div
                animate={{ opacity: activeIndex === 0 ? 1 : 0, scale: activeIndex === 0 ? 1 : 1.05 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <Image src="/feature-family.jpg" alt="Family" fill className="object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </motion.div>
              <motion.div
                animate={{ opacity: activeIndex === 1 ? 1 : 0, scale: activeIndex === 1 ? 1 : 1.05 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <Image src="/feature-privacy.jpg" alt="Privacy" fill className="object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </motion.div>
              <motion.div
                animate={{ opacity: activeIndex === 2 ? 1 : 0, scale: activeIndex === 2 ? 1 : 1.05 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <Image src="/feature-words.jpg" alt="Words" fill className="object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </motion.div>
            </div>
          </div>

          {/* Right Scrolling Content Container */}
          <div className="w-1/2 py-10 pl-10 pb-40">
            
            {/* Section 1 */}
            <div ref={section1Ref} className="min-h-[90vh] flex flex-col justify-center">
              <motion.div initial="hidden" whileInView="show" viewport={{ margin: "-100px" }} variants={staggerContainer}>
                <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Why it exists</motion.p>
                <motion.h2 variants={fadeUp} className="mt-6 font-sans text-4xl font-semibold tracking-tight text-white sm:text-5xl">Remembrance should not feel like a social network.</motion.h2>
                <motion.p variants={fadeUp} className="mt-8 text-xl leading-relaxed text-gray-400">
                  Mathaka QR was shaped for communities and families who want a calm digital place — photographs, voice, and words — held with dignity, not displayed for attention.
                </motion.p>
                <motion.p variants={fadeUp} className="mt-6 text-xl leading-relaxed text-gray-400">
                  The organization helps start the memorial. The family keeps the keys to what stays private.
                </motion.p>
              </motion.div>
            </div>

            {/* Section 2 */}
            <div ref={section2Ref} className="min-h-[90vh] flex flex-col justify-center">
              <motion.div initial="hidden" whileInView="show" viewport={{ margin: "-100px" }} variants={staggerContainer}>
                <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">What stays private</motion.p>
                <motion.h2 variants={fadeUp} className="mt-6 font-sans text-4xl font-semibold tracking-tight text-white sm:text-5xl">Family memories stay under family control.</motion.h2>
                <ul className="mt-10 space-y-4">
                  {[
                    "Statements and personal messages",
                    "Photos, video, and voice recordings",
                    "Visitor comments on the QR memorial page"
                  ].map((item, i) => (
                    <motion.li key={i} variants={fadeUp} className="rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-4 backdrop-blur-md text-lg text-gray-300 shadow-xl">
                      {item}
                    </motion.li>
                  ))}
                </ul>
                <motion.p variants={fadeUp} className="mt-8 text-lg leading-relaxed text-gray-400">
                  Organization administrators never see this content. They only manage memorial infrastructure — names, packages, links, and QR codes.
                </motion.p>
              </motion.div>
            </div>

            {/* Section 3 */}
            <div ref={section3Ref} className="min-h-[90vh] flex flex-col justify-center">
              <motion.div initial="hidden" whileInView="show" viewport={{ margin: "-100px" }} variants={staggerContainer}>
                <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Designed to feel calm</motion.p>
                <motion.h2 variants={fadeUp} className="mt-6 font-sans text-4xl font-semibold tracking-tight text-white sm:text-5xl">No feed. No vault. Just a place to remember.</motion.h2>
                <motion.p variants={fadeUp} className="mt-8 text-xl leading-relaxed text-gray-400">
                  The memorial page is quiet by intention — space for a name, statements, media, and respectful visitor messages. Nothing here is built for likes, streaks, or public ranking.
                </motion.p>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Mobile version of core values (Fallback for small screens) */}
      <section className="bg-[#0B0D0F] md:hidden">
        {/* Why it exists */}
        <div className="px-10 py-24 border-b border-border">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] mb-10">
             <Image src="/feature-family.jpg" alt="Family" fill className="object-cover opacity-60" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Why it exists</p>
          <h2 className="mt-4 font-sans text-3xl font-semibold tracking-tight text-white">Remembrance should not feel like a social network.</h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-400">Mathaka QR was shaped for communities and families who want a calm digital place held with dignity, not displayed for attention.</p>
        </div>

        {/* What stays private */}
        <div className="px-10 py-24 border-b border-border">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] mb-10">
             <Image src="/feature-privacy.jpg" alt="Privacy" fill className="object-cover opacity-60" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">What stays private</p>
          <h2 className="mt-4 font-sans text-3xl font-semibold tracking-tight text-white">Family memories stay under family control.</h2>
          <ul className="mt-8 space-y-3">
             {["Statements and personal messages", "Photos, video, and voice recordings", "Visitor comments"].map((item, i) => (
                <li key={i} className="rounded-xl border border-white/5 bg-white/[0.03] px-5 py-3 text-base text-gray-300">
                  {item}
                </li>
             ))}
          </ul>
        </div>

        {/* Calm design */}
        <div className="px-10 py-24 border-b border-border">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] mb-10">
             <Image src="/feature-words.jpg" alt="Words" fill className="object-cover opacity-60" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Designed to feel calm</p>
          <h2 className="mt-4 font-sans text-3xl font-semibold tracking-tight text-white">No feed. No vault. Just a place to remember.</h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-400">The memorial page is quiet by intention. Nothing here is built for likes, streaks, or public ranking.</p>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative overflow-hidden bg-[#0B0D0F]">
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-900/10 blur-[150px]" />
        <div className="mx-auto max-w-7xl px-10 py-32 sm:px-14 lg:px-20 sm:py-40">
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 p-12 sm:p-20 text-center shadow-2xl backdrop-blur-3xl"
          >
             <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
             <h2 className="font-sans text-4xl font-semibold tracking-tight text-white sm:text-5xl">Speak with the organization</h2>
             <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-gray-300">Take the first step towards offering a dignified, privacy-first digital memorial to your community.</p>
             <Link href="/contact" className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-gold px-10 font-sans text-lg font-semibold text-black transition-transform hover:scale-105">
                Contact Us
             </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
