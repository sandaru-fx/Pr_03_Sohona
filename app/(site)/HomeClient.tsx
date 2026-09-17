"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

interface HomeClientProps {
  packages: any[];
  limits: any;
}

export function HomeClient({ packages, limits }: HomeClientProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Framer motion variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-[#0B0D0F]">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-border">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src="/hero-plaque-v8.jpg"
            alt="Mathaka QR memorial plaque with candle, flowers, and sunset frame"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[72%_45%] sm:object-[65%_45%]"
          />
        </motion.div>
        
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#0B0D0F]/90 via-[#0B0D0F]/60 to-[#0B0D0F]/10 sm:w-[60%]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[#0B0D0F] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl flex-col justify-center px-10 pt-20 sm:px-14 lg:px-20 sm:pt-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-2xl rounded-3xl bg-white/[0.03] p-8 sm:p-10 backdrop-blur-md border border-white/10 shadow-2xl [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]"
          >
            <motion.p variants={fadeUp} className="whitespace-nowrap font-sans text-5xl font-bold tracking-tight text-white drop-shadow-lg sm:text-6xl md:text-7xl">
              Mathaka <span className="text-gold">QR</span>
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-6 font-sans text-2xl font-medium leading-snug tracking-tight text-gray-100 sm:text-3xl md:text-4xl md:leading-snug"
            >
              Digital remembrance.<br/>Private by design.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-lg font-sans text-lg leading-8 text-gray-300 drop-shadow-md sm:text-xl"
            >
              A respectful digital place for organizations and families — private memories stay under family control.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-gold px-8 font-sans text-base font-semibold text-black transition-all hover:scale-105"
              >
                <span className="relative z-10">Create a Memorial</span>
                <div className="absolute inset-0 z-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-black/40 px-8 font-sans text-base font-medium text-white backdrop-blur-md transition-all hover:border-gold hover:bg-white/10"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div style={{ opacity }} className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex h-12 w-8 justify-center rounded-full border-2 border-white/20 pt-2"
          >
            <div className="h-2 w-2 rounded-full bg-gold" />
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />
        
        <div className="relative mx-auto max-w-7xl px-10 py-32 sm:px-14 lg:px-20 sm:py-40">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              How Mathaka QR works
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 font-sans text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Three quiet steps
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              From the desk to a family living room — remembrance moves gently, without public accounts or noisy feeds.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mt-20 grid gap-8 sm:grid-cols-3"
          >
            {[
              {
                title: "Organization creates the memorial",
                body: "Staff set up a name-only profile, choose a package, and share a private setup link with the family.",
              },
              {
                title: "Family preserves memories",
                body: "With a 6-digit PIN, the family adds statements, photos, video, and voice — never through a public account.",
              },
              {
                title: "Visitors remember via QR",
                body: "A unique QR opens a calm memorial page. Optional PIN keeps the most private moments protected.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="group relative rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-gold/30 hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(201,164,92,0.1)]"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-2xl font-bold text-gold transition-colors group-hover:bg-gold group-hover:text-black">
                  {index + 1}
                </div>
                <h3 className="font-sans text-xl font-semibold text-white sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-gray-400 group-hover:text-gray-300">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute top-1/2 right-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-900/10 blur-[150px]" />
        
        <div className="relative mx-auto max-w-7xl px-10 py-32 sm:px-14 lg:px-20 sm:py-40">
          <motion.div
             initial="hidden"
             whileInView="show"
             viewport={{ once: true, margin: "-100px" }}
             variants={staggerContainer}
             className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
             {/* Large Feature 1 */}
             <motion.div variants={fadeUp} className="group relative overflow-hidden rounded-[2.5rem] bg-[#121518] border border-white/5 md:col-span-2 min-h-[500px]">
                <Image src="/feature-voice.jpg" alt="Voice" fill className="object-cover opacity-50 transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-10 sm:p-16 flex flex-col justify-center max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Voice & presence</p>
                    <h2 className="mt-4 font-sans text-4xl font-semibold tracking-tight text-white sm:text-5xl">Some stories are felt,<br/>not only spoken.</h2>
                    <p className="mt-6 text-lg leading-relaxed text-gray-300">Families can preserve a quiet voice note kept private behind the memorial PIN. Listeners come through the QR, not a public timeline.</p>
                </div>
             </motion.div>

             {/* Small Feature 2 */}
             <motion.div variants={fadeUp} className="group relative overflow-hidden rounded-[2.5rem] bg-[#121518] border border-white/5 aspect-square sm:aspect-auto sm:min-h-[450px]">
                 <Image src="/feature-privacy.jpg" alt="Privacy" fill className="object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20" />
                 <div className="absolute inset-0 p-10 sm:p-12 flex flex-col justify-end">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Privacy promise</p>
                    <h2 className="mt-4 font-sans text-3xl font-semibold tracking-tight text-white">Your memories remain private.</h2>
                    <p className="mt-4 text-base leading-relaxed text-gray-300">A family PIN is the key. Without it, the deepest memories stay closed — like a journal kept under lock.</p>
                 </div>
             </motion.div>

             {/* Small Feature 3 */}
             <motion.div variants={fadeUp} className="group relative overflow-hidden rounded-[2.5rem] bg-[#121518] border border-white/5 aspect-square sm:aspect-auto sm:min-h-[450px]">
                 <Image src="/feature-words.jpg" alt="Words" fill className="object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20" />
                 <div className="absolute inset-0 p-10 sm:p-12 flex flex-col justify-end">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Words that stay</p>
                    <h2 className="mt-4 font-sans text-3xl font-semibold tracking-tight text-white">Written with care, not for likes.</h2>
                    <p className="mt-4 text-base leading-relaxed text-gray-300">No reactions, rankings, or public profiles — only space to say what matters.</p>
                 </div>
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="relative overflow-hidden border-b border-border bg-[#0B0D0F]">
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-gold/5 blur-[150px]" />
        <div className="absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-900/5 blur-[120px]" />
        
        <div className="relative mx-auto max-w-7xl px-10 py-32 sm:px-14 lg:px-20 sm:py-40">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Packages
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 font-sans text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Same care. Different years.
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              Content limits are identical. What changes is how long the memorial is designed to be kept securely.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mt-20 grid gap-6 sm:grid-cols-3"
          >
            {packages.map((item) => (
              <motion.div
                key={item.id}
                variants={fadeUp}
                className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-gold/30 hover:bg-white/[0.04] hover:shadow-[0_20px_40px_rgba(201,164,92,0.1)]"
              >
                <p className="text-lg font-medium text-gray-400 transition-colors group-hover:text-gold">{item.name}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-sans text-6xl font-bold tracking-tighter text-white">{item.retentionYears}</span>
                  <span className="text-xl font-medium text-gray-500">years</span>
                </div>
                <p className="mt-6 text-center text-sm leading-relaxed text-gray-400">
                  Up to {limits.maxImages} photos · Video ≤ {limits.maxVideoSeconds}s<br/>Statements ≤ {limits.maxStatementWords} words
                </p>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </motion.div>
            ))}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex justify-center"
          >
            <Link
              href="/packages"
              className="group inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-8 py-4 font-medium text-gold transition-all hover:bg-gold hover:text-black"
            >
              Compare packages
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pre-footer Call to action */}
      <section className="relative overflow-hidden bg-[#0B0D0F]">
        <div className="mx-auto max-w-7xl px-10 py-32 sm:px-14 lg:px-20 sm:py-40">
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 p-12 sm:p-20 text-center shadow-2xl backdrop-blur-3xl"
          >
             <h2 className="font-sans text-4xl font-semibold tracking-tight text-white sm:text-5xl">Begin with a conversation</h2>
             <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-gray-300">Speak with us about starting a dignified digital memorial for someone you love, without turning remembrance into a social feed.</p>
             <Link href="/contact" className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-gold px-10 font-sans text-lg font-semibold text-black transition-transform hover:scale-105">
                Contact Us Today
             </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
