"use client";

import { useMemo, useState } from "react";
import {
  FileAudio,
  FileImage,
  FileVideo,
  Loader2,
  Plus,
  Trash2,
  Upload,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { readFileDurationSeconds } from "@/lib/browser-media-duration";
import { getPackageLimits } from "@/lib/packages";
import { cn } from "@/lib/utils";
import { totalStatementWords } from "@/lib/word-count";
import { motion, AnimatePresence } from "framer-motion";

type StatementDraft = { key: string; body: string };

type MediaItem = {
  id: string;
  kind: "PHOTO" | "VIDEO" | "VOICE";
  originalName: string | null;
  sizeBytes: number;
  contentType: string;
  durationSeconds?: number | null;
  isProfilePhoto?: boolean;
};

type SetupCompleteResult = {
  manageUrl: string;
  publicUrl: string;
  displayName: string;
};

function MediaDescriptionInput({
  item,
  onSave,
}: {
  item: MediaItem & { description?: string };
  onSave: (newDesc: string) => Promise<void>;
}) {
  const [desc, setDesc] = useState(item.description || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (desc === (item.description || "")) return;
    setSaving(true);
    setSaved(false);
    try {
      await onSave(desc);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-1 flex items-center gap-2 w-full">
      <input
        type="text"
        placeholder="Optional: Add details or a story about this media..."
        value={desc}
        onChange={(e) => {
          setDesc(e.target.value);
          setSaved(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void handleSave();
          }
        }}
        onBlur={() => void handleSave()}
        className="flex-1 rounded-xl border border-[#2A2E33] bg-background/50 px-3 py-2 text-sm text-foreground shadow-none outline-none transition-all focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
      />
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving || desc === (item.description || "")}
        className={cn(
          "inline-flex h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-xl border px-4 text-xs font-medium transition-all",
          saved
            ? "border-success/30 bg-success/10 text-success"
            : desc !== (item.description || "")
              ? "border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold/50"
              : "border-[#2A2E33] bg-background text-foreground-muted opacity-50 cursor-not-allowed"
        )}
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : saved ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saved
          </>
        ) : (
          "Save"
        )}
      </button>
    </div>
  );
}

type SetupContentFormProps = {
  profileId: string;
  displayName: string;
  setupToken: string;
  r2Configured: boolean;
  packageId: string;
  initialStatements: Array<{ id: string; body: string }>;
  initialMedia: MediaItem[];
  onComplete: (result: SetupCompleteResult) => void;
};

