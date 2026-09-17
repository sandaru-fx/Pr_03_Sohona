"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileAudio, FileImage, FileVideo, Loader2, Play, Pause, X } from "lucide-react";
import type { PublicMediaMetaItem } from "@/lib/public-profile";
import { cn } from "@/lib/utils";

type MemorialMediaItemProps = {
  item: PublicMediaMetaItem;
  enabled: boolean;
  presentation?: "list" | "gallery";
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaIcon({ kind }: { kind: PublicMediaMetaItem["kind"] }) {
  if (kind === "PHOTO") return <FileImage className="h-4 w-4" aria-hidden />;
  if (kind === "VIDEO") return <FileVideo className="h-4 w-4" aria-hidden />;
  return <FileAudio className="h-4 w-4" aria-hidden />;
}

export function MemorialMediaItem({
  item,
  enabled,
  presentation = "list",
}: MemorialMediaItemProps) {
  const rootRef = useRef<HTMLLIElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !visible) return;

    let cancelled = false;

    async function loadUrl(force = false) {
      if (!force && url && expiresAt && expiresAt - Date.now() > 15_000) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/public/media/${item.id}/url`, {
          method: "GET",
          cache: "no-store",
        });
        const data = (await response.json().catch(() => ({}))) as {
          url?: string;
          expiresIn?: number;
          message?: string;
          error?: string;
        };

        if (!response.ok || !data.url) {
          if (!cancelled) {
            setError(
              data.message ??
                data.error ??
                "Something went wrong while loading this memory.",
            );
            setUrl(null);
          }
          return;
        }

        if (!cancelled) {
          setUrl(data.url);
          setExpiresAt(
            Date.now() + Math.max(30, (data.expiresIn ?? 90) - 5) * 1000,
          );
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong while loading this memory.");
          setUrl(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadUrl(false);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, visible, item.id]);

  async function retry() {
    setUrl(null);
    setExpiresAt(null);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/public/media/${item.id}/url`, {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        expiresIn?: number;
        message?: string;
        error?: string;
      };
      if (!response.ok || !data.url) {
        setError(
          data.message ??
            data.error ??
            "Something went wrong while loading this memory.",
        );
        return;
      }
      setUrl(data.url);
      setExpiresAt(
        Date.now() + Math.max(30, (data.expiresIn ?? 90) - 5) * 1000,
      );
    } catch {
      setError("Something went wrong while loading this memory.");
    } finally {
      setLoading(false);
    }
  }

  function toggleAudio() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }

  function handleAudioTimeUpdate() {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    if (duration > 0) {
      setAudioProgress((current / duration) * 100);
    }
  }

  function handleAudioEnded() {
    setIsPlaying(false);
    setAudioProgress(0);
  }

  return (
    <li
      ref={rootRef}
      className={cn(
        "space-y-3",
        presentation === "list" &&
          "border-b border-[#2A2E33] px-4 py-5 last:border-b-0",
        presentation === "gallery" &&
          "overflow-hidden rounded-xl border border-[#2A2E33] bg-[#0B0D0F]/50 p-3",
      )}
    >
      <div className="flex items-center gap-3 text-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#181C20] text-gray-400">
          <MediaIcon kind={item.kind} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-[#F5F1E8]">
            {item.originalName ?? item.kind}
          </p>
          <p className="text-xs text-gray-500">
            {item.kind} · {formatBytes(item.sizeBytes)}
          </p>
        </div>
      </div>

      {!enabled ? (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          Media storage is reconnecting. Playback will return shortly.
        </p>
      ) : null}

      {enabled && loading && !url ? (
        <div className="flex h-44 items-center justify-center rounded-xl bg-[#0B0D0F]/60 text-sm text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Loading secure preview…
        </div>
      ) : null}

      {enabled && error ? (
        <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-3 text-sm text-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void retry()}
            className="mt-2 text-sm font-medium underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      {enabled && url ? (
        <div className="overflow-hidden rounded-xl bg-[#0B0D0F]">
          {item.kind === "PHOTO" ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={item.originalName ?? "Memorial photo"}
                className="max-h-[28rem] w-full object-cover cursor-zoom-in transition duration-300 hover:opacity-90"
                onError={() => void retry()}
                onClick={() => setIsZoomed(true)}
              />
              <AnimatePresence>
                {isZoomed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D0F]/90 backdrop-blur-sm p-4"
                    onClick={() => setIsZoomed(false)}
                  >
                    <button
                      className="absolute right-6 top-6 rounded-full bg-[#181C20] p-2 text-gray-400 hover:text-white transition"
                      onClick={() => setIsZoomed(false)}
                    >
                      <X className="h-6 w-6" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={item.originalName ?? "Memorial photo enlarged"}
                      className="max-h-full max-w-full object-contain shadow-2xl rounded-sm cursor-zoom-out"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : null}
          {item.kind === "VIDEO" ? (
            <video
              key={url}
              controls
              playsInline
              preload="metadata"
              className="max-h-[28rem] w-full"
              onError={() => void retry()}
            >
              <source src={url} type={item.contentType} />
            </video>
          ) : null}
          {item.kind === "VOICE" ? (
            <div className="px-5 py-4 glass-panel rounded-xl flex items-center gap-4">
              <button
                type="button"
                onClick={toggleAudio}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-[#0B0D0F] hover:bg-gold-hover transition shadow-lg"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
              </button>
              <div className="flex-1 space-y-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#181C20]">
                  <div 
                    className="h-full bg-gold transition-all duration-100 ease-linear"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                  <span>Voice Note</span>
                  <span>{isPlaying ? "Playing" : "Paused"}</span>
                </div>
              </div>
              <audio
                ref={audioRef}
                key={url}
                preload="metadata"
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={handleAudioEnded}
                onError={() => void retry()}
                className="hidden"
              >
                <source src={url} type={item.contentType} />
              </audio>
            </div>
          ) : null}
        </div>
      ) : null}

      {enabled && !loading && !error && !url && visible ? (
        <p className="text-sm text-gray-500">Waiting for media…</p>
      ) : null}
    </li>
  );
}
