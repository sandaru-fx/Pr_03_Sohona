"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingParticles } from "@/components/public/FloatingParticles";
import { MemorialCover } from "@/components/public/MemorialCover";
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
  const [isEntered, setIsEntered] = useState(false);
  const [activeTab, setActiveTab] = useState<"memories" | "tributes">("memories");

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
      <AnimatePresence mode="wait">
        {!isEntered ? (
          <MemorialCover 
            key="cover" 
            displayName={displayName} 
            onEnter={() => setIsEntered(true)} 
          />
        ) : null}
      </AnimatePresence>

      {/* Floating candle-light particles */}
      <FloatingParticles count={25} className="z-0" />

      {isEntered ? (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="space-y-10 sm:space-y-12"
        >
          <header className="relative z-10 px-2 py-8 text-center sm:py-12">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 sm:w-96 sm:h-48 bg-[#C9A45C] blur-3xl opacity-10 rounded-full pointer-events-none" />
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold mt-16 sm:mt-8 relative z-10">
              In remembrance
            </p>
            <h1 className="mt-5 font-serif text-4xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl sm:leading-tight relative z-10">
          {displayName}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-8 text-gray-400 relative z-10">
          A quiet digital place to remember — preserved with care and privacy.
        </p>
        {pinProtected ? (
          <p className="mt-6 text-xs text-gray-500">
            Unlocked with PIN for this device session.
          </p>
        ) : null}
        </header>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center px-4"
        >
          <div className="relative flex w-full max-w-md rounded-full glass-panel p-1.5 shadow-lg">
            <button
              onClick={() => setActiveTab("memories")}
              className={`relative z-10 flex-1 rounded-full px-4 py-2.5 text-sm sm:text-base font-medium transition-colors ${
                activeTab === "memories" ? "text-[#0B0D0F]" : "text-gray-400 hover:text-gold"
              }`}
            >
              Memories & Photos
              {activeTab === "memories" && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 -z-10 rounded-full bg-gold"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("tributes")}
              className={`relative z-10 flex-1 rounded-full px-4 py-2.5 text-sm sm:text-base font-medium transition-colors ${
                activeTab === "tributes" ? "text-[#0B0D0F]" : "text-gray-400 hover:text-gold"
              }`}
            >
              Voice & Video
              {activeTab === "tributes" && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 -z-10 rounded-full bg-gold"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>
        </motion.div>

        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "memories" ? (
              <motion.div
                key="memories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-10 sm:space-y-12 pb-10"
              >
                <section className="px-2 sm:px-0">
                  <h2 className="font-serif text-2xl font-medium tracking-tight text-center text-gold">
                    Memories
                  </h2>
                  {statements.length === 0 ? (
                    <div className="mt-12 flex flex-col items-center justify-center text-center">
                      <div className="mb-4 text-gray-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                      </div>
                      <p className="font-serif text-lg italic text-gray-500">
                        When memories are ready, they will gently appear here...
                      </p>
                    </div>
                  ) : (
                    <ul className="mt-12 space-y-16">
                      {statements.map((item) => (
                        <li
                          key={item.id}
                          className="relative p-6 sm:p-10 text-center"
                        >
                          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-8 text-8xl font-serif text-gold/10 select-none">
                            “
                          </span>
                          <p className="relative z-10 text-xl sm:text-2xl font-serif italic leading-loose text-[#F5F1E8]">
                            {item.body}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent my-12" />

                <section className="px-6 py-4 sm:px-8 text-center">
                  <h2 className="font-serif text-2xl font-medium tracking-tight text-[#F5F1E8]">
                    Photographs
                  </h2>
                  
                  {!r2Configured && photos.length > 0 ? (
                    <Alert tone="warning" className="mt-6">
                      Media playback is paused while storage is reconnecting.
                    </Alert>
                  ) : null}

                  {photos.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center text-center">
                      <div className="mb-4 text-gray-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                      <p className="font-serif text-lg italic text-gray-500">
                        When memories are ready, photos will appear here...
                      </p>
                    </div>
                  ) : (
                    <div className="mt-10 columns-1 sm:columns-2 gap-4 space-y-4 text-left">
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
                  )}
                </section>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent my-12" />

                <div>
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
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="tributes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="pb-10"
              >
                <section className="px-6 py-8 sm:px-8 sm:py-10 text-center">
                  <h2 className="font-serif text-2xl font-medium tracking-tight text-[#F5F1E8]">
                    Voice & Video Tributes
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-gray-500 font-serif italic">
                    Listen and watch personal messages shared by family and friends.
                  </p>

                  {!r2Configured && (videos.length > 0 || voices.length > 0) ? (
                    <Alert tone="warning" className="mt-6">
                      Media playback is paused while storage is reconnecting.
                    </Alert>
                  ) : null}

                  {videos.length === 0 && voices.length === 0 ? (
                    <div className="mt-12 flex flex-col items-center justify-center text-center">
                      <div className="mb-4 text-gray-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                      </div>
                      <p className="font-serif text-lg italic text-gray-500">
                        When memories are ready, tributes will appear here...
                      </p>
                    </div>
                  ) : (
                    <ul className="mt-8 overflow-hidden rounded-xl border border-white/5 bg-[#0B0D0F]/60">
                      {[...videos, ...voices].map((item) => (
                        <MemorialMediaItem
                          key={item.id}
                          item={item}
                          enabled={r2Configured}
                          presentation="list"
                        />
                      ))}
                    </ul>
                  )}
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
        </motion.div>
      ) : null}
    </div>
  );
}