function newDraft(body = ""): StatementDraft {
  return {
    key:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random()}`,
    body,
  };
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function SetupContentForm({
  profileId,
  displayName,
  setupToken,
  r2Configured,
  packageId,
  initialStatements,
  initialMedia,
  onComplete,
}: SetupContentFormProps) {
  const limits = getPackageLimits();
  const [statements, setStatements] = useState<StatementDraft[]>(
    initialStatements.length > 0
      ? initialStatements.map((item) => newDraft(item.body))
      : [newDraft()],
  );
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [kind, setKind] = useState<"PHOTO" | "VIDEO" | "VOICE">("PHOTO");
  const [savingStatements, setSavingStatements] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

  const usedWords = useMemo(
    () => totalStatementWords(statements.map((item) => ({ body: item.body }))),
    [statements],
  );
  const photoCount = useMemo(
    () => media.filter((item) => item.kind === "PHOTO" && !item.isProfilePhoto).length,
    [media],
  );

  const accept = useMemo(() => {
    if (kind === "PHOTO") return "image/jpeg,image/png,image/webp";
    if (kind === "VIDEO") return "video/mp4,video/webm";
    return "audio/mpeg,audio/mp4,audio/wav,audio/webm,.mp3,.m4a,.wav";
  }, [kind]);

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }

  async function persistStatements(showSuccessMessage: boolean) {
    const cleaned = statements
      .map((item) => ({ body: item.body.trim() }))
      .filter((item) => item.body.length > 0);

    const response = await fetch("/api/setup/statements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        setupToken,
        statements: cleaned,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
      issues?: Array<{ message: string }>;
      statements?: Array<{ id: string; body: string }>;
    };

    if (!response.ok) {
      throw new Error(
        data.issues?.[0]?.message ??
          data.message ??
          data.error ??
          "Could not save statements.",
      );
    }

    if (data.statements) {
      setStatements(
        data.statements.length > 0
          ? data.statements.map((item) => newDraft(item.body))
          : [newDraft()],
      );
    }
    if (showSuccessMessage) {
      showMessage("Statements saved.");
    }
  }

  async function saveStatements() {
    setError(null);
    setMessage(null);
    setSavingStatements(true);
    try {
      await persistStatements(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save statements.",
      );
    } finally {
      setSavingStatements(false);
    }
  }

  async function finishSetup() {
    setError(null);
    setMessage(null);
    setFinishing(true);
    let success = false;
    try {
      await persistStatements(false);

      const response = await fetch("/api/setup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, setupToken }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
        manage?: { url?: string };
        publicUrl?: string;
        profile?: { displayName?: string };
      };

      if (!response.ok || !data.manage?.url || !data.publicUrl) {
        // If already complete, we should probably just transition?
        // But for now, just show the error.
        setError(
          data.message ?? data.error ?? "Could not finish setup. Please try again.",
        );
        return;
      }

      success = true;
      onComplete({
        manageUrl: data.manage.url,
        publicUrl: data.publicUrl,
        displayName: data.profile?.displayName ?? displayName,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Network error while finishing setup.",
      );
    } finally {
      if (!success) {
        setFinishing(false);
      }
    }
  }

  async function onUpload(fileList: FileList | null, asProfilePhoto = false) {
    if (!fileList || fileList.length === 0) return;
    if (!r2Configured) {
      setError("Media storage is not connected yet. You can still save statements.");
      return;
    }

    setError(null);
    setMessage(null);
    setUploading(true);
    let currentPhotoCount = photoCount;
    let uploadedCount = 0;
    const files = Array.from(fileList);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadKind = asProfilePhoto ? "PHOTO" : kind;

      if (uploadKind === "PHOTO") {
        const objectUrl = URL.createObjectURL(file);
        setLocalPreviews((prev) => ({ ...prev, [file.name]: objectUrl }));
      }

      try {
        if (uploadKind === "PHOTO" && !asProfilePhoto && currentPhotoCount >= limits.maxImages) {
          setError(`This package allows at most ${limits.maxImages} images.`);
          break;
        }

        let durationSeconds: number | undefined;
        if (uploadKind === "VIDEO" || uploadKind === "VOICE") {
          const duration = await readFileDurationSeconds(file);
          const rounded = Math.ceil(duration);
          const maxSeconds =
            uploadKind === "VIDEO" ? limits.maxVideoSeconds : limits.maxAudioSeconds;
          if (rounded > maxSeconds) {
            setError(
              uploadKind === "VIDEO"
                ? `Video must be ${limits.maxVideoSeconds}s or less (about ${rounded}s).`
                : `Audio must be ${limits.maxAudioSeconds}s or less (about ${rounded}s).`,
            );
            break;
          }
          durationSeconds = rounded;
        }

        // Server-proxy upload: file goes Browser → Next.js → R2 (no CORS needed)
        const formData = new FormData();
        formData.append("profileId", profileId);
        formData.append("setupToken", setupToken);
        formData.append("kind", uploadKind);
        formData.append("file", file);
        if (durationSeconds !== undefined) {
          formData.append("durationSeconds", String(durationSeconds));
        }
        if (asProfilePhoto) {
          formData.append("isProfilePhoto", "true");
        }

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        const result = (await response.json().catch(() => ({}))) as {
          media?: MediaItem;
          message?: string;
          error?: string;
        };

        if (!response.ok || !result.media) {
          setError(result.message ?? result.error ?? "Could not upload file.");
          break;
        }

        setMedia((current) => 
          asProfilePhoto ? [result.media as MediaItem, ...current.filter(m => !m.isProfilePhoto)] : [...current, result.media as MediaItem]
        );
        if (uploadKind === "PHOTO" && !asProfilePhoto) currentPhotoCount++;
        uploadedCount++;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Network error during upload.",
        );
        break;
      }
    }

    if (uploadedCount > 0) {
      showMessage(`Successfully uploaded ${uploadedCount} file(s).`);
    }
    setUploading(false);
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Toast Notifications */}
      <AnimatePresence>
        {message && (
          <motion.div 
            key="success-message"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-success/30 bg-surface/90 px-4 py-3 text-sm font-medium text-success shadow-[0_0_30px_-5px_rgba(34,197,94,0.15)] backdrop-blur-md"
          >
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div 
            key="error-message"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-error/30 bg-surface/90 px-4 py-3 text-sm font-medium text-error shadow-[0_0_30px_-5px_rgba(239,68,68,0.15)] backdrop-blur-md"
          >
            <AlertTriangle className="h-4 w-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-3xl border border-[#2A2E33]/60 bg-surface/80 px-6 py-8 shadow-none sm:px-8 sm:py-10 backdrop-blur-md">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Mathaka QR</p>
        <h1 className="mt-2 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
          Add memories
        </h1>
        <p className="mt-3 text-base leading-7 text-foreground-secondary">
          Add statements and media for{" "}
          <span className="font-medium text-[#F5F1E8]">{displayName}</span>.
          You can save now and finish setup in the next step.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs font-medium text-gold">
          {packageId} Tier Package Limits
        </div>
        <p className="mt-3 text-xs leading-5 text-foreground-muted">
          {limits.maxImages} photos · video ≤ {limits.maxVideoSeconds}s · audio ≤ {limits.maxAudioSeconds}s · statements ≤ {limits.maxStatementWords} words total.
        </p>
      </div>

      <section className="rounded-3xl border border-[#2A2E33]/60 bg-surface/80 px-6 py-8 shadow-none sm:px-8 sm:py-10 backdrop-blur-md">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-[#F5F1E8]">Profile Photo</h2>
        </div>
        <p className="mt-1 text-sm text-foreground-secondary mb-6">
          This photo will appear in the main hero archway of the memorial page.
        </p>
        
        {/* Profile Photo Live Preview inside an archway */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="relative w-[200px] h-[280px] rounded-t-[100px] rounded-b-xl border-2 border-dashed border-[#2A2E33] bg-background-secondary/30 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {media.find(m => m.isProfilePhoto) ? (() => {
              const heroPhoto = media.find(m => m.isProfilePhoto)!;
              const previewUrl = heroPhoto.originalName ? localPreviews[heroPhoto.originalName] : null;

              if (previewUrl) {
                return (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={previewUrl} alt="Hero Photo Preview" className="w-full h-full object-cover" />
                  </div>
                );
              }

              return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/90 text-center p-4">
                   <FileImage className="h-10 w-10 text-gold mb-3" />
                   <p className="text-sm font-medium text-[#F5F1E8]">Hero Photo Set</p>
                   <p className="text-xs text-foreground-muted mt-1 break-all line-clamp-2">
                     {heroPhoto.originalName || "Photo"}
                   </p>
                   <div className="mt-4 text-[10px] uppercase tracking-wider text-gold/60 border border-gold/20 rounded-full px-3 py-1">
                     Preview ready on memorial
                   </div>
                </div>
              );
            })() : (
              <div className="text-center p-4">
                <FileImage className="h-8 w-8 text-foreground-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs text-foreground-muted">No photo selected</p>
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4 w-full text-center sm:text-left">
            {!r2Configured ? (
              <div className="inline-flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Media storage is not connected yet.</p>
              </div>
            ) : (
              <div>
                <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-6 text-sm font-medium text-gold transition-all hover:bg-gold/10 hover:border-gold/50 hover:shadow-[0_0_15px_-3px_rgba(212,175,55,0.2)]">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Upload className="h-4 w-4" aria-hidden />
                  )}
                  {uploading ? "Uploading…" : "Upload Profile Photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploading || finishing}
                    onChange={(event) => {
                      void onUpload(event.target.files, true);
                      event.target.value = "";
                    }}
                  />
                </label>
                <p className="mt-3 text-xs text-foreground-muted">
                  Use a clear, high-quality photo. This will be automatically masked into the hero archway shape.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#2A2E33]/60 bg-surface/80 px-6 py-8 shadow-none sm:px-8 sm:py-10 backdrop-blur-md">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-[#F5F1E8]">Statements</h2>
          <p
            className={cn(
              "text-xs tabular-nums transition-colors",
              usedWords > limits.maxStatementWords
                ? "font-medium text-error"
                : "text-foreground-muted",
            )}
          >
            {usedWords} / {limits.maxStatementWords} words
          </p>
        </div>
        <p className="mt-1 text-sm text-foreground-secondary">
          Sinhala or English. Word count is across all statements combined.
        </p>

        <div className="mt-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {statements.map((item, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                key={item.key} 
                className="flex gap-3 relative group"
              >
                <label className="sr-only" htmlFor={`statement-${item.key}`}>
                  Statement {index + 1}
                </label>
                <textarea
                  id={`statement-${item.key}`}
                  value={item.body}
                  rows={3}
                  disabled={savingStatements || finishing}
                  onChange={(event) => {
                    const value = event.target.value;
                    setStatements((current) =>
                      current.map((row) =>
                        row.key === item.key ? { ...row, body: value } : row,
                      ),
                    );
                  }}
                  placeholder="Write a memory or message..."
                  className="min-h-24 w-full rounded-2xl border border-[#2A2E33] bg-background-secondary px-4 py-3.5 text-sm leading-relaxed text-foreground shadow-none outline-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/20 focus-visible:border-gold/50 disabled:opacity-50 resize-none"
                />
                <button
                  type="button"
                  aria-label={`Remove statement ${index + 1}`}
                  disabled={
                    savingStatements || finishing || statements.length === 1
                  }
                  onClick={() =>
                    setStatements((current) =>
                      current.length === 1
                        ? current
                        : current.filter((row) => row.key !== item.key),
                    )
                  }
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-foreground-muted transition-all hover:bg-error/10 hover:text-error hover:border-error/30 disabled:opacity-30 absolute -right-3 -top-3 opacity-0 group-hover:opacity-100 bg-surface shadow-sm"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStatements((current) => [...current, newDraft()])}
            disabled={
              savingStatements || finishing || statements.length >= 30
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background-secondary/50 px-5 text-sm font-medium text-foreground transition-all hover:bg-background-secondary hover:border-gold/30 hover:text-[#F5F1E8]"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add statement
          </button>
          <button
            type="button"
            onClick={() => void saveStatements()}
            disabled={savingStatements || finishing}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-medium text-background transition-all shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)]",
              savingStatements || finishing
                ? "cursor-not-allowed bg-foreground-muted shadow-none"
                : "bg-gold hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.6)]",
            )}
          >
            {savingStatements ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save statements"
            )}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#2A2E33]/60 bg-surface/80 px-6 py-8 shadow-none sm:px-8 sm:py-10 backdrop-blur-md">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-[#F5F1E8]">
            Photos, videos & voice
          </h2>
          <p className="text-xs tabular-nums text-foreground-muted">
            Photos {photoCount} / {limits.maxImages}
          </p>
        </div>
        <p className="mt-1 text-sm text-foreground-secondary">
          Files go to private storage. Video ≤ {limits.maxVideoSeconds}s, audio ≤{" "}
          {limits.maxAudioSeconds}s.
        </p>

        {!r2Configured ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-5 py-4 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Media storage (Cloudflare R2) is not connected yet. You can continue
              with statements now and upload media after R2 is configured.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap gap-2 p-1 bg-background-secondary rounded-xl w-fit">
              {(
                [
                  ["PHOTO", "Photo", FileImage],
                  ["VIDEO", "Video", FileVideo],
                  ["VOICE", "Voice", FileAudio],
                ] as const
              ).map(([value, label, Icon]) => {
                const isActive = kind === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setKind(value)}
                    className={cn(
                      "relative inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
                      isActive
                        ? "text-background"
                        : "text-foreground-secondary hover:text-foreground",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="media-kind-bubble"
                        className="absolute inset-0 bg-gold rounded-lg shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className="h-4 w-4 relative z-10" aria-hidden />
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </div>

            <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-6 text-sm font-medium text-gold transition-all hover:bg-gold/10 hover:border-gold/50 hover:shadow-[0_0_15px_-3px_rgba(212,175,55,0.2)]">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="h-4 w-4" aria-hidden />
              )}
              {uploading ? "Uploading…" : `Upload ${kind.toLowerCase()}`}
              <input
                type="file"
                multiple
                accept={accept}
                className="sr-only"
                disabled={uploading || finishing}
                onChange={(event) => {
                  void onUpload(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        )}

        <ul className="mt-8 space-y-2">
          <AnimatePresence mode="popLayout">
            {media.filter((m) => !m.isProfilePhoto).length === 0 ? (
              <motion.li 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-[#2A2E33] px-4 py-8 text-center text-sm text-foreground-muted"
              >
                No media uploaded yet.
              </motion.li>
            ) : (
              media.filter((m) => !m.isProfilePhoto).map((item) => (
                <motion.li
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#2A2E33] bg-background-secondary/30 px-5 py-4 transition-colors hover:border-gold/20"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border shrink-0">
                      {item.kind === "PHOTO" ? <FileImage className="h-4 w-4 text-foreground-muted" /> : null}
                      {item.kind === "VIDEO" ? <FileVideo className="h-4 w-4 text-foreground-muted" /> : null}
                      {item.kind === "VOICE" ? <FileAudio className="h-4 w-4 text-foreground-muted" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#F5F1E8]">
                        {item.originalName ?? item.kind}
                      </p>
                      <p className="text-xs text-foreground-muted mt-0.5">
                        {item.kind} · {formatBytes(item.sizeBytes)}
                      </p>
                    </div>
                  </div>
                  <MediaDescriptionInput
                    item={item as any}
                    onSave={async (newDesc) => {
                      setMedia((curr) =>
                        curr.map((m) =>
                          m.id === item.id ? ({ ...m, description: newDesc } as any) : m
                        )
                      );
                      try {
                        await fetch(`/api/media/${item.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            profileId,
                            setupToken,
                            description: newDesc,
                          }),
                        });
                      } catch (err) {
                        console.error("Failed to save description", err);
                      }
                    }}
                  />
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>
      </section>

      <section className="rounded-3xl border border-[#2A2E33]/60 bg-surface/80 px-6 py-8 shadow-[0_0_40px_-10px_rgba(212,175,55,0.05)] sm:px-8 sm:py-10 backdrop-blur-md text-center">
        <h2 className="text-lg font-medium text-[#F5F1E8]">Finish setup</h2>
        <p className="mt-2 text-sm text-foreground-secondary max-w-lg mx-auto">
          This locks the setup link forever and shows your private manage link
          once. You can finish with statements only — media can wait until
          storage is connected.
        </p>
        <button
          type="button"
          onClick={() => void finishSetup()}
          disabled={finishing || savingStatements || uploading}
          className={cn(
            "mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-8 text-sm font-medium text-background transition-all sm:w-auto",
            finishing || savingStatements || uploading
              ? "cursor-not-allowed bg-foreground-muted"
              : "bg-gold shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.6)] hover:scale-[1.02] active:scale-[0.98]",
          )}
        >
          {finishing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Finishing…
            </>
          ) : (
            "Finish setup"
          )}
        </button>
      </section>
    </div>
  );
}
