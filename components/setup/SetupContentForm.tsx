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
} from "lucide-react";
import { readFileDurationSeconds } from "@/lib/browser-media-duration";
import { getPackageLimits } from "@/lib/packages";
import { cn } from "@/lib/utils";
import { totalStatementWords } from "@/lib/word-count";

type StatementDraft = { key: string; body: string };

type MediaItem = {
  id: string;
  kind: "PHOTO" | "VIDEO" | "VOICE";
  originalName: string | null;
  sizeBytes: number;
  contentType: string;
  durationSeconds?: number | null;
};

type SetupCompleteResult = {
  manageUrl: string;
  publicUrl: string;
  displayName: string;
};

type SetupContentFormProps = {
  profileId: string;
  displayName: string;
  setupToken: string;
  r2Configured: boolean;
  packageTier: "A" | "B" | "C";
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
  packageTier,
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
      setMessage("Statements saved.");
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
        setError(
          data.message ?? data.error ?? "Could not finish setup. Please try again.",
        );
        return;
      }

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
      setFinishing(false);
    }
  }

  async function onUpload(fileList: FileList | null) {
    if (!fileList?.[0]) return;
    if (!r2Configured) {
      setError("Media storage is not connected yet. You can still save statements.");
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

      const presignResponse = await fetch("/api/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          setupToken,
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

      const confirmResponse = await fetch("/api/media/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          setupToken,
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
        setError(confirm.message ?? confirm.error ?? "Could not confirm upload.");
        return;
      }

      setMedia((current) => [...current, confirm.media as MediaItem]);
      setMessage(`Uploaded ${file.name}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error during upload.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 shadow-none sm:px-8 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Mathaka QR</p>
        <h1 className="mt-2 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
          Add memories
        </h1>
        <p className="mt-3 text-base leading-7 text-gray-400">
          Add statements and media for{" "}
          <span className="font-medium text-foreground">{displayName}</span>.
          You can save now and finish setup in the next step.
        </p>
        <p className="mt-3 text-xs leading-5 text-foreground-muted">
          Package limits: {limits.maxImages} photos · video ≤{" "}
          {limits.maxVideoSeconds}s · audio ≤ {limits.maxAudioSeconds}s ·
          statements ≤ {limits.maxStatementWords} words total.
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
          Sinhala or English. Word count is across all statements combined.
        </p>

        <div className="mt-5 space-y-3">
          {statements.map((item, index) => (
            <div key={item.key} className="flex gap-2">
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
                className="min-h-24 w-full rounded-xl border border-[#2A2E33] bg-surface px-3.5 py-3 text-sm text-foreground shadow-none outline-none transition focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C] disabled:bg-background-secondary"
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
            disabled={
              savingStatements || finishing || statements.length >= 30
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#2A2E33] bg-surface px-4 text-sm font-medium text-foreground transition hover:bg-background-secondary"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add statement
          </button>
          <button
            type="button"
            onClick={() => void saveStatements()}
            disabled={savingStatements || finishing}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-background transition",
              savingStatements || finishing
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
          Files go to private storage. Video ≤ {limits.maxVideoSeconds}s, audio ≤{" "}
          {limits.maxAudioSeconds}s.
        </p>

        {!r2Configured ? (
          <div className="mt-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Media storage (Cloudflare R2) is not connected yet. You can continue
            with statements now and upload media after R2 is configured.
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

            <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-gold px-5 text-sm font-medium text-background transition hover:bg-gold-hover">
              <Upload className="h-4 w-4" aria-hidden />
              {uploading ? "Uploading…" : `Upload ${kind.toLowerCase()}`}
              <input
                type="file"
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

        <ul className="mt-6 divide-y divide-border rounded-xl border border-[#2A2E33]">
          {media.length === 0 ? (
            <li className="px-4 py-6 text-sm text-foreground-muted">No media uploaded yet.</li>
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
              </li>
            ))
          )}
        </ul>
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

      <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 shadow-none sm:px-8 sm:py-10">
        <h2 className="text-sm font-medium text-foreground">Finish setup</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          This locks the setup link forever and shows your private manage link
          once. You can finish with statements only — media can wait until
          storage is connected.
        </p>
        <button
          type="button"
          onClick={() => void finishSetup()}
          disabled={finishing || savingStatements || uploading}
          className={cn(
            "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-background transition sm:w-auto",
            finishing || savingStatements || uploading
              ? "cursor-not-allowed bg-foreground-muted"
              : "bg-gold hover:bg-gold-hover",
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
