"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FileAudio,
  FileImage,
  FileVideo,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  UserCircle2,
  CheckCircle2,
} from "lucide-react";
import { readFileDurationSeconds } from "@/lib/browser-media-duration";
import { getPackageLimits } from "@/lib/packages";
import { cn } from "@/lib/utils";
import { totalStatementWords } from "@/lib/word-count";
import { Modal } from "@/components/ui/Modal";

type StatementDraft = { key: string; body: string };

type MediaItem = {
  id: string;
  kind: "PHOTO" | "VIDEO" | "VOICE";
  originalName: string | null;
  sizeBytes: number;
  contentType: string;
  durationSeconds?: number | null;
  isProfilePhoto?: boolean;
  title?: string | null;
  description?: string | null;
  dateTaken?: string | null;
  location?: string | null;
};

type CommentItem = {
  id: string;
  body: string;
  wordCount: number;
  status: "VISIBLE" | "HIDDEN";
  createdAt: string | Date;
};

function MediaDetailsInput({
  item,
  onSave,
}: {
  item: MediaItem;
  onSave: (updates: { title?: string | null; location?: string | null; dateTaken?: string | null; description?: string | null }) => Promise<void>;
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
        <div className="mt-2 text-sm text-foreground-secondary space-y-1 bg-[#101214] p-3 rounded-lg border border-[#2A2E33] relative group">
          {item.title && <p><strong className="text-foreground">Title:</strong> {item.title}</p>}
          {item.description && <p><strong className="text-foreground">Description:</strong> {item.description}</p>}
          {item.dateTaken && <p><strong className="text-foreground">Date:</strong> {item.dateTaken}</p>}
          {item.location && <p><strong className="text-foreground">Location:</strong> {item.location}</p>}
          {(!item.title && !item.description && !item.dateTaken && !item.location) && (
            <p className="text-foreground-muted italic text-xs">No details added.</p>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="absolute top-2 right-2 text-xs text-gold/80 hover:text-gold transition-colors underline underline-offset-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-[#2A2E33] bg-[#101214] p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Short Description (Title)"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-[#2A2E33] bg-background-secondary/50 px-3 py-2 text-sm text-foreground shadow-none outline-none transition-all focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
            />
            <input
              type="text"
              placeholder="Location (Optional)"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-[#2A2E33] bg-background-secondary/50 px-3 py-2 text-sm text-foreground shadow-none outline-none transition-all focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
            />
            <input
              type="date"
              placeholder="Date Taken (Optional)"
              value={dateTaken}
              onChange={(e) => { setDateTaken(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-[#2A2E33] bg-background-secondary/50 px-3 py-2 text-sm text-foreground shadow-none outline-none transition-all focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
            />
          </div>
          <textarea
            placeholder="More Details (Optional)"
            value={desc}
            onChange={(e) => { setDesc(e.target.value); setSaved(false); }}
            rows={2}
            className="w-full rounded-lg border border-[#2A2E33] bg-background-secondary/50 px-3 py-2 text-sm text-foreground shadow-none outline-none transition-all focus:border-gold/50 focus:ring-1 focus:ring-gold/50 resize-none"
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

type ManageDashboardProps = {
  displayName: string;
  qrId: string;
  isPublicPinRequired: boolean;
  packageId: string;
  r2Configured: boolean;
  initialStatements: Array<{ id: string; body: string }>;
  initialMedia: MediaItem[];
  initialComments: CommentItem[];
};

function newDraft(body = "", existingKey?: string): StatementDraft {
  return {
    key:
      existingKey ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random()}`),
    body,
  };
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Day 9.4 — owner edit dashboard after manage PIN unlock.
 * displayName is read-only; change-PIN skipped for now.
 */
export function ManageDashboard({
  displayName,
  qrId,
  isPublicPinRequired,
  packageId,
  r2Configured,
  initialStatements,
  initialMedia,
  initialComments,
}: ManageDashboardProps) {
  const router = useRouter();
  const publicPath = `/p/${encodeURIComponent(qrId)}`;
  const limits = getPackageLimits();

  const [statements, setStatements] = useState<StatementDraft[]>(
    initialStatements.length > 0
      ? initialStatements.map((item) => newDraft(item.body, item.id))
      : [newDraft("", "empty-init-key")],
  );
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [kind, setKind] = useState<"PHOTO" | "VIDEO" | "VOICE">("PHOTO");
  const [publicPinRequired, setPublicPinRequired] =
    useState(isPublicPinRequired);

  const [savingStatements, setSavingStatements] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );
  const [togglingPin, setTogglingPin] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<
    | { type: "media"; id: string; label: string }
    | { type: "comment"; id: string }
    | null
  >(null);

  const [pendingUploadFiles, setPendingUploadFiles] = useState<{
    files: File[];
    isProfilePhoto: boolean;
  } | null>(null);

  const [metadataInputs, setMetadataInputs] = useState<{
    title: string;
    description: string;
    dateTaken: string;
    location: string;
  }>({ title: "", description: "", dateTaken: "", location: "" });

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

  const busy =
    savingStatements ||
    uploading ||
    Boolean(deletingId) ||
    Boolean(deletingCommentId) ||
    togglingPin ||
    loggingOut;

  async function saveStatements() {
    setError(null);
    setMessage(null);
    setSavingStatements(true);

    try {
      const cleaned = statements
        .map((item) => ({ body: item.body.trim() }))
        .filter((item) => item.body.length > 0);

      const response = await fetch("/api/manage/statements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statements: cleaned }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
        issues?: Array<{ message: string }>;
        statements?: Array<{ id: string; body: string }>;
      };

      if (!response.ok) {
        setError(
          data.issues?.[0]?.message ??
            data.message ??
            data.error ??
            "Could not save statements.",
        );
        return;
      }

      if (data.statements) {
        setStatements(
          data.statements.length > 0
            ? data.statements.map((item) => newDraft(item.body, item.id))
            : [newDraft("", "empty-init-key")],
        );
      }
      setMessage("Statements saved.");
      router.refresh();
    } catch {
      setError("Network error while saving statements.");
    } finally {
      setSavingStatements(false);
    }
  }

  async function processPendingUploads() {
    if (!pendingUploadFiles) return;
    const { files, isProfilePhoto } = pendingUploadFiles;
    
    // Title is mandatory
    if (!metadataInputs.title.trim()) {
      setError("Please provide a title for the upload.");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);
    let currentPhotoCount = photoCount;
    let uploadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (!isProfilePhoto && kind === "PHOTO" && currentPhotoCount >= limits.maxImages) {
          setError(`This package allows at most ${limits.maxImages} images.`);
          break;
        }

        let durationSeconds: number | undefined;
        if (kind === "VIDEO" || kind === "VOICE") {
          const duration = await readFileDurationSeconds(file);
          const rounded = Math.ceil(duration);
          const maxSeconds =
            kind === "VIDEO" ? limits.maxVideoSeconds : limits.maxAudioSeconds;
          if (rounded > maxSeconds) {
            setError(
              kind === "VIDEO"
                ? `Video must be ${limits.maxVideoSeconds}s or less.`
                : `Audio must be ${limits.maxAudioSeconds}s or less.`,
            );
            break;
          }
          durationSeconds = rounded;
        }

        const formData = new FormData();
        formData.append("kind", isProfilePhoto ? "PHOTO" : kind);
        formData.append("file", file);
        if (isProfilePhoto) formData.append("isProfilePhoto", "true");
        if (durationSeconds !== undefined) {
          formData.append("durationSeconds", String(durationSeconds));
        }
        
        formData.append("title", metadataInputs.title);
        formData.append("description", metadataInputs.description);
        formData.append("dateTaken", metadataInputs.dateTaken);
        formData.append("location", metadataInputs.location);

        const response = await fetch("/api/manage/media/upload", {
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

        if (isProfilePhoto) {
          setMedia((current) => [
            result.media as MediaItem,
            ...current.filter((m) => !m.isProfilePhoto),
          ]);
        } else {
          setMedia((current) => [...current, result.media as MediaItem]);
          if (kind === "PHOTO") currentPhotoCount++;
        }
        
        uploadedCount++;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Network error during upload.",
        );
        break;
      }
    }

    if (uploadedCount > 0) {
      setMessage(`Successfully uploaded ${uploadedCount} file(s).`);
      router.refresh();
    }
    
    setUploading(false);
    setPendingUploadFiles(null);
    setMetadataInputs({ title: "", description: "", dateTaken: "", location: "" });
  }

  function triggerUpload(fileList: FileList | null, isProfilePhoto: boolean) {
    if (!fileList || fileList.length === 0) return;
    if (!r2Configured) {
      setError("Media storage is not connected yet.");
      return;
    }
    
    // Auto-fill title with original file name stripped of extension as a suggestion
    const firstFile = fileList[0];
    const defaultTitle = firstFile.name.replace(/\.[^/.]+$/, "");
    
    setMetadataInputs({ title: defaultTitle, description: "", dateTaken: "", location: "" });
    setPendingUploadFiles({ files: Array.from(fileList), isProfilePhoto });
  }

  async function onDeleteMedia(mediaId: string) {
    setError(null);
    setMessage(null);
    setDeletingId(mediaId);

    try {
      const response = await fetch(`/api/manage/media/${mediaId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(data.message ?? data.error ?? "Could not delete media.");
        return;
      }

      setMedia((current) => current.filter((item) => item.id !== mediaId));
      setMessage(data.message ?? "Media removed.");
      router.refresh();
    } catch {
      setError("Network error while deleting media.");
    } finally {
      setDeletingId(null);
    }
  }

  async function onDeleteComment(commentId: string) {
    setError(null);
    setMessage(null);
    setDeletingCommentId(commentId);

    try {
      const response = await fetch(`/api/manage/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(data.message ?? data.error ?? "Could not delete comment.");
        return;
      }

      setComments((current) =>
        current.filter((item) => item.id !== commentId),
      );
      setMessage(data.message ?? "Comment removed.");
      router.refresh();
    } catch {
      setError("Network error while deleting comment.");
    } finally {
      setDeletingCommentId(null);
    }
  }

  async function onTogglePublicPin() {
    setError(null);
    setMessage(null);
    setTogglingPin(true);
    const next = !publicPinRequired;

    try {
      const response = await fetch("/api/manage/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublicPinRequired: next }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(data.message ?? data.error ?? "Could not update settings.");
        return;
      }

      setPublicPinRequired(next);
      setMessage(data.message ?? "Settings updated.");
      router.refresh();
    } catch {
      setError("Network error while updating settings.");
    } finally {
      setTogglingPin(false);
    }
  }

  async function onLogout() {
    setError(null);
    setMessage(null);
    setLoggingOut(true);
    try {
      const response = await fetch("/api/manage/logout", { method: "POST" });
      if (!response.ok) {
        setError("Could not end manage session. Try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 shadow-none sm:px-8 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Mathaka QR</p>
        <h1 className="mt-2 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
          Manage memorial
        </h1>
        <p className="mt-3 text-base leading-7 text-gray-400">
          Private owner access for{" "}
          <span className="font-medium text-foreground">{displayName}</span>.
          Name is set by the temple and stays read-only here.
        </p>

        <dl className="mt-5 space-y-2 text-sm text-foreground-secondary">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt>Memorial name</dt>
            <dd className="font-medium text-foreground">{displayName}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt>Public page</dt>
            <dd>
              <a
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-2 hover:underline"
              >
                Open QR page
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-foreground-muted">
          Session lasts about 4 hours on this device. Limits:{" "}
          {limits.maxImages} photos · video ≤ {limits.maxVideoSeconds}s · audio ≤{" "}
          {limits.maxAudioSeconds}s · statements ≤ {limits.maxStatementWords}{" "}
          words.
        </p>
      </div>

      <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 shadow-none sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">Statements</h2>
          <p
            className={cn(
              "text-xs tabular-nums",
              usedWords > limits.maxStatementWords
                ? "font-medium text-error"
                : "text-foreground-muted",
            )}
          >
            {usedWords} / {limits.maxStatementWords} words
          </p>
        </div>
        <p className="mt-1 text-sm text-foreground-secondary">
          Edit messages for future visitors. Save when you are ready.
        </p>

        <div className="mt-5 space-y-3">
          {statements.map((item, index) => (
            <div key={item.key} className="flex gap-2">
              <label className="sr-only" htmlFor={`manage-statement-idx-${index}`}>
                Statement {index + 1}
              </label>
              <textarea
                id={`manage-statement-idx-${index}`}
                value={item.body}
                rows={3}
                disabled={busy}
                onChange={(event) => {
                  const value = event.target.value;
                  setStatements((current) =>
                    current.map((row) =>
                      row.key === item.key ? { ...row, body: value } : row,
                    ),
                  );
                }}
                placeholder="Write a memory or message..."
                className="min-h-24 w-full rounded-xl border border-[#2A2E33] bg-surface px-3.5 py-3 text-sm text-foreground shadow-none outline-none transition focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C] disabled:bg-background-secondary"
              />
              <button
                type="button"
                aria-label={`Remove statement ${index + 1}`}
                disabled={busy || statements.length === 1}
                onClick={() =>
                  setStatements((current) =>
                    current.length === 1
                      ? current
                      : current.filter((row) => row.key !== item.key),
                  )
                }
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2A2E33] text-foreground-muted transition hover:bg-background-secondary disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStatements((current) => [...current, newDraft()])}
            disabled={busy || statements.length >= 30}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#2A2E33] bg-surface px-4 text-sm font-medium text-foreground transition hover:bg-background-secondary disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add statement
          </button>
          <button
            type="button"
            onClick={() => void saveStatements()}
            disabled={busy}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-background transition",
              busy
                ? "cursor-not-allowed bg-foreground-muted"
                : "bg-gold hover:bg-gold-hover",
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

      {/* PROFILE PHOTO SECTION */}
      <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 shadow-none sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">Profile photo</h2>
          <p className="text-xs text-foreground-muted">Shown as the main hero image</p>
        </div>
        <p className="mt-1 text-sm text-foreground-secondary">
          The main photo that appears at the top of the memorial page.
        </p>

        {!r2Configured ? (
          <div className="mt-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Media storage (Cloudflare R2) is not connected yet.
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#2A2E33] bg-[#0B0D0F] text-foreground-muted overflow-hidden">
              <UserCircle2 className={cn("h-10 w-10", !media.find((m) => m.isProfilePhoto) && "opacity-30")} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-foreground-secondary">
                {media.find((m) => m.isProfilePhoto)
                  ? media.find((m) => m.isProfilePhoto)!.originalName ?? "Profile photo set"
                  : "No profile photo set"}
              </p>
              <div className="flex flex-wrap gap-2">
                <label
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition",
                    busy
                      ? "cursor-not-allowed border-[#2A2E33] text-foreground-muted opacity-40"
                      : media.find((m) => m.isProfilePhoto)
                      ? "cursor-pointer border-gold/30 bg-gold/10 text-gold hover:bg-gold/20"
                      : "cursor-pointer border-gold bg-gold text-background hover:bg-gold-hover",
                  )}
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : media.find((m) => m.isProfilePhoto) ? (
                    <RefreshCw className="h-3.5 w-3.5" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {media.find((m) => m.isProfilePhoto) ? "Change photo" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      triggerUpload(e.target.files, true);
                      e.target.value = "";
                    }}
                  />
                </label>
                {media.find((m) => m.isProfilePhoto) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const p = media.find((m) => m.isProfilePhoto);
                      if (p) setConfirmDelete({ type: "media", id: p.id, label: "Profile photo" });
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#2A2E33] px-3 text-xs font-medium text-foreground-muted transition hover:border-error/40 hover:bg-error/10 hover:text-error disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 shadow-none sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">
            Photos, videos & voice
          </h2>
          <p className="text-xs tabular-nums text-foreground-muted">
            Photos {photoCount} / {limits.maxImages}
          </p>
        </div>
        <p className="mt-1 text-sm text-foreground-secondary">
          Upload new files or remove ones that should no longer appear. Video ≤{" "}
          {limits.maxVideoSeconds}s, audio ≤ {limits.maxAudioSeconds}s.
        </p>


        {!r2Configured ? (
          <div className="mt-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Media storage (Cloudflare R2) is not connected yet. Statements still
            work; uploads need R2.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-3">
              {(
                [
                  ["PHOTO", "Photo", FileImage],
                  ["VIDEO", "Video", FileVideo],
                  ["VOICE", "Voice", FileAudio],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value)}
                  disabled={busy}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
                    kind === value
                      ? "border-gold bg-gold text-background"
                      : "border-[#2A2E33] bg-surface text-foreground hover:bg-background-secondary",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </button>
              ))}
            </div>

            <label
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-medium text-background transition",
                busy
                  ? "cursor-not-allowed bg-foreground-muted"
                  : "cursor-pointer bg-gold hover:bg-gold-hover",
              )}
            >
              <Upload className="h-4 w-4" aria-hidden />
              {uploading ? "Uploading…" : `Upload ${kind.toLowerCase()}`}
              <input
                type="file"
                multiple
                accept={accept}
                className="sr-only"
                disabled={busy}
                onChange={(event) => {
                  triggerUpload(event.target.files, false);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        )}

        <ul className="mt-6 divide-y divide-border rounded-xl border border-[#2A2E33]">
          {media.filter((m) => !m.isProfilePhoto && m.kind === kind).length === 0 ? (
            <li className="px-4 py-6 text-sm text-foreground-muted">
              No {kind.toLowerCase()}s on this memorial yet.
            </li>
          ) : (
            media.filter((m) => !m.isProfilePhoto && m.kind === kind).map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {item.originalName ?? item.kind}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {item.kind} · {formatBytes(item.sizeBytes)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete ${item.originalName ?? item.kind}`}
                    disabled={busy}
                    onClick={() =>
                      setConfirmDelete({
                        type: "media",
                        id: item.id,
                        label: item.originalName ?? item.kind,
                      })
                    }
                    className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-[#2A2E33] text-foreground-muted transition hover:bg-error/10 hover:text-error disabled:opacity-40"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
                <MediaDetailsInput
                  item={item}
                  onSave={async (updates) => {
                    setMedia((curr) =>
                      curr.map((m) =>
                        m.id === item.id ? { ...m, ...updates } : m
                      )
                    );
                    try {
                      await fetch(`/api/manage/media/${item.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updates),
                      });
                    } catch (err) {
                      console.error("Failed to update media details", err);
                    }
                  }}
                />
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 shadow-none sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">QR comments</h2>
          <p className="text-xs tabular-nums text-foreground-muted">
            {comments.length} / {limits.maxComments}
          </p>
        </div>
        <p className="mt-1 text-sm text-foreground-secondary">
          Visitors leave these on the public QR page. Temple admin never sees
          them. You can remove any comment here.
        </p>

        <ul className="mt-5 divide-y divide-border rounded-xl border border-[#2A2E33]">
          {comments.length === 0 ? (
            <li className="px-4 py-6 text-sm text-foreground-muted">
              No comments on this memorial yet.
            </li>
          ) : (
            comments.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="whitespace-pre-wrap text-foreground">{item.body}</p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {item.wordCount} words
                    {item.status === "HIDDEN" ? " · hidden" : null}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Delete comment"
                  disabled={busy}
                  onClick={() =>
                    setConfirmDelete({ type: "comment", id: item.id })
                  }
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-[#2A2E33] text-foreground-muted transition hover:bg-error/10 hover:text-error disabled:opacity-40"
                >
                  {deletingCommentId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 shadow-none sm:px-8 sm:py-10">
        <h2 className="text-sm font-medium text-foreground">Public access</h2>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Require PIN for public QR view
            </p>
            <p className="mt-1 text-sm leading-5 text-foreground-secondary">
              Manage access always needs your PIN. This only affects visitors who
              scan the QR.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={publicPinRequired}
            disabled={busy}
            onClick={() => void onTogglePublicPin()}
            className={cn(
              "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition",
              "focus-visible:outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C]",
              publicPinRequired ? "bg-gold" : "bg-border",
              busy && "opacity-70",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-surface transition",
                publicPinRequired && "translate-x-5",
              )}
            />
          </button>
        </div>
      </section>

      {error ? (
        <p
          className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          {message}
        </p>
      ) : null}

      <section className="rounded-2xl border border-gold/30 bg-gold/5 px-6 py-8 shadow-none sm:px-8 sm:py-10 text-center">
        <h2 className="text-lg font-medium text-foreground">Save your work</h2>
        <p className="mt-2 text-sm text-foreground-secondary mb-6 max-w-md mx-auto">
          Most changes like uploads and comments are saved automatically. Click here to save any pending text changes.
        </p>
        <button
          type="button"
          onClick={() => void saveStatements()}
          disabled={busy}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-8 text-base font-semibold text-background transition sm:w-auto",
            busy
              ? "cursor-not-allowed bg-foreground-muted"
              : "bg-gradient-to-r from-gold/90 to-gold hover:from-gold hover:to-gold/90 hover:scale-105 hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.5)]",
          )}
        >
          {savingStatements ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Save All Changes"
          )}
        </button>
      </section>

      <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 shadow-none sm:px-8 sm:py-10">
        <h2 className="text-sm font-medium text-foreground">Session</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          End the manage session on this device when you are done.
        </p>
        <button
          type="button"
          onClick={() => void onLogout()}
          disabled={loggingOut || busy}
          className={cn(
            "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#2A2E33] bg-surface px-5 text-sm font-medium text-foreground transition sm:w-auto",
            "hover:bg-background-secondary focus-visible:outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C]",
            (loggingOut || busy) && "cursor-not-allowed opacity-70",
          )}
        >
          {loggingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Ending session…
            </>
          ) : (
            "End manage session"
          )}
        </button>
      </section>

      <Modal
        open={Boolean(confirmDelete)}
        title={
          confirmDelete?.type === "media"
            ? "Remove this media?"
            : "Remove this comment?"
        }
        description={
          confirmDelete?.type === "media"
            ? `“${confirmDelete.label}” will be permanently removed from this memorial.`
            : "This visitor comment will be permanently removed from the public page."
        }
        confirmLabel="Remove"
        confirmVariant="danger"
        busy={Boolean(deletingId) || Boolean(deletingCommentId)}
        onClose={() => {
          if (!deletingId && !deletingCommentId) setConfirmDelete(null);
        }}
        onConfirm={() => {
          if (!confirmDelete) return;
          const pending = confirmDelete;
          setConfirmDelete(null);
          if (pending.type === "media") {
            void onDeleteMedia(pending.id);
          } else {
            void onDeleteComment(pending.id);
          }
        }}
      />

      <Modal
        open={pendingUploadFiles !== null}
        onClose={() => setPendingUploadFiles(null)}
        title="Media Details"
        description="Please provide details for the new media."
        confirmLabel="Upload"
        busy={uploading}
        disableConfirm={!metadataInputs.title.trim()}
        onConfirm={() => void processPendingUploads()}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={metadataInputs.title}
              onChange={(e) => setMetadataInputs(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. At the beach 2018"
              className="w-full rounded-xl border border-[#2A2E33] bg-[#0B0D0F] px-4 py-2.5 text-sm text-foreground placeholder-foreground-muted transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Description (Optional)
            </label>
            <textarea
              value={metadataInputs.description}
              onChange={(e) => setMetadataInputs(prev => ({ ...prev, description: e.target.value }))}
              placeholder="A short story or context..."
              className="w-full min-h-[80px] rounded-xl border border-[#2A2E33] bg-[#0B0D0F] px-4 py-2.5 text-sm text-foreground placeholder-foreground-muted transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Date (Optional)
              </label>
              <input
                type="text"
                value={metadataInputs.dateTaken}
                onChange={(e) => setMetadataInputs(prev => ({ ...prev, dateTaken: e.target.value }))}
                placeholder="e.g. Dec 2018"
                className="w-full rounded-xl border border-[#2A2E33] bg-[#0B0D0F] px-4 py-2.5 text-sm text-foreground placeholder-foreground-muted transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Location (Optional)
              </label>
              <input
                type="text"
                value={metadataInputs.location}
                onChange={(e) => setMetadataInputs(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Galle, Sri Lanka"
                className="w-full rounded-xl border border-[#2A2E33] bg-[#0B0D0F] px-4 py-2.5 text-sm text-foreground placeholder-foreground-muted transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
