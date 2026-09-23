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
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { WhatsAppWidget } from "@/components/site/WhatsAppWidget";
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
    <div 
      className="memorial-page relative w-full"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #171005 0%, #0A0A09 60%, #000000 100%)' }}
    >
      {/* Ambient particles — scattered across the whole page */}
      <FloatingParticles count={25} className="z-0 opacity-40 mix-blend-screen" />

      {/* ═══════════════════════════════════════════════
          HERO SECTION — Full-width cinematic
          ═══════════════════════════════════════════════ */}
      <MemorialHero displayName={displayName} pinProtected={pinProtected} heroPhoto={photos[0] ?? null} r2Configured={r2Configured} />
      <MemorialNavigation story={statements.length > 0} photos={photos.length} voices={voices.length} videos={videos.length} />

      {/* ═══════════════════════════════════════════════
          CONTENT SECTIONS — max-width constrained
          ═══════════════════════════════════════════════ */}
      <div id="memories" className="memorial-content relative z-10">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Left — decorative heading (Sticky on Desktop) */}
              <div className="lg:col-span-4">
                <div className="memorial-story-title flex flex-col gap-6 lg:sticky lg:top-32">
                  <span className="memorial-chapter">01 / A life in memories</span>
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight text-[#F2EDE3]">
                    A Life
                    <br />
                    Well Lived
                  </h2>
                  <div className="w-16 h-[2px] bg-gold/40" />
                </div>
              </div>

              {/* Right — body text */}
              <div className="memorial-story-copy space-y-6 lg:col-span-8 memorial-glass-card p-8 sm:p-10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                {statements.slice(0, 2).map((stmt) => {
                  const clean = stmt.body
                    .replace(/#{1,6}\s?/g, "")
                    .replace(/\*\*(.*?)\*\*/g, "$1")
                    .replace(/\*(.*?)\*/g, "$1")
                    .replace(/__(.*?)__/g, "$1")
                    .replace(/_(.*?)_/g, "$1");
                  
                  return clean.split(/\n+/).map((para, i) => {
                    if (!para.trim()) return null;
                    return (
                      <p key={`${stmt.id}-${i}`} className="font-sans text-base sm:text-lg leading-relaxed text-[#D4C3AD] relative z-10">
                        {para.trim()}
                      </p>
                    );
                  });
                })}
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

            <div className="text-center max-w-4xl mx-auto space-y-16 relative memorial-glass-card p-10 sm:p-16">
              {/* Giant background quote mark */}
              <div className="absolute -top-10 left-4 sm:left-12 text-[120px] sm:text-[180px] leading-none font-serif text-gold/[0.08] pointer-events-none select-none">
                &ldquo;
              </div>
              
              {statements.slice(2).map((item) => (
                <div key={item.id} className="relative z-10">
                  <p className="font-serif text-2xl sm:text-3xl lg:text-4xl italic leading-relaxed text-[#F2EDE3]/90 drop-shadow-md">
                    &ldquo;{item.body}&rdquo;
                  </p>
                </div>
              ))}
              <p className="text-sm tracking-[0.2em] uppercase text-gold/60 relative z-10 font-medium">
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
        <footer className="memorial-photo-footer relative isolate overflow-hidden px-6 sm:px-12 pt-24 pb-12 sm:pt-36 sm:pb-20 min-h-[300px]">
          <div className="absolute inset-0 -z-20" aria-hidden="true">
            <Image src="/images/ec0e42cd-5466-47aa-8064-c56c1f154779.png" alt="" fill sizes="100vw" className="memorial-footer-image" />
          </div>
          <div className="memorial-footer-shade absolute inset-0 -z-10" />
          {/* Decorative top border */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl">
            <OrnamentalDivider />
          </div>
          
          {/* Contact Information */}
          <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center justify-center text-center mt-12 pb-8">
            <div className="inline-flex items-center gap-3 mb-8">
              <Image
                src="/logo.jpeg"
                alt="Mathaka QR Logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-md object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
              />
              <p className="whitespace-nowrap font-sans text-2xl font-semibold tracking-tight text-[#e6d7bb] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                Mathaka <span className="text-[#e6c68a]">QR</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start justify-center gap-8 sm:gap-16 text-sm sm:text-base font-medium text-[#d1c4ad] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3 text-left">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-[#e6c68a]" />
                  <span className="leading-tight">076 804 6019<br />077 488 0604<br />077 948 9397</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <MessageCircle className="h-5 w-5 shrink-0 text-[#e6c68a]" />
                  <span>076 894 6019 (WhatsApp)</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3 text-left">
                  <Mail className="h-5 w-5 shrink-0 text-[#e6c68a]" />
                  <span>mathakaqr@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <MapPin className="h-5 w-5 shrink-0 text-[#e6c68a]" />
                  <span>Galigamuwa, Kegalle</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
        
        {/* Floating Live Chat Widget */}
        <WhatsAppWidget />
      </div>
    </div>
    </MotionConfig>
  );
}
