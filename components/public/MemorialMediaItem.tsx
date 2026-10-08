"use client";

import { useEffect, useRef, useState } from "react";
import { FileAudio, FileImage, FileVideo, Loader2, X, Maximize2 } from "lucide-react";
import type { PublicMediaMetaItem } from "@/lib/public-profile";
import { cn } from "@/lib/utils";

type MemorialMediaItemProps = {
  item: PublicMediaMetaItem;
  enabled: boolean;
  presentation?: "list" | "gallery" | "accordion" | "voice" | "video";
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayTitle = item.title || item.originalName || (item.kind === "VOICE" ? "Voice Tribute" : item.kind === "VIDEO" ? "Video Memory" : "Cherished Photograph");
  

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

  if (presentation === "accordion") {
    return (
      <div ref={rootRef} className="h-full w-full">
        {!enabled && (
          <div className="flex h-full items-center justify-center bg-black/50 p-4 text-center text-sm text-warning">
            Media storage reconnecting...
          </div>
        )}
        {enabled && loading && !url && (
          <div className="flex h-full items-center justify-center bg-[#0B0D0F] text-sm text-gray-500">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          </div>
        )}
        {enabled && error && (
          <div className="flex h-full flex-col items-center justify-center bg-[#0B0D0F] p-4 text-center text-sm text-error">
            <p>Failed to load</p>
            <button type="button" onClick={() => void retry()} className="mt-2 underline">Retry</button>
          </div>
        )}
        {enabled && url && (
          <>
            <button 
              type="button" 
              className="group relative block h-full w-full overflow-hidden" 
              onClick={() => dialogRef.current?.showModal()} 
              aria-label={`Enlarge ${displayTitle}`}
            >
              <img 
                src={url} 
                alt={displayTitle} 
                className="contrast-125 h-full w-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.03]" 
                onError={() => void retry()} 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-700 group-hover:bg-black/20 group-hover:opacity-100">
                <div className="rounded-full bg-black/40 p-4 text-white backdrop-blur-sm transition-transform duration-500 scale-90 group-hover:scale-100">
                  <Maximize2 size={24} />
                </div>
              </div>
            </button>
            <dialog ref={dialogRef} className="memorial-lightbox" aria-label={`Enlarged ${displayTitle}`} onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
              <button type="button" className="memorial-lightbox-close" aria-label="Close photograph" onClick={() => dialogRef.current?.close()}><X size={24} /></button>
              <img src={url} alt={displayTitle} className="contrast-125" />
              <div className="mt-4 text-center max-w-2xl mx-auto px-4">
                <p className="text-xl font-serif text-[#F5F1E8]">{displayTitle}</p>
                {(item.dateTaken || item.location) && (
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-400">
                    {item.dateTaken && <span>📅 {item.dateTaken}</span>}
                    {item.location && <span>📍 {item.location}</span>}
                  </div>
                )}
                {item.description && (
                  <p className="mt-3 text-sm text-gray-300 leading-relaxed bg-[#181C20]/50 p-4 rounded-xl border border-[#2A2E33]/50">
                    {item.description}
                  </p>
                )}
              </div>
            </dialog>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "memorial-media space-y-3",
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
            {displayTitle}
          </p>
          <div className="text-xs text-gray-500 mt-0.5 space-y-0.5 flex flex-wrap gap-x-3 gap-y-1">
            <span>{item.kind} · {formatBytes(item.sizeBytes)}</span>
            {item.dateTaken && <span>📅 {item.dateTaken}</span>}
            {item.location && <span>📍 {item.location}</span>}
          </div>
          {item.description && (
            <p className="mt-2 text-sm text-gray-300 leading-relaxed bg-[#181C20]/50 p-2 rounded-lg border border-[#2A2E33]/50">
              {item.description}
            </p>
          )}
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
              <button type="button" className="memorial-photo-open" onClick={() => dialogRef.current?.showModal()} aria-label={`Enlarge ${displayTitle}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={displayTitle} className="contrast-125 memorial-gallery-image" onError={() => void retry()} />
                <span><Maximize2 size={16} /> View photograph</span>
              </button>
              <dialog ref={dialogRef} className="memorial-lightbox" aria-label={`Enlarged ${displayTitle}`} onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
                <button type="button" className="memorial-lightbox-close" aria-label="Close photograph" onClick={() => dialogRef.current?.close()}><X size={24} /></button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={displayTitle} className="contrast-125" />
                <div className="mt-4 text-center max-w-2xl mx-auto px-4">
                  <p className="text-xl font-serif text-[#F5F1E8]">{displayTitle}</p>
                  {(item.dateTaken || item.location) && (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-400">
                      {item.dateTaken && <span>📅 {item.dateTaken}</span>}
                      {item.location && <span>📍 {item.location}</span>}
                    </div>
                  )}
                  {item.description && (
                    <p className="mt-3 text-sm text-gray-300 leading-relaxed bg-[#181C20]/50 p-4 rounded-xl border border-[#2A2E33]/50">
                      {item.description}
                    </p>
                  )}
                </div>
              </dialog>
            </>
          ) : null}
          {item.kind === "VIDEO" && <video key={url} playsInline controls preload="metadata" className="max-h-[32rem] w-full bg-black" aria-label={displayTitle} onError={() => void retry()}><source src={url} type={item.contentType} /></video>}
          {item.kind === "VOICE" && <div className="memorial-audio-player"><p>A familiar voice. A lasting memory.</p><audio key={url} controls preload="metadata" aria-label={displayTitle} onError={() => void retry()}><source src={url} type={item.contentType} /></audio></div>}
        </div>
      ) : null}

      {enabled && !loading && !error && !url && visible ? (
        <p className="text-sm text-gray-500">Waiting for media…</p>
      ) : null}
    </div>
  );
}
