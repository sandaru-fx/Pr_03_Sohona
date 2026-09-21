"use client";

import Image from "next/image";
import { ArrowDown, LockKeyhole } from "lucide-react";
import { LotusOrnament } from "@/components/public/LotusOrnament";
import { FloatingParticles } from "@/components/public/FloatingParticles";
import type { PublicMediaMetaItem } from "@/lib/public-profile";
import { useEffect, useState } from "react";
import styles from "./MemorialHero.module.css";

type MemorialHeroProps = {
  displayName: string;
  pinProtected: boolean;
  heroPhoto?: PublicMediaMetaItem | null;
  r2Configured?: boolean;
};

export function MemorialHero({ displayName, pinProtected, heroPhoto, r2Configured }: MemorialHeroProps) {
  const initial = Array.from(displayName.trim())[0] ?? "✦";
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!heroPhoto || !r2Configured) return;

    let cancelled = false;
    async function loadUrl() {
      try {
        const response = await fetch(`/api/public/media/${heroPhoto!.id}/url`, {
          method: "GET",
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.url && !cancelled) {
          setPhotoUrl(data.url);
        }
      } catch (err) {
        // ignore
      }
    }
    void loadUrl();
    return () => { cancelled = true; };
  }, [heroPhoto, r2Configured]);
  return (
    <header id="memorial-top" className={styles.hero}>
      <div className={styles.artwork} aria-hidden="true" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
        <Image src="/images/90f9b40d-d30c-46e9-91f5-23b22b6bff19.png" alt="" fill sizes="(max-width: 1100px) 1100px, 100vw" preload className={styles.image} />
        {photoUrl ? (
          <div className={styles.heroProfileWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt={`Profile photo of ${displayName}`} className={styles.heroProfilePhoto} />
          </div>
        ) : (
          <div className={styles.monogram}><span>{initial}</span><LotusOrnament /></div>
        )}
      </div>
      <div className={styles.shade} />
      
      {/* Top Left Logo Text */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-50 drop-shadow-md pointer-events-none">
        <p className="whitespace-nowrap font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-[#e6d7bb]">
          Mathaka <span className="text-[#e6c68a]">QR</span>
        </p>
      </div>
      
      {/* 3D Depth Firefly Particles over the photo */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        <FloatingParticles count={75} />
      </div>

      <div className={styles.identity}>
        <p className={styles.eyebrow}>In loving memory</p>
        <h1>{displayName}</h1>
        <div className={styles.divider} aria-hidden="true"><span /><LotusOrnament /><span /></div>
        <p className={styles.dedication}>Forever loved. Forever remembered.</p>
        <a href="#memories" className={styles.explore}><span>Explore memories</span><ArrowDown size={19} strokeWidth={1.3} /></a>
        {pinProtected && <p className={styles.privacy}><LockKeyhole size={12} /> Unlocked for this visit</p>}
      </div>
    </header>
  );
}
