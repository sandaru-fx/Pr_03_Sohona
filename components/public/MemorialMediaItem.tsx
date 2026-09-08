"use client";

import { useEffect, useRef, useState } from "react";
import { FileAudio, FileImage, FileVideo, Loader2 } from "lucide-react";
import type { PublicMediaMetaItem } from "@/lib/public-profile";
import { cn } from "@/lib/utils";

type MemorialMediaItemProps = {
  item: PublicMediaMetaItem;
  enabled: boolean;
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

export function MemorialMediaItem({ item, enabled }: MemorialMediaItemProps) {
  const rootRef = useRef<HTMLLIElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (
        !force &&
        url &&
        expiresAt &&
        expiresAt - Date.now() > 15_000
      ) {
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
                "Could not load this media file.",
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
          setError("Network error while loading media.");
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
    // Intentionally re-run when item becomes visible / enabled.
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
        setError(data.message ?? data.error ?? "Could not load this media file.");
        return;
      }
      setUrl(data.url);
      setExpiresAt(
        Date.now() + Math.max(30, (data.expiresIn ?? 90) - 5) * 1000,
      );
    } catch {
      setError("Network error while loading media.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li
      ref={rootRef}
      className="space-y-3 border-b border-zinc-200 px-4 py-4 last:border-b-0"
    >
      <div className="flex items-center gap-3 text-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
          <MediaIcon kind={item.kind} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-zinc-900">
            {item.originalName ?? item.kind}
          </p>
          <p className="text-xs text-zinc-500">
            {item.kind} · {formatBytes(item.sizeBytes)}
          </p>
        </div>
      </div>

      {!enabled ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Media storage is not connected yet. File metadata is saved; playback
          will work after R2 is configured.
        </p>
      ) : null}

      {enabled && loading && !url ? (
        <div className="flex h-40 items-center justify-center rounded-xl bg-zinc-50 text-sm text-zinc-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Loading secure preview…
        </div>
      ) : null}

      {enabled && error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
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
        <div className="overflow-hidden rounded-xl bg-zinc-50">
          {item.kind === "PHOTO" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={item.originalName ?? "Memorial photo"}
              className="max-h-[28rem] w-full object-contain"
              onError={() => void retry()}
            />
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
            <div className="px-3 py-4">
              <audio
                key={url}
                controls
                preload="metadata"
                className="w-full"
                onError={() => void retry()}
              >
                <source src={url} type={item.contentType} />
              </audio>
            </div>
          ) : null}
        </div>
      ) : null}

      {enabled && !loading && !error && !url && visible ? (
        <p className={cn("text-sm text-zinc-500")}>Waiting for media…</p>
      ) : null}
    </li>
  );
}
