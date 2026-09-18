"use client";

import { useEffect, useState } from "react";
import { ArrowUp, BookOpen, Camera, Heart, Headphones, Film } from "lucide-react";

export function MemorialNavigation({ story, photos, voices, videos }: { story: boolean; photos: number; voices: number; videos: number }) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const ids = ["story", "photographs", "voices", "videos", "messages"];
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = "";
        for (const id of ids) {
          const section = document.getElementById(id);
          if (section && section.getBoundingClientRect().top <= 180) current = id;
        }
        setActive(current);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); cancelAnimationFrame(frame); };
  }, []);
  const sections = [
    { id: "story", label: "Their story", icon: BookOpen, show: story, count: 0 },
    { id: "photographs", label: "Photographs", icon: Camera, show: photos > 0, count: photos },
    { id: "voices", label: "Voices", icon: Headphones, show: voices > 0, count: voices },
    { id: "videos", label: "Films", icon: Film, show: videos > 0, count: videos },
    { id: "messages", label: "Tributes", icon: Heart, show: true, count: 0 },
  ];
  return <nav className="memorial-nav" aria-label="Memorial sections">
    <div className="memorial-nav-links">
      {sections.filter(section => section.show).map(({ id, label, icon: Icon, count }) => (
        <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}>
          <Icon size={15} strokeWidth={1.4} aria-hidden="true" /><span className="memorial-nav-label">{label}</span>{count > 0 && <span className="memorial-nav-count">{count}</span>}
        </a>
      ))}
    </div>
    <a href="#memorial-top" className="memorial-back-top" aria-label="Back to memorial cover"><ArrowUp size={17} /></a>
  </nav>;
}
