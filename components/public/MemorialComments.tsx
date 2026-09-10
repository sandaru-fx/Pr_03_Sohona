"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Textarea } from "@/components/ui/Textarea";
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

      setComments((current) => [
        ...current,
        data.comment as MemorialCommentItem,
      ]);
      const nextUsed = used + 1;
      setUsed(nextUsed);
      setNextMaxWords(
        nextUsed >= max
          ? null
          : getCommentMaxWordsForIndex(packageTier, nextUsed + 1),
      );
      setBody("");
      setMessage("Thank you. Your message was added.");
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="inline-flex items-center gap-2.5 font-sans text-2xl font-medium tracking-tight text-[#F5F1E8]">
          <MessageCircle className="h-5 w-5 text-gold" aria-hidden />
          Messages of remembrance
        </h2>
        <p className="text-xs tabular-nums text-gray-500">
          {used} / {max}
        </p>
      </div>
      <p className="mt-3 text-sm leading-7 text-gray-400">
        Leave a respectful message. First 5 comments: up to 100 words each; next
        5: up to 150 words each.
      </p>

      {comments.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No messages yet."
          description="Be the first to leave a quiet note of remembrance."
        />
      ) : (
        <ul className="mt-8 space-y-4">
          {comments.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-[#2A2E33] bg-[#0B0D0F]/60 px-4 py-4 sm:px-5"
            >
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#F5F1E8] sm:text-base sm:leading-8">
                {item.body}
              </p>
              <p className="mt-3 text-xs text-gray-500">
                {formatCommentDate(item.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {full ? (
        <p className="mt-6 text-sm text-gray-500">
          This memorial has reached its comment limit.
        </p>
      ) : (
        <form
          onSubmit={(event) => void onSubmit(event)}
          className="mt-8 space-y-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label
              htmlFor="memorial-comment"
              className="text-sm font-medium text-[#F5F1E8]"
            >
              Your message
            </label>
            <p
              className={cn(
                "text-xs tabular-nums",
                overWords ? "font-medium text-error" : "text-gray-500",
              )}
            >
              {wordCount}
              {nextMaxWords !== null ? ` / ${nextMaxWords}` : ""} words
            </p>
          </div>
          <Textarea
            id="memorial-comment"
            value={body}
            rows={4}
            disabled={submitting}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write in Sinhala or English..."
          />
          <Button
            type="submit"
            disabled={submitting || overWords || wordCount < 1}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Posting…
              </>
            ) : (
              "Post message"
            )}
          </Button>
        </form>
      )}

      {error ? (
        <Alert tone="error" className="mt-4" role="alert">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert tone="success" className="mt-4" role="status">
          {message}
        </Alert>
      ) : null}
    </section>
  );
}
