"use client";

import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/public/FloatingParticles";
import { LotusOrnament } from "@/components/public/LotusOrnament";
import { MemorialComments } from "@/components/public/MemorialComments";
import { OrnamentalDivider } from "@/components/public/OrnamentalDivider";
import { MemorialPhotoCarousel } from "@/components/public/MemorialPhotoCarousel";
import { MemorialMediaItem } from "@/components/public/MemorialMediaItem";
import { Alert } from "@/components/ui/Alert";
import type {
  PublicCommentItem,
  PublicMediaMetaItem,
  PublicStatementItem,
} from "@/lib/public-profile";

type MemorialViewProps = {
  displayName: string;
  qrId: string;
  packageId: string;
  statements: PublicStatementItem[];
  media: PublicMediaMetaItem[];
  comments: PublicCommentItem[];
  commentQuota: {
    used: number;
    max: number;
    nextMaxWords: number | null;
  };
  pinProtected: boolean;
  r2Configured: boolean;
};

export function MemorialView({
  displayName,
  qrId,
  packageId = "",
  statements,
  media,
  comments,
  commentQuota,
  pinProtected,
  r2Configured,
}: MemorialViewProps) {
  const photos = media.filter((item) => item.kind === "PHOTO");
  const videos = media.filter((item) => item.kind === "VIDEO");
  const voices = media.filter((item) => item.kind === "VOICE");

  const portraitUrl = null;
  const shortLine = "Forever loved. Forever remembered.";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative w-full bg-[#0A0A09]">
      {/* Ambient particles — very subtle, few */}
      <FloatingParticles count={5} className="z-0 opacity-20" />

      {/* ═══════════════════════════════════════════════
          HERO SECTION — Full-width cinematic
          ═══════════════════════════════════════════════ */}
      <header 
        className="relative min-h-screen flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A09]/40 via-[#0A0A09]/60 to-[#0A0A09]" />

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="relative z-20 flex items-center justify-between px-6 sm:px-12 pt-6 sm:pt-8 max-w-7xl mx-auto w-full"
        >
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
          >
            <LotusOrnament className="scale-[0.45] origin-left -my-4 -mx-2 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-gold ml-1">
              Mathaka QR
            </span>
          </a>
          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-gold/40 hidden sm:block">
            Memories Live Forever
          </span>
        </motion.div>

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 sm:px-12 pb-12">
          {/* Decorative side quote — left (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="absolute left-8 sm:left-16 top-1/3 -translate-y-1/2 hidden lg:flex flex-col gap-4 max-w-[180px]"
          >
            <p className="font-serif italic text-base leading-relaxed text-[#AAA398]/80">
              &ldquo;A beautiful life leaves a light that never fades.&rdquo;
            </p>
            <div className="w-12 h-[1px] bg-gold/30" />
          </motion.div>

          {/* Portrait: Shrine Niche Arch Style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
            className="relative w-48 h-64 sm:w-56 sm:h-[320px] md:w-64 md:h-[360px] overflow-hidden rounded-t-[999px] rounded-b-none border border-b-0 border-[rgba(200,155,69,0.4)] shadow-[0_0_60px_rgba(196,139,55,0.15),inset_0_0_40px_rgba(0,0,0,0.4)] bg-[#050504]/40 backdrop-blur-md"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
            }}
          >
            {/* Ambient inner glow for the arch */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(227,189,106,0.12)_0%,transparent_60%)] pointer-events-none" />

            {portraitUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portraitUrl}
                  alt={displayName}
                  className="w-full h-full object-cover mix-blend-luminosity sepia-[0.3]"
                />
                {/* Vignette effect for real photo */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(9,8,6,0.9)_100%)] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A09] via-black/40 to-transparent opacity-90" />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <div className="text-6xl sm:text-7xl font-serif text-gold/70 mb-4 z-10" style={{ textShadow: "0 0 30px rgba(200,155,69,0.4)" }}>
                  {initial}
                </div>
                <LotusOrnament className="opacity-[0.25] scale-[0.85] absolute mt-16 z-0" />
              </div>
            )}
          </motion.div>

          {/* Name + meta stack */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-8 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-gold"
          >
            In Loving Memory
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-3 font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#F2EDE3] leading-tight"
          >
            {displayName}
          </motion.h1>

          {/* Hardcoded dates for design matching as requested */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-4 text-[9px] uppercase tracking-[0.3em] text-[#AAA398]"
          >
            12 MARCH 1990 — 18 SEPTEMBER 2024
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="mt-4 flex items-center justify-center gap-3"
          >
            <div className="w-6 h-[1px] bg-gold/20" />
            <div className="w-1.5 h-1.5 rotate-45 border border-gold/40" />
            <div className="w-6 h-[1px] bg-gold/20" />
          </motion.div>

          {shortLine && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="mt-5 text-lg sm:text-xl font-serif italic text-[#F2EDE3]/90 max-w-md text-center"
            >
              &ldquo;{shortLine}&rdquo;
            </motion.p>
          )}

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="mt-12 sm:mt-16 flex flex-col items-center gap-2 text-gold/30"
          >
            <span className="text-[9px] uppercase tracking-[0.25em]">
              Explore memories
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>

        {pinProtected && (
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-[#746F67] z-20">
            Unlocked with PIN for this device session.
          </p>
        )}
      </header>

      {/* ═══════════════════════════════════════════════
          CONTENT SECTIONS — max-width constrained
          ═══════════════════════════════════════════════ */}
      <div className="relative z-10">
        {/* THEIR STORY — two-column editorial */}
        {statements.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto px-6 sm:px-12 py-20 sm:py-32"
          >
            <OrnamentalDivider label="Their Story" className="mb-16 sm:mb-20 max-w-lg mx-auto" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Left — decorative heading */}
              <div className="flex flex-col gap-6">
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight text-[#F2EDE3]">
                  A Life
                  <br />
                  Well Lived
                </h2>
                <div className="w-16 h-[2px] bg-gold/40" />
              </div>

              {/* Right — body text */}
              <div className="space-y-6">
                <p className="font-sans text-base sm:text-lg leading-relaxed text-[#AAA398]">
                  {statements[0].body}
                </p>
                {statements.length > 1 && statements[1] && (
                  <p className="font-sans text-base sm:text-lg leading-relaxed text-[#AAA398]">
                    {statements[1].body}
                  </p>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* WORDS FROM FAMILY — large centered quote */}
        {statements.length > 2 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto px-6 sm:px-12 py-16 sm:py-24"
          >
            <OrnamentalDivider label="Words from Family" className="mb-16 max-w-lg mx-auto" />

            <div className="text-center max-w-4xl mx-auto space-y-16 relative">
              {/* Giant background quote mark */}
              <div className="absolute -top-10 -left-4 sm:-left-12 text-[120px] sm:text-[180px] leading-none font-serif text-gold/[0.04] pointer-events-none select-none">
                &ldquo;
              </div>
              
              {statements.slice(2).map((item) => (
                <div key={item.id} className="relative z-10">
                  <p className="font-serif text-2xl sm:text-3xl lg:text-4xl italic leading-relaxed text-[#F2EDE3]/90">
                    &ldquo;{item.body}&rdquo;
                  </p>
                </div>
              ))}
              <p className="text-sm tracking-[0.2em] uppercase text-gold/50 relative z-10">
                — A Loving Family —
              </p>
            </div>
          </motion.section>
        )}

        {/* PHOTOGRAPHS — horizontal carousel */}
        {photos.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="py-16 sm:py-24"
          >
            <div className="max-w-6xl mx-auto px-6 sm:px-12 mb-12">
              <OrnamentalDivider label="Memories in Photographs" className="max-w-lg mx-auto" />
            </div>

            {!r2Configured ? (
              <Alert tone="warning" className="mb-10 max-w-xl mx-auto">
                Media playback is paused while storage is reconnecting.
              </Alert>
            ) : null}

            <MemorialPhotoCarousel photos={photos} r2Configured={r2Configured} />
          </motion.section>
        )}

        {/* VOICE TRIBUTES — cinematic audio player */}
        {voices.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto px-6 sm:px-12 py-16 sm:py-24"
          >
            <OrnamentalDivider label="Voices We Remember" className="mb-12 max-w-lg mx-auto" />

            {!r2Configured ? (
              <Alert tone="warning" className="mb-10 max-w-xl mx-auto">
                Media playback is paused while storage is reconnecting.
              </Alert>
            ) : null}

            <div className="space-y-6">
              {voices.map((item) => (
                <div
                  key={item.id}
                  className="memorial-glass-card overflow-hidden"
                >
                  <MemorialMediaItem
                    item={item}
                    enabled={r2Configured}
                    presentation="voice"
                  />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* VIDEO TRIBUTES */}
        {videos.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto px-6 sm:px-12 py-16 sm:py-24"
          >
            <OrnamentalDivider label="Video Tributes" className="mb-12 max-w-lg mx-auto" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden border border-gold/10"
                >
                  <MemorialMediaItem
                    item={item}
                    enabled={r2Configured}
                    presentation="video"
                  />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* MESSAGES OF REMEMBRANCE */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-6 sm:px-12 py-16 sm:py-24"
        >
          <OrnamentalDivider label="Messages of Remembrance" className="mb-12 max-w-lg mx-auto" />

          <MemorialComments
            qrId={qrId}
            packageId={packageId}
            initialComments={comments.map((item) => ({
              ...item,
              createdAt: item.createdAt,
            }))}
            used={commentQuota.used}
            max={commentQuota.max}
            nextMaxWords={commentQuota.nextMaxWords}
          />
        </motion.section>

        {/* ═══════════════════════════════════════════════
            FOOTER — richly decorated
            ═══════════════════════════════════════════════ */}
        <footer className="relative px-6 sm:px-12 pt-16 pb-12 sm:pt-24 sm:pb-16">
          {/* Decorative top border */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl">
            <OrnamentalDivider />
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center text-center">
            {/* Left decorative quote */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="hidden lg:block text-left"
            >
              <p className="text-[9px] uppercase tracking-[0.25em] leading-relaxed text-[#746F67]">
                Some people
                <br />
                make the world
                <br />
                a kinder place
              </p>
            </motion.div>

            {/* Center — memorial info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold/60">
                In Loving Remembrance
              </p>
              <p className="font-serif text-2xl sm:text-3xl text-[#F2EDE3]">
                {displayName}
              </p>
              {shortLine && (
                <p className="font-serif italic text-sm text-[#AAA398] max-w-xs">
                  &ldquo;{shortLine}&rdquo;
                </p>
              )}

              <div className="w-8 h-[1px] bg-gold/20 my-4" />

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#746F67]">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                This memorial is privately preserved by the family.
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-semibold tracking-[0.25em] text-[#F2EDE3]/80 uppercase">
                  Sohona
                </p>
                <p className="text-[9px] tracking-wider text-[#746F67] mt-1">
                  Digital memories, preserved with care.
                </p>
              </div>
            </motion.div>

            {/* Right decorative quote */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="hidden lg:block text-right"
            >
              <p className="text-[9px] uppercase tracking-[0.25em] leading-relaxed text-[#746F67]">
                Memories
                <br />
                connect us
                <br />
                always
              </p>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  );
}
