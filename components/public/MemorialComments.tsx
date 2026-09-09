"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { getCommentMaxWordsForIndex } from "@/lib/packages";
import { cn } from "@/lib/utils";
import { countWords } from "@/lib/word-count";

export type MemorialCommentItem = {
  id: string;
  body: string;
  wordCount: number;
  createdAt: string | Date;
};

type MemorialCommentsProps = {
  qrId: string;
  packageTier?: "A" | "B" | "C";
  initialComments: MemorialCommentItem[];
  used: number;
  max: number;
  nextMaxWords: number | null;
};

function formatCommentDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * QR memorial comment list + form (public page only).
 */
export function MemorialComments({
  qrId,
  packageTier = "A",
  initialComments,
  used: initialUsed,
  max,
  nextMaxWords: initialNextMaxWords,
}: MemorialCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [used, setUsed] = useState(initialUsed);
  const [nextMaxWords, setNextMaxWords] = useState(initialNextMaxWords);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const wordCount = useMemo(() => countWords(body), [body]);
  const full = used >= max || nextMaxWords === null;
  const overWords =
    nextMaxWords !== null && wordCount > nextMaxWords && wordCount > 0;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (full) {
      setError("This memorial already has the maximum number of comments.");
      return;
    }

    if (wordCount < 1) {
      setError("Write a short message before posting.");
      return;
    }

    if (nextMaxWords !== null && wordCount > nextMaxWords) {
      setError(`This comment can be at most ${nextMaxWords} words.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/public/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrId, body: body.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        comment?: MemorialCommentItem;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.comment) {
        setError(data.message ?? data.error ?? "Could not post comment.");
        return;
      }

      setComments((current) => [...current, data.comment as MemorialCommentItem]);
      const nextUsed = used + 1;
      setUsed(nextUsed);
      setNextMaxWords(
        nextUsed >= max
          ? null
          : getCommentMaxWordsForIndex(packageTier, nextUsed + 1),
      );
      setBody("");
      setMessage("Comment posted.");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
          <MessageCircle className="h-4 w-4" aria-hidden />
          Comments
        </h2>
        <p className="text-xs tabular-nums text-zinc-500">
          {used} / {max}
        </p>
      </div>
      <p className="mt-1 text-sm text-zinc-600">
        Leave a respectful message. First 5 comments: up to 100 words each; next
        5: up to 150 words each.
      </p>

      {comments.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-500">No comments yet.</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {comments.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3"
            >
              <p className="text-sm leading-6 text-zinc-800 whitespace-pre-wrap">
                {item.body}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                {formatCommentDate(item.createdAt)}
                {item.wordCount > 0 ? ` · ${item.wordCount} words` : null}
              </p>
            </li>
          ))}
        </ul>
      )}

      {full ? (
        <p className="mt-5 text-sm text-zinc-500">
          This memorial has reached its comment limit.
        </p>
      ) : (
        <form onSubmit={(event) => void onSubmit(event)} className="mt-5 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label
              htmlFor="memorial-comment"
              className="text-sm font-medium text-zinc-800"
            >
              Your message
            </label>
            <p
              className={cn(
                "text-xs tabular-nums",
                overWords ? "font-medium text-red-600" : "text-zinc-500",
              )}
            >
              {wordCount}
              {nextMaxWords !== null ? ` / ${nextMaxWords}` : ""} words
            </p>
          </div>
          <textarea
            id="memorial-comment"
            value={body}
            rows={4}
            disabled={submitting}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write in Sinhala or English..."
            className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:bg-zinc-50"
          />
          <button
            type="submit"
            disabled={submitting || overWords || wordCount < 1}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-medium text-white transition",
              submitting || overWords || wordCount < 1
                ? "cursor-not-allowed bg-zinc-400"
                : "bg-zinc-900 hover:bg-zinc-800",
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Posting…
              </>
            ) : (
              "Post comment"
            )}
          </button>
        </form>
      )}

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 text-sm text-emerald-700" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
