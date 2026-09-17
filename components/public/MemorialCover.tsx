"use client";

import { motion } from "framer-motion";
import { LotusOrnament } from "@/components/public/LotusOrnament";

type MemorialCoverProps = {
  displayName: string;
  onEnter: () => void;
};

export function MemorialCover({ displayName, onEnter }: MemorialCoverProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0D0F]"
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        >
          <LotusOrnament className="mb-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
        >
          <h1 className="font-serif text-4xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl lg:text-6xl">
            {displayName}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.4 }}
          className="mt-16"
        >
          <button
            onClick={onEnter}
            className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full border border-gold/30 bg-transparent px-8 py-3 text-sm tracking-[0.2em] uppercase text-gold transition-all hover:border-gold/60 hover:bg-gold/5"
          >
            <span>Open Memories</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
