"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    setAtStart(scrollLeft <= 2);
    setAtEnd(scrollLeft + el.clientWidth >= el.scrollWidth - 2);
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
    const observer = new ResizeObserver(updateActiveIndex);
    observer.observe(el);
    return () => { el.removeEventListener("scroll", updateActiveIndex); observer.disconnect(); };
  }, [updateActiveIndex]);

  function scrollNext(direction = 1) {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth
      : 300;
    el.scrollBy({ left: (cardWidth + 24) * direction, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function scrollToIndex(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth
      : 300;
    el.scrollTo({ left: index * (cardWidth + 24), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
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

      {totalSlides > 1 && <div className="memorial-gallery-controls">
        <button type="button" disabled={atStart} onClick={() => scrollNext(-1)} aria-label="Previous photographs"><ChevronLeft size={20} /></button>
        <span>Browse {totalSlides} photographs</span>
        <button type="button" disabled={atEnd} onClick={() => scrollNext(1)} aria-label="Next photographs"><ChevronRight size={20} /></button>
      </div>}
      {totalSlides > 1 && <div className="memorial-gallery-dots">
        {photos.map((photo, index) => <button key={photo.id} type="button" onClick={() => scrollToIndex(index)} aria-label={`Go to photo ${index + 1}`} aria-pressed={index === activeIndex}><span /></button>)}
      </div>}
    </div>
  );
}
