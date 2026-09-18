"use client";

import { motion, MotionConfig } from "framer-motion";
import Image from "next/image";
import { MemorialNavigation } from "@/components/public/MemorialNavigation";
import { MemorialHero } from "@/components/public/MemorialHero";
import { FloatingParticles } from "@/components/public/FloatingParticles";
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

  const shortLine = "Forever loved. Forever remembered.";



  return (
    <MotionConfig reducedMotion="user">
    <div className="memorial-page relative w-full bg-[#0A0A09]">
      {/* Ambient particles — very subtle, few */}
      <FloatingParticles count={5} className="z-0 opacity-20" />

      {/* ═══════════════════════════════════════════════
          HERO SECTION — Full-width cinematic
          ═══════════════════════════════════════════════ */}
      <MemorialHero displayName={displayName} pinProtected={pinProtected} />
      <MemorialNavigation story={statements.length > 0} photos={photos.length} voices={voices.length} videos={videos.length} />

      {/* ═══════════════════════════════════════════════
          CONTENT SECTIONS — max-width constrained
          ═══════════════════════════════════════════════ */}
      <div id="memories" className="memorial-content relative z-10">
        <div className="memorial-welcome"><span aria-hidden="true">✦</span><p>A life remembered.<br /><em>A connection that never fades.</em></p><span className="memorial-welcome-note">Stories, moments and voices<br />kept close, across generations.</span></div>
        {/* THEIR STORY — two-column editorial */}
        {statements.length > 0 && (
          <motion.section id="story"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto px-6 sm:px-12 py-16 sm:py-20"
          >
            <OrnamentalDivider label="Their Story" className="mb-12 sm:mb-14 max-w-lg mx-auto" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Left — decorative heading */}
              <div className="memorial-story-title flex flex-col gap-6">
                <span className="memorial-chapter">01 / A life in memories</span>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight text-[#F2EDE3]">
                  A Life
                  <br />
                  Well Lived
                </h2>
                <div className="w-16 h-[2px] bg-gold/40" />
              </div>

              {/* Right — body text */}
              <div className="memorial-story-copy space-y-6">
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
          <motion.section id="photographs"
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
          <motion.section id="voices"
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
          <motion.section id="videos"
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
        <motion.section id="messages"
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
        <footer className="memorial-photo-footer relative isolate overflow-hidden px-6 sm:px-12 pt-24 pb-12 sm:pt-36 sm:pb-20">
          <div className="absolute inset-0 -z-20" aria-hidden="true">
            <Image src="/images/memorial-footer-v2.webp" alt="" fill sizes="100vw" className="memorial-footer-image" />
          </div>
          <div className="memorial-footer-shade absolute inset-0 -z-10" />
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
                Memories preserved with love, for generations to come.
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
    </MotionConfig>
  );
}
