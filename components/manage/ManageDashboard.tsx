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
  Trash2,
  Upload,
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
};

type CommentItem = {
  id: string;
  body: string;
  wordCount: number;
  status: "VISIBLE" | "HIDDEN";
  createdAt: string | Date;
};

type ManageDashboardProps = {
  displayName: string;
  qrId: string;
  isPublicPinRequired: boolean;
  packageTier: "A" | "B" | "C";
  r2Configured: boolean;
  initialStatements: Array<{ id: string; body: string }>;
  initialMedia: MediaItem[];
  initialComments: CommentItem[];
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

/**
 * Day 9.4 — owner edit dashboard after manage PIN unlock.
 * displayName is read-only; change-PIN skipped for now.
 */
export function ManageDashboard({
  displayName,
  qrId,
  isPublicPinRequired,
  packageTier,
  r2Configured,
  initialStatements,
  initialMedia,
  initialComments,
}: ManageDashboardProps) {
  const router = useRouter();
  const publicPath = `/p/${encodeURIComponent(qrId)}`;
  const limits = getPackageLimits(packageTier);

  const [statements, setStatements] = useState<StatementDraft[]>(
    initialStatements.length > 0
      ? initialStatements.map((item) => newDraft(item.body))
      : [newDraft()],
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

  const usedWords = useMemo(
    () => totalStatementWords(statements.map((item) => ({ body: item.body }))),
    [statements],
  );
  const photoCount = useMemo(
    () => media.filter((item) => item.kind === "PHOTO").length,
    [media],
  );

  const accept = useMemo(() => {
    if (kind === "PHOTO") return "image/jpeg,image/png,image/webp";
    if (kind === "VIDEO") return "video/mp4,video/webm";
    return "audio/mpeg,audio/mp4,audio/wav,audio/webm,.mp3,.m4a,.wav";
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
            ? data.statements.map((item) => newDraft(item.body))
            : [newDraft()],
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

  async function onUpload(fileList: FileList | null) {
    if (!fileList?.[0]) return;
    if (!r2Configured) {
      setError(
        "Media storage is not connected yet. You can still edit statements.",
      );
      return;
    }

    const file = fileList[0];
    setError(null);
    setMessage(null);
    setUploading(true);

    try {
      if (kind === "PHOTO" && photoCount >= limits.maxImages) {
        setError(`This package allows at most ${limits.maxImages} images.`);
        return;
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
              ? `Video must be ${limits.maxVideoSeconds}s or less (about ${rounded}s).`
              : `Audio must be ${limits.maxAudioSeconds}s or less (about ${rounded}s).`,
          );
          return;
        }
        durationSeconds = rounded;
      }

      const presignResponse = await fetch("/api/manage/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          fileName: file.name,
        }),
      });

      const presign = (await presignResponse.json().catch(() => ({}))) as {
        uploadUrl?: string;
        r2ObjectKey?: string;
        headers?: { "Content-Type"?: string };
        message?: string;
        error?: string;
      };

      if (!presignResponse.ok || !presign.uploadUrl || !presign.r2ObjectKey) {
        setError(presign.message ?? presign.error ?? "Could not start upload.");
        return;
      }

      const putResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type":
            presign.headers?.["Content-Type"] ||
            file.type ||
            "application/octet-stream",
        },
        body: file,
      });

      if (!putResponse.ok) {
        setError("Upload to storage failed. Please try again.");
        return;
      }

      const confirmResponse = await fetch("/api/manage/media/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          fileName: file.name,
          r2ObjectKey: presign.r2ObjectKey,
          ...(durationSeconds !== undefined ? { durationSeconds } : {}),
        }),
      });

      const confirm = (await confirmResponse.json().catch(() => ({}))) as {
        media?: MediaItem;
        message?: string;
        error?: string;
      };

      if (!confirmResponse.ok || !confirm.media) {
        setError(
          confirm.message ?? confirm.error ?? "Could not confirm upload.",
        );
        return;
      }

      setMedia((current) => [...current, confirm.media as MediaItem]);
      setMessage(`Uploaded ${file.name}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error during upload.",
      );
    } finally {
      setUploading(false);
    }
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
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-sm tracking-wide text-foreground-muted">Sohona</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Manage memorial
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground-secondary">
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

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
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
              <label className="sr-only" htmlFor={`manage-statement-${item.key}`}>
                Statement {index + 1}
              </label>
              <textarea
                id={`manage-statement-${item.key}`}
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
                className="min-h-24 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:bg-background-secondary"
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
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-foreground-muted transition hover:bg-background-secondary disabled:opacity-40"
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
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:bg-background-secondary disabled:opacity-40"
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

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
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
                      : "border-border bg-surface text-foreground hover:bg-background-secondary",
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
                accept={accept}
                className="sr-only"
                disabled={busy}
                onChange={(event) => {
                  void onUpload(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        )}

        <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
          {media.length === 0 ? (
            <li className="px-4 py-6 text-sm text-foreground-muted">
              No media on this memorial yet.
            </li>
          ) : (
            media.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
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
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-border text-foreground-muted transition hover:bg-error/10 hover:text-error disabled:opacity-40"
                >
                  {deletingId === item.id ? (
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

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
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

        <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
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
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-border text-foreground-muted transition hover:bg-error/10 hover:text-error disabled:opacity-40"
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

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
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
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
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

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-medium text-foreground">Session</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          End the manage session on this device when you are done.
        </p>
        <button
          type="button"
          onClick={() => void onLogout()}
          disabled={loggingOut || busy}
          className={cn(
            "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-medium text-foreground transition sm:w-auto",
            "hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
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
    </div>
  );
}
