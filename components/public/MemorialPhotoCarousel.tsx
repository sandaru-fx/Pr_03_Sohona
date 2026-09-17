"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = photos.length;

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth
      : 300;
    const gap = 24;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(index, totalSlides - 1));
  }, [totalSlides]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActiveIndex, { passive: true });
    return () => el.removeEventListener("scroll", updateActiveIndex);
  }, [updateActiveIndex]);

  function scrollNext() {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth
      : 300;
    el.scrollBy({ left: cardWidth + 24, behavior: "smooth" });
  }

  function scrollToIndex(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth
      : 300;
    el.scrollTo({ left: index * (cardWidth + 24), behavior: "smooth" });
  }

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
    <div className="relative">
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 sm:px-12 pb-6"
      >
        {photos.map((item, index) => (
          <motion.div
            key={item.id}
            className="flex-none w-[260px] sm:w-[300px] snap-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.4) }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-gold/10 warm-image-overlay">
              <MemorialMediaItem
                item={item}
                enabled={r2Configured}
                presentation="gallery"
              />
            </div>
            <p className="mt-3 text-center text-sm font-serif italic text-[#AAA398]">
              {item.originalName?.replace(/\.[^.]+$/, "") ?? captions[index % captions.length]}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Navigation arrow */}
      {totalSlides > 1 && (
        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-[#0A0A09]/80 text-gold/60 hover:text-gold hover:border-gold/40 transition-all backdrop-blur-sm"
          aria-label="Next photo"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Dot indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {photos.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 bg-gold"
                  : "w-1.5 bg-gold/20 hover:bg-gold/40"
              }`}
              aria-label={`Go to photo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
