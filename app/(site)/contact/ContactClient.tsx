"use client";

import React, { useState, useRef, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Check, Copy, Send, Loader2 } from "lucide-react";

export function ContactClient() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Tilt Effect Hooks
  const boundingRef = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!boundingRef.current) return;
    const rect = boundingRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
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
    <main className="flex flex-1 flex-col overflow-hidden">
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
              <li className="border-l border-gold/40 pl-4">01 — Email or visit us</li>
              <li className="border-l border-gold/40 pl-4">02 — Choose package A, B, or C together</li>
              <li className="border-l border-gold/40 pl-4">03 — Family completes setup with a PIN</li>
            </motion.ol>
          </div>
        </motion.div>
      </section>

      <div className="mx-auto w-full max-w-7xl flex-1 px-10 py-24 sm:px-14 lg:px-20 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          
          {/* Form Section */}
          <motion.section
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
            className="flex flex-col"
          >
            <h2 className="text-2xl font-medium tracking-tight text-[#F5F1E8] sm:text-3xl">
              Send us a message
            </h2>
            <p className="mt-3 text-base leading-7 text-gray-400">
              Have questions? Send us a message and we'll get back to you shortly.
            </p>
            
            <form onSubmit={handleFormSubmit} className="mt-8 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-400">Name</label>
                  <input required type="text" id="name" className="h-12 w-full rounded-xl border border-border bg-[#181C20] px-4 text-sm text-[#F5F1E8] outline-none transition focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/50" placeholder="Your name" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-400">Phone</label>
                  <input required type="tel" id="phone" className="h-12 w-full rounded-xl border border-border bg-[#181C20] px-4 text-sm text-[#F5F1E8] outline-none transition focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/50" placeholder="Your phone number" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-400">Message</label>
                <textarea required id="message" rows={4} className="w-full resize-none rounded-xl border border-border bg-[#181C20] p-4 text-sm text-[#F5F1E8] outline-none transition focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/50" placeholder="How can we help?" />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting || isSuccess}
                className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gold px-8 font-sans text-sm font-medium text-[#0B0D0F] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400 w-full sm:w-auto self-start"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                ) : isSuccess ? (
                  <><Check className="h-4 w-4" /> Message Sent</>
                ) : (
                  <><Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /> Send Message</>
                )}
              </button>
            </form>
          </motion.section>

          {/* Details Section with 3D Tilt */}
          <motion.section 
            ref={boundingRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
            style={{
              transformStyle: "preserve-3d",
              rotateX,
              rotateY,
            }}
            className="rounded-3xl border border-[#2A2E33] bg-[#181C20]/80 p-8 sm:p-12 relative overflow-hidden group backdrop-blur-xl shadow-2xl h-fit"
          >
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl" />
            
            <div className="flex flex-col gap-10 sm:gap-12 relative z-10" style={{ transform: "translateZ(30px)" }}>
              <div>
                <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                  Contact Numbers
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {[
                    { id: "p1", text: "076 804 6019", val: "0768046019" },
                    { id: "p2", text: "077 488 0604", val: "0774880604" },
                    { id: "p3", text: "077 948 9397", val: "0779489397" }
                  ].map((phone) => (
                    <button 
                      key={phone.id}
                      onClick={(e) => copyToClipboard(phone.val, phone.id, e)}
                      className="group/btn relative inline-flex w-fit items-center gap-3 text-left font-sans text-xl font-medium text-gold sm:text-2xl hover:text-[#e8c985] transition-colors focus:outline-none"
                    >
                      {phone.text}
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-gold opacity-0 transition-opacity group-hover/btn:opacity-100">
                        {copiedId === phone.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                  WhatsApp
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <motion.a
                    href="https://wa.me/94768946019"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit font-sans text-xl font-medium text-gold sm:text-2xl hover:text-[#e8c985] transition-colors"
                  >
                    076 894 6019
                  </motion.a>
                  <button 
                    onClick={(e) => copyToClipboard("0768946019", "wa", e)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-gold opacity-50 transition-opacity hover:opacity-100 focus:outline-none"
                    title="Copy WhatsApp number"
                  >
                    {copiedId === "wa" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                  Email
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <motion.a
                    href="mailto:mathakaqr@gmail.com"
                    className="inline-flex w-fit font-sans text-xl font-medium text-gold sm:text-2xl break-all hover:text-[#e8c985] transition-colors"
                  >
                    mathakaqr@gmail.com
                  </motion.a>
                  <button 
                    onClick={(e) => copyToClipboard("mathakaqr@gmail.com", "email", e)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-gold opacity-50 transition-opacity hover:opacity-100 focus:outline-none shrink-0"
                    title="Copy email address"
                  >
                    {copiedId === "email" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
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
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center text-base text-gray-400"
        >
          Organization staff?{" "}
          <Link
            href="/login"
            className="font-medium text-gold transition-opacity duration-300 hover:opacity-80"
          >
            Sign in here
          </Link>
          .
        </motion.div>
      </div>
    </main>
  );
}
