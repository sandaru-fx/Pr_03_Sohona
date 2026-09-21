"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { MemorialMediaItem } from "@/components/public/MemorialMediaItem";
import type { PublicMediaMetaItem } from "@/lib/public-profile";

type MemorialPhotoCarouselProps = {
  photos: PublicMediaMetaItem[];
  r2Configured: boolean;
};

export function MemorialPhotoCarousel({
  photos,
  r2Configured,
}: MemorialPhotoCarouselProps) {
  // Photo captions based on index
  const captions = [
    "Moments of Peace",
    "With Loved Ones",
    "A Life of Passion",
    "Sacred Journeys",
    "Cherished Memories",
    "Beautiful Days",
    "Together Forever",
    "Precious Moments",
  ];

  return (
    <div className="w-full px-4 sm:px-12 pb-6">
      <div className="flex w-full h-[500px] sm:h-[600px] md:h-[700px] gap-2 md:gap-4">
        {photos.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: Math.min(index * 0.15, 0.6), ease: [0.25, 0.1, 0.25, 1] }}
            className="group relative flex-1 hover:flex-[4] transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] overflow-hidden rounded-2xl border-2 border-[#D4AF37]/30 hover:border-[#D4AF37]/80 bg-[#0a0a09]"
          >
            {/* The Image inside */}
            <div className="absolute inset-0 w-full h-full">
              <MemorialMediaItem
                item={item}
                enabled={r2Configured}
                presentation="accordion"
              />
            </div>
            
            {/* Gradient Overlay for Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a09]/95 via-[#0a0a09]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out pointer-events-none" />
            
            {/* Caption (Visible on Hover) */}
            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-150 ease-out pointer-events-none">
              <h3 className="text-xl sm:text-2xl font-serif text-[#D4AF37] mb-3 drop-shadow-md leading-tight">
                {item.originalName?.replace(/\.[^.]+$/, "") ?? captions[index % captions.length]}
              </h3>
              <div className="w-12 h-[2px] bg-[#D4AF37]/60" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
