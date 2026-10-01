"use client";

import React, { useState, useRef, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring, useScroll, AnimatePresence } from "framer-motion";
import { Check, Copy, Send, Loader2, Plus, Minus, Clock } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export function ContactClient() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Parallax Scroll Hooks
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 1000], [0, 400]);

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

  const faqs = [
    {
      question: "How long does it take to set up a memorial?",
      answer: "Once you choose a package and we have our initial conversation, we create the memorial shell within 24 hours. From there, your family can take as much time as needed to add photos, videos, and stories."
    },
    {
      question: "Do I need any technical knowledge?",
      answer: "Not at all. We handle all the technical setup. You simply receive a secure link and a PIN to access and update your family member's profile using an intuitive, easy-to-use interface."
    },
    {
      question: "How do we learn about package pricing?",
      answer: "We prefer to discuss packages personally to ensure we meet your family's exact needs with dignity. Please call or email us, and we will guide you through the options without any obligation."
    },
    {
      question: "Can anyone see the private memories?",
      answer: "No. Privacy is our priority. Public visitors can only see what you choose to share. Private stories, audio, and personal family comments are locked securely."
    }
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: any = {
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
          style={{ y: yHero }}
          className="absolute inset-0 z-0 origin-top"
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
            
            <motion.div variants={itemVariants} className="mt-8 flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gold/30 bg-white p-1 shadow-[0_0_15px_rgba(232,201,133,0.15)]">
                <Image
                  src="/logo-mathaka.jpg"
                  alt="Mathaka QR Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-lg font-medium text-[#F5F1E8]">Mathaka QR</span>
                <span className="text-sm text-gold">Memory • Connect</span>
              </div>
            </motion.div>
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
          
          <div className="flex flex-col gap-12">
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

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
              className="relative hidden flex-1 overflow-hidden rounded-3xl border border-[#2A2E33] lg:block"
            >
              <Image
                src="/feature-words.jpg"
                alt="Memorial candle and journal"
                fill
                quality={100}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] to-transparent opacity-60 pointer-events-none" />
            </motion.div>
          </div>

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
                  Social Media
                </h2>
                <div className="mt-4 flex items-center gap-4">
                  <motion.a
                    href="https://www.facebook.com/share/1BcRq1dq9C/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, color: "#e8c985" }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold transition-colors hover:bg-gold/20"
                    title="Follow us on Facebook"
                  >
                    <FacebookIcon className="h-6 w-6" />
                  </motion.a>
                </div>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:gap-10">
                <div className="flex-1">
                  <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                    Location
                  </h2>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/5 relative group/map">
                    <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] rounded-2xl" />
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126620.06316262104!2d80.25265697693526!3d7.257088469850117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae31698e6c4cce1%3A0xe543e5714c30c822!2sKegalle!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk" 
                      width="100%" 
                      height="180" 
                      style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(1.2) contrast(1.1) grayscale(30%) sepia(10%)" }} 
                      allowFullScreen={false} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      className="opacity-70 group-hover/map:opacity-100 transition-opacity duration-500"
                    />
                    <div className="absolute bottom-4 left-4 z-20 pointer-events-none rounded-xl bg-[#0B0D0F]/80 backdrop-blur-md px-4 py-2 border border-white/10">
                      <p className="font-sans text-lg font-medium text-gold">Galigamuwa, Kegalle</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                    Business Hours
                  </h2>
                  <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#121518]/50 p-6 relative overflow-hidden group/hours">
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover/hours:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold mt-1">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-sans text-lg font-medium text-[#F5F1E8]">Monday – Friday</p>
                        <p className="text-base text-gold">09:00 AM – 05:00 PM</p>
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-white/5" />
                    <p className="text-sm leading-relaxed text-gray-400">
                      We aim to respond to all emails within <strong className="font-medium text-gray-300">2-4 hours</strong> during business days. For urgent matters, please call.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* FAQ Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
          className="mt-32 max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Questions
            </h2>
            <h3 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
              Frequently Asked Questions
            </h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="rounded-2xl border border-[#2A2E33] bg-[#181C20] overflow-hidden transition-colors hover:border-gold/30"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-sans text-lg font-medium text-[#F5F1E8] pr-8">
                    {faq.question}
                  </span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${openFaqIndex === index ? 'bg-gold text-[#0B0D0F]' : 'bg-white/5 text-gold'}`}>
                    <motion.div
                      initial={false}
                      animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {openFaqIndex === index ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </motion.div>
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaqIndex === index && (
                    <motion.div
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                      <div className="px-6 pb-6 text-base leading-7 text-gray-400">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.section>

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
