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
  title?: string;
  location?: string;
  dateTaken?: string;
  description?: string;
};

type SetupCompleteResult = {
  manageUrl: string;
  publicUrl: string;
  displayName: string;
};

function MediaDetailsInput({
  item,
  onSave,
}: {
  item: MediaItem;
  onSave: (updates: { title?: string; location?: string; dateTaken?: string; description?: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState(item.title || "");
  const [location, setLocation] = useState(item.location || "");
  const [dateTaken, setDateTaken] = useState(item.dateTaken || "");
  const [desc, setDesc] = useState(item.description || "");
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const hasChanges = title !== (item.title || "") || 
                     location !== (item.location || "") ||
                     dateTaken !== (item.dateTaken || "") ||
                     desc !== (item.description || "");

  async function handleSave() {
    if (!hasChanges) return;
    setSaving(true);
    setSaved(false);
    try {
      await onSave({ title, location, dateTaken, description: desc });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 w-full">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-xs text-gold/80 hover:text-gold transition-colors underline underline-offset-2"
        >
          {item.title || item.location || item.dateTaken || item.description 
            ? "Edit Details" 
            : "Add Details (Optional)"}
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-[#2A2E33] bg-background/30 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Short Description (Title)"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-[#2A2E33] bg-background/50 px-3 py-2 text-sm text-foreground shadow-none outline-none transition-all focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
            />
            <input
              type="text"
              placeholder="Location (Optional)"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-[#2A2E33] bg-background/50 px-3 py-2 text-sm text-foreground shadow-none outline-none transition-all focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
            />
            <input
              type="date"
              placeholder="Date Taken (Optional)"
              value={dateTaken}
              onChange={(e) => { setDateTaken(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-[#2A2E33] bg-background/50 px-3 py-2 text-sm text-foreground shadow-none outline-none transition-all focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
            />
          </div>
          <textarea
            placeholder="More Details (Optional)"
            value={desc}
            onChange={(e) => { setDesc(e.target.value); setSaved(false); }}
            rows={2}
            className="w-full rounded-lg border border-[#2A2E33] bg-background/50 px-3 py-2 text-sm text-foreground shadow-none outline-none transition-all focus:border-gold/50 focus:ring-1 focus:ring-gold/50 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !hasChanges}
              className={cn(
                "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-4 text-xs font-medium transition-all",
                saved
                  ? "border-success/30 bg-success/10 text-success"
                  : hasChanges
                    ? "border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold/50"
                    : "border-[#2A2E33] bg-background text-foreground-muted opacity-50 cursor-not-allowed"
              )}
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? "Saved" : "Save Details"}
            </button>
          </div>
        </div>
      )}
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
      ? initialStatements.map((item) => ({ key: item.id, body: item.body }))
      : [{ key: "initial-draft", body: "" }],
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
    return "audio/mpeg,audio/mp4,audio/wav,audio/webm,audio/ogg,.mp3,.m4a,.wav,.ogg,.opus,.aac";
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
          ? data.statements.map((item) => ({ key: item.id, body: item.body }))
          : [{ key: "initial-draft", body: "" }],
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
    <div className="w-full max-w-[900px] space-y-12">
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

      <div className="setup-glass-card relative overflow-hidden rounded-3xl px-8 py-14 sm:px-16 sm:py-16 shadow-[0_0_40px_-10px_rgba(212,175,55,0.05)]">
        {/* Decorative gradient blob */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold/5 blur-[80px] pointer-events-none" />
        
        <p className="relative z-10 text-xs font-medium uppercase tracking-[0.18em] text-gold">Mathaka QR</p>
        <h1 className="relative z-10 mt-2 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
          Add Memories
        </h1>
        <p className="relative z-10 mt-3 text-base leading-7 text-foreground-secondary">
          Add statements and media for{" "}
          <span className="font-medium text-[#F5F1E8]">{displayName}</span>.
          You can save now and finish setup in the next step.
        </p>
        
        <div className="relative z-10 mt-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-gold/30"></div>
            <p className="text-xs font-medium uppercase tracking-wider text-gold/80">Your Plan Limits</p>
            <div className="h-px w-8 bg-gold/30"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#2A2E33] bg-background/50 p-4 text-center transition-colors hover:border-gold/30 hover:bg-gold/5">
              <FileImage className="h-5 w-5 text-gold/80 mb-2" />
              <span className="text-sm font-medium text-[#F5F1E8]">{limits.maxImages}</span>
              <span className="text-xs text-foreground-muted mt-0.5">Photos</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#2A2E33] bg-background/50 p-4 text-center transition-colors hover:border-gold/30 hover:bg-gold/5">
              <FileVideo className="h-5 w-5 text-gold/80 mb-2" />
              <span className="text-sm font-medium text-[#F5F1E8]">{limits.maxVideoSeconds}s</span>
              <span className="text-xs text-foreground-muted mt-0.5">Video</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#2A2E33] bg-background/50 p-4 text-center transition-colors hover:border-gold/30 hover:bg-gold/5">
              <FileAudio className="h-5 w-5 text-gold/80 mb-2" />
              <span className="text-sm font-medium text-[#F5F1E8]">{limits.maxAudioSeconds}s</span>
              <span className="text-xs text-foreground-muted mt-0.5">Audio</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#2A2E33] bg-background/50 p-4 text-center transition-colors hover:border-gold/30 hover:bg-gold/5">
              <span className="font-serif text-lg font-bold text-gold/80 mb-1 leading-none">Aa</span>
              <span className="text-sm font-medium text-[#F5F1E8]">{limits.maxStatementWords}</span>
              <span className="text-xs text-foreground-muted mt-0.5">Words</span>
            </div>
          </div>
        </div>
      </div>

      <section className="setup-glass-card rounded-3xl px-8 py-12 sm:px-16 sm:py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-[#F5F1E8]">Profile Photo</h2>
        </div>
        <p className="mt-1 text-sm text-foreground-secondary mb-6">
          This photo will appear in the main hero archway of the memorial page.
        </p>
        
        {/* Profile Photo Live Preview inside an archway */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="group relative w-[200px] h-[280px] rounded-t-[100px] rounded-b-xl border-2 border-dashed border-gold/30 bg-gold/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner transition-all hover:border-gold/60 hover:bg-gold/10">
            {media.find(m => m.isProfilePhoto) ? (() => {
              const heroPhoto = media.find(m => m.isProfilePhoto)!;
              const previewUrl = heroPhoto.originalName ? localPreviews[heroPhoto.originalName] : null;

              if (previewUrl) {
                return (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={previewUrl} alt="Hero Photo Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                );
              }

              return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/90 text-center p-4">
                   <FileImage className="h-10 w-10 text-gold mb-3 animate-pulse" />
                   <p className="text-sm font-medium text-[#F5F1E8]">Hero Photo Set</p>
                   <p className="text-xs text-foreground-muted mt-1 break-all line-clamp-2">
                     {heroPhoto.originalName || "Photo"}
                   </p>
                   <div className="mt-4 text-[10px] uppercase tracking-wider text-gold/60 border border-gold/20 rounded-full px-3 py-1 bg-gold/5">
                     Preview ready on memorial
                   </div>
                </div>
              );
            })() : (
              <div className="text-center p-4 transition-transform group-hover:-translate-y-1">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background-secondary shadow-sm ring-1 ring-[#2A2E33]">
                  <Upload className="h-6 w-6 text-gold/80" />
                </div>
                <p className="text-sm font-medium text-[#F5F1E8]">Upload Photo</p>
                <p className="text-xs text-foreground-muted mt-1">Drag & drop or click</p>
              </div>
            )}
            
            {/* Overlay link for clicking */}
            <label className="absolute inset-0 cursor-pointer z-10">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploading || finishing || !r2Configured}
                onChange={(event) => {
                  void onUpload(event.target.files, true);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          
          <div className="flex-1 space-y-4 w-full text-center sm:text-left pt-4">
            {!r2Configured ? (
              <div className="inline-flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Media storage is not connected yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
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

      <section className="setup-glass-card rounded-3xl px-8 py-12 sm:px-16 sm:py-14">
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
        {/* Visual word count progress bar */}
        <div className="word-progress-track mt-3">
          <div
            className="word-progress-fill"
            data-over={usedWords > limits.maxStatementWords}
            style={{ width: `${Math.min((usedWords / limits.maxStatementWords) * 100, 100)}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-foreground-secondary">
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
                  className="min-h-32 w-full rounded-2xl border border-[#2A2E33]/60 bg-surface/50 px-5 py-4 text-sm leading-relaxed text-foreground shadow-inner outline-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/20 focus-visible:border-gold/50 focus:bg-gold/5 disabled:opacity-50 resize-none placeholder:text-foreground-muted"
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

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setStatements((current) => [...current, newDraft()])}
            disabled={
              savingStatements || finishing || statements.length >= 30
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#2A2E33] bg-transparent px-6 text-sm font-medium text-foreground-secondary transition-all hover:border-gold/40 hover:text-gold hover:bg-gold/5 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add statement
          </button>
          <button
            type="button"
            onClick={() => void saveStatements()}
            disabled={savingStatements || finishing}
            className={cn(
              "inline-flex h-12 items-center justify-center gap-2 rounded-xl border-0 px-8 text-sm font-semibold text-[#0B0D0F] transition-all",
              savingStatements || finishing
                ? "cursor-not-allowed bg-foreground-muted opacity-50"
                : "bg-gradient-to-r from-gold/90 to-gold hover:from-gold hover:to-gold/90 hover:scale-105 hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.5)] hover:brightness-110",
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

      <section className="setup-glass-card rounded-3xl px-8 py-12 sm:px-16 sm:py-14">
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
            <div className="flex flex-wrap gap-1 p-1.5 bg-[#181C20] border border-[#2A2E33]/50 rounded-2xl w-fit shadow-inner">
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
                      "relative inline-flex h-10 items-center gap-2.5 rounded-xl px-5 text-sm font-medium transition-colors",
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

        <ul className="mt-10 space-y-3">
          <AnimatePresence mode="popLayout">
            {media.filter((m) => !m.isProfilePhoto && m.kind === kind).length === 0 ? (
              <motion.li 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="setup-dropzone-animated group relative flex flex-col items-center justify-center rounded-3xl bg-background-secondary/20 px-6 py-16 text-center transition-all hover:bg-gold/5"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void onUpload(e.dataTransfer.files);
                }}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-sm ring-1 ring-[#2A2E33] transition-transform group-hover:-translate-y-2 group-hover:ring-gold/30">
                  <Upload className="h-7 w-7 text-gold/70" />
                </div>
                <p className="text-base font-medium text-[#F5F1E8]">No {kind.toLowerCase()}s uploaded yet</p>
                <p className="mt-2 text-sm text-foreground-muted max-w-sm">
                  Click the upload button above or drag and drop your {kind.toLowerCase()} files here to add them to the memorial.
                </p>
              </motion.li>
            ) : (
              media.filter((m) => !m.isProfilePhoto && m.kind === kind).map((item) => (
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
                  <MediaDetailsInput
                    item={item as any}
                    onSave={async (updates) => {
                      setMedia((curr) =>
                        curr.map((m) =>
                          m.id === item.id ? ({ ...m, ...updates } as any) : m
                        )
                      );
                      try {
                        await fetch(`/api/media/${item.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            profileId,
                            setupToken,
                            ...updates,
                          }),
                        });
                      } catch (err) {
                        console.error("Failed to save details", err);
                      }
                    }}
                  />
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-surface/90 to-surface px-8 py-14 shadow-[0_0_50px_-15px_rgba(212,175,55,0.15)] sm:px-16 sm:py-20 backdrop-blur-md text-center hidden sm:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
        <h2 className="relative z-10 text-2xl font-semibold tracking-tight text-gold">Finish Setup</h2>
        <p className="relative z-10 mt-3 text-base text-foreground-secondary max-w-lg mx-auto leading-relaxed">
          This locks the setup link forever and shows your private manage link
          once. You can finish with statements only — media can wait until
          storage is connected.
        </p>
        <button
          type="button"
          onClick={() => void finishSetup()}
          disabled={finishing || savingStatements || uploading}
          className={cn(
            "relative z-10 mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl px-10 text-base font-bold text-[#0B0D0F] transition-all sm:w-auto",
            finishing || savingStatements || uploading
              ? "cursor-not-allowed bg-foreground-muted opacity-50"
              : "bg-gradient-to-r from-gold/90 to-gold shadow-[0_0_30px_-5px_rgba(212,175,55,0.6)] hover:shadow-[0_0_40px_-5px_rgba(212,175,55,0.8)] hover:scale-105 active:scale-95 hover:brightness-110",
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

      {/* Mobile sticky finish button */}
      <div className="setup-sticky-finish">
        <button
          type="button"
          onClick={() => void finishSetup()}
          disabled={finishing || savingStatements || uploading}
          className={cn(
            "inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl px-10 text-base font-bold text-[#0B0D0F] transition-all",
            finishing || savingStatements || uploading
              ? "cursor-not-allowed bg-foreground-muted opacity-50"
              : "bg-gradient-to-r from-gold/90 to-gold shadow-[0_0_30px_-5px_rgba(212,175,55,0.6)] active:scale-95",
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
      </div>
    </div>
  );
}
