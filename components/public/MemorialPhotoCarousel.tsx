"use client";

import { motion } from "framer-motion";
import { MemorialMediaItem } from "@/components/public/MemorialMediaItem";
import type { PublicMediaMetaItem } from "@/lib/public-profile";

type MemorialPhotoCarouselProps = {
  photos: PublicMediaMetaItem[];
  r2Configured: boolean;
};

function PhotoCard({
  item,
  index,
  r2Configured,
  captions,
}: {
  item: PublicMediaMetaItem;
  index: number;
  r2Configured: boolean;
  captions: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl md:rounded-[2rem] border border-[#2A2E33]/60 bg-[#0B0D0F] shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-gold/10 hover:border-gold/30 hover:-translate-y-2 shrink-0"
    >
      {/* The Image inside */}
      <div className="absolute inset-0 w-full h-full scale-[1.02] transition-transform duration-[1.2s] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-110">
        <MemorialMediaItem
          item={item}
          enabled={r2Configured}
          presentation="accordion"
        />
      </div>
      
      {/* Gradient Overlay for Text */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050607] via-[#050607]/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700 ease-in-out pointer-events-none" />
      
      {/* Decorative Border Glow */}
      <div className="absolute inset-0 rounded-2xl md:rounded-[2rem] ring-1 ring-inset ring-white/10 group-hover:ring-gold/30 transition-all duration-500 pointer-events-none" />
      
      {/* Caption & Metadata (Visible on Hover / Always visible on mobile) */}
      <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6 translate-y-2 sm:translate-y-8 opacity-90 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-75 ease-out flex flex-col justify-end">
        <div className="pointer-events-auto flex items-end justify-between w-full gap-4">
          <div className="w-full">
            <h3 className="text-lg sm:text-xl font-serif text-[#F5F1E8] group-hover:text-gold transition-colors duration-500 mb-2 drop-shadow-md leading-tight line-clamp-1">
              {item.title || item.originalName?.replace(/\.[^.]+$/, "") || captions[index % captions.length]}
            </h3>
            
            <div className="w-0 group-hover:w-12 h-[2px] bg-gold/60 transition-all duration-700 ease-out mb-3 hidden sm:block" />
            
            {(item.dateTaken || item.location) && (
               <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
                 {item.dateTaken && <span>📅 {item.dateTaken}</span>}
                 {item.location && <span>📍 {item.location}</span>}
               </div>
            )}
            
            {item.description && (
              <p className="text-sm text-gray-300 mt-2 line-clamp-2 sm:line-clamp-none sm:h-0 sm:opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-700 delay-300">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
}

export function MemorialPhotoCarousel({
  photos,
  r2Configured,
}: MemorialPhotoCarouselProps) {
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
    <div className="w-full px-4 sm:px-12 pb-16">
      <div className="flex flex-wrap justify-center gap-3 sm:gap-6 max-w-7xl mx-auto">
        {photos.map((item, index) => (
          <PhotoCard
            key={item.id}
            item={item}
            index={index}
            r2Configured={r2Configured}
            captions={captions}
          />
        ))}
      </div>
    </div>
  );
}
