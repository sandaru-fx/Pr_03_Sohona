"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, LockKeyhole } from "lucide-react";
import { LotusOrnament } from "@/components/public/LotusOrnament";
import styles from "./MemorialHero.module.css";

export function MemorialHero({ displayName, pinProtected }: { displayName: string; pinProtected: boolean }) {
  const initial = Array.from(displayName.trim())[0] ?? "✦";
  return (
    <header id="memorial-top" className={styles.hero}>
      <div className={styles.artwork} aria-hidden="true">
        <Image src="/memorial-sanctuary.webp" alt="" fill sizes="(max-width: 1100px) 1100px, 100vw" preload className={styles.image} />
        <div className={styles.monogram}><span>{initial}</span><LotusOrnament /></div>
      </div>
      <div className={styles.shade} />
      <div className={styles.topbar}>
        <Link href="/" aria-label="Mathaka QR home" className={styles.brand}><LotusOrnament /><span>Mathaka QR</span></Link>
        <span className={styles.tagline}>Memories live forever</span>
      </div>
      <blockquote className={styles.quote}>A beautiful life<br />leaves a light<br />that never fades.<span /></blockquote>
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
