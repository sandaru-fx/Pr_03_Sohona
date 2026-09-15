"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function ContactClient() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-border bg-[#0B0D0F]">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="/contact-hero.jpg"
            alt="Journal and coffee overlooking a sunrise valley"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[center_40%] brightness-[1.25] contrast-[1.05]"
          />
        </motion.div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[70%] max-w-2xl bg-gradient-to-r from-[#0B0D0F]/88 via-[#0B0D0F]/45 to-transparent sm:w-[52%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-[#0B0D0F]/25 to-transparent"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl flex-col justify-center px-10 pt-20 sm:px-14 lg:px-20 sm:pt-24">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-xl rounded-2xl bg-[#0B0D0F]/45 px-6 py-8 backdrop-blur-[2px] sm:max-w-2xl sm:px-9 sm:py-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.75)]"
          >
            <motion.p variants={itemVariants} className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Contact
            </motion.p>
            <motion.h1 variants={itemVariants} className="mt-4 font-sans text-5xl font-medium tracking-tight text-[#F5F1E8] sm:text-6xl sm:leading-tight">
              Speak with us
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-5 max-w-xl text-lg leading-8 text-[#F5F1E8]/90 sm:text-xl">
              Memorials begin with a quiet conversation. Reach out to arrange a
              package and receive your family setup link.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-border">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mx-auto grid max-w-7xl items-center gap-16 px-10 py-24 sm:grid-cols-2 sm:gap-20 lg:gap-24 sm:px-14 lg:px-20 sm:py-32"
        >
          <motion.div variants={itemVariants} className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#121518]">
            <Image
              src="/feature-words.jpg"
              alt="Handwritten note and pen by candlelight"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-contain object-center"
            />
          </motion.div>
          <div className="flex flex-col">
            <motion.p variants={itemVariants} className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              How to begin
            </motion.p>
            <motion.h2 variants={itemVariants} className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
              A quiet conversation starts the memorial.
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-6 text-lg leading-8 text-gray-400">
              Reach out to us to choose a package, create the memorial
              shell, and receive a private family setup link. There is no public
              checkout — care stays personal.
            </motion.p>
            <motion.ol variants={itemVariants} className="mt-8 space-y-4 text-base leading-7 text-gray-400">
              <li className="border-l border-gold/40 pl-4">
                01 — Email or visit us
              </li>
              <li className="border-l border-gold/40 pl-4">
                02 — Choose package A, B, or C together
              </li>
              <li className="border-l border-gold/40 pl-4">
                03 — Family completes setup with a PIN
              </li>
            </motion.ol>
          </div>
        </motion.div>
      </section>

      <div className="mx-auto w-full max-w-3xl flex-1 px-10 py-24 sm:px-14 lg:px-20 sm:py-32">
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
          className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-8 py-10 sm:px-10 sm:py-12 relative overflow-hidden group"
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
          
          <div className="flex flex-col gap-10 sm:gap-12 relative z-10">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                Contact Numbers
              </h2>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { id: 1, text: "076 804 6019", href: "tel:0768046019" },
                  { id: 2, text: "077 488 0604", href: "tel:0774880604" },
                  { id: 3, text: "077 948 9397", href: "tel:0779489397" }
                ].map((phone) => (
                  <motion.a 
                    key={phone.id}
                    href={phone.href} 
                    whileHover={{ x: 8, color: "#e8c985" }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="inline-flex w-fit font-sans text-xl font-medium text-gold sm:text-2xl"
                  >
                    {phone.text}
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                WhatsApp
              </h2>
              <motion.a
                href="https://wa.me/94768946019"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 8, color: "#e8c985" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="mt-4 inline-flex w-fit font-sans text-xl font-medium text-gold sm:text-2xl"
              >
                076 894 6019
              </motion.a>
            </div>

            <div>
              <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                Email
              </h2>
              <motion.a
                href="mailto:mathakaqr@gmail.com"
                whileHover={{ x: 8, color: "#e8c985" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="mt-4 inline-flex w-fit font-sans text-xl font-medium text-gold sm:text-2xl break-all"
              >
                mathakaqr@gmail.com
              </motion.a>
            </div>

            <div>
              <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                Location
              </h2>
              <p className="mt-4 font-sans text-xl font-medium text-gold sm:text-2xl">
                Galigamuwa, Kegalle
              </p>
            </div>
          </div>
        </motion.section>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-base text-gray-400"
        >
          Organization staff?{" "}
          <Link
            href="/login"
            className="font-medium text-gold transition-opacity duration-300 hover:opacity-80"
          >
            Sign in here
          </Link>
          .
        </motion.p>
      </div>
    </main>
  );
}
