"use client";

import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/public/FloatingParticles";
import { LotusOrnament } from "@/components/public/LotusOrnament";
import { MemorialComments } from "@/components/public/MemorialComments";
import { OrnamentalDivider } from "@/components/public/OrnamentalDivider";
import { MemorialMediaItem } from "@/components/public/MemorialMediaItem";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
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

  return (
    <div className="relative w-full max-w-2xl space-y-10 sm:space-y-12">
      {/* Floating candle-light particles */}
      <FloatingParticles count={25} className="z-0" />

      <motion.header 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 px-2 py-8 text-center sm:py-12"
      >
        {/* Lotus ornament */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="mb-6 flex justify-center"
        >
          <LotusOrnament />
        </motion.div>

        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
          In remembrance
        </p>
        <h1 className="mt-5 font-serif text-4xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl sm:leading-tight">
          {displayName}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-8 text-gray-400">
          A quiet digital place to remember — preserved with care and privacy.
        </p>
        {pinProtected ? (
          <p className="mt-6 text-xs text-gray-500">
            Unlocked with PIN for this device session.
          </p>
        ) : null}
      </motion.header>

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="px-2 sm:px-0"
      >
        <h2 className="font-serif text-2xl font-medium tracking-tight text-center text-gold">
          Memories
        </h2>
        {statements.length === 0 ? (
          <EmptyState
            className="mt-6 glass-panel rounded-2xl"
            title="No statements have been added yet."
            description="When the family is ready, words of remembrance will appear here."
          />
        ) : (
          <ul className="mt-8 space-y-6">
            {statements.map((item) => (
              <li
                key={item.id}
                className="relative glass-panel rounded-2xl p-8 sm:p-10 text-center"
              >
                <span className="absolute left-4 top-4 text-6xl font-serif text-gold-subtle select-none">
                  "
                </span>
                <p className="relative z-10 text-lg sm:text-xl font-serif italic leading-relaxed text-[#F5F1E8]">
                  {item.body}
                </p>
                <span className="absolute right-4 bottom-[-10px] text-6xl font-serif text-gold-subtle select-none">
                  "
                </span>
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      {/* Ornamental divider */}
      <OrnamentalDivider />

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel rounded-2xl px-6 py-8 sm:px-8 sm:py-10"
      >
        <h2 className="font-serif text-2xl font-medium tracking-tight text-[#F5F1E8]">
          Photographs & media
        </h2>
        <p className="mt-3 text-sm leading-7 text-gray-400">
          Media opens through short-lived secure links. Nothing is stored as a
          permanent public URL.
        </p>

        {!r2Configured && media.length > 0 ? (
          <Alert tone="warning" className="mt-6">
            Media playback is paused while storage is reconnecting. Metadata
            still shows what the family uploaded.
          </Alert>
        ) : null}

        {media.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No photographs have been added yet."
            description="When memories are ready, photos, video, and voice will appear here."
          />
        ) : (
          <div className="mt-8 space-y-6">
            {photos.length > 0 ? (
              <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                {photos.map((item) => (
                  <div key={item.id} className="break-inside-avoid">
                    <MemorialMediaItem
                      item={item}
                      enabled={r2Configured}
                      presentation="gallery"
                    />
                  </div>
                ))}
              </div>
            ) : null}
            {videos.length > 0 || voices.length > 0 ? (
              <ul className="overflow-hidden rounded-xl border border-[#2A2E33]">
                {[...videos, ...voices].map((item) => (
                  <MemorialMediaItem
                    key={item.id}
                    item={item}
                    enabled={r2Configured}
                    presentation="list"
                  />
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </motion.section>

      {/* Ornamental divider */}
      <OrnamentalDivider />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
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
      </motion.div>

      {/* Respectful closing footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center gap-4 px-2 pb-6 pt-4 text-center"
      >
        <OrnamentalDivider className="w-full max-w-xs" />
        <div className="flex items-center gap-2 text-gold/70">
          <svg width="18" height="24" viewBox="0 0 18 24" fill="none" aria-hidden="true">
            {/* Candle body */}
            <rect x="6" y="10" width="6" height="12" rx="1" fill="currentColor" opacity="0.5" />
            {/* Flame */}
            <path d="M9 2C9 2 12 6 12 8.5C12 10.5 10.5 12 9 12C7.5 12 6 10.5 6 8.5C6 6 9 2 9 2Z" fill="currentColor" opacity="0.8">
              <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
            </path>
          </svg>
          <p className="font-serif text-sm italic tracking-wide text-gold/60">
            A light that never fades
          </p>
        </div>
        <p className="max-w-sm text-[11px] leading-5 text-gray-600">
          Family memories are private. Organization administrators cannot view
          statements, media, or comments.
        </p>
      </motion.footer>
    </div>
  );
}
