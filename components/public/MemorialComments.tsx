"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Heart, Loader2 } from "lucide-react";
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
  packageId?: string;
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
    month: "long",
    year: "numeric",
  }).format(date);
}

export function MemorialComments({
  qrId,
  packageId,
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
          : getCommentMaxWordsForIndex(nextUsed + 1),
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
    <div>
      {comments.length === 0 && full ? (
        <EmptyState
          className="mt-6"
          title="No messages yet."
          description="This memorial&rsquo;s messages are private."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Message cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {comments.map((item) => (
              <div
                key={item.id}
                className="memorial-glass-card p-6 flex flex-col gap-4"
              >
                {/* Quote mark */}
                <span className="text-3xl font-serif text-gold/30 leading-none select-none">
                  &ldquo;&ldquo;
                </span>

                <p className="whitespace-pre-wrap font-serif text-base sm:text-lg italic leading-relaxed text-[#F2EDE3]/90 flex-1">
                  {item.body}
                </p>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-gold/5">
                  <div>
                    <p className="text-xs font-medium text-[#AAA398] uppercase tracking-wider">
                      — Guest
                    </p>
                    <p className="text-[10px] text-[#746F67] mt-0.5 uppercase tracking-wider">
                      {formatCommentDate(item.createdAt)}
                    </p>
                  </div>
                  <Heart className="h-4 w-4 text-gold/20" />
                </div>
              </div>
            ))}
          </div>

          {/* "Leave a message" form card */}
          {!full && (
            <div className="lg:col-span-4 sticky top-8">
              <div className="bg-[#151512]/60 backdrop-blur-xl border border-gold/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="font-serif text-xl text-[#F2EDE3] mb-2">
                Leave a message
              </h3>
              <p className="text-xs text-[#AAA398] mb-5 leading-relaxed">
                Share a memory, a kind word, or a note of love.
              </p>

              <form
                onSubmit={(event) => void onSubmit(event)}
                className="space-y-4"
              >
                <Textarea
                  id="memorial-comment"
                  value={body}
                  rows={4}
                  disabled={submitting}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Your message..."
                  className="resize-none bg-[#0A0A09]/50 border-gold/10 text-sm focus:border-gold/30 placeholder:text-[#746F67]"
                />

                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      "text-[10px] tabular-nums",
                      overWords ? "font-medium text-error" : "text-[#746F67]",
                    )}
                  >
                    {wordCount}
                    {nextMaxWords !== null ? `/${nextMaxWords}` : ""}
                  </p>

                  <Button
                    type="submit"
                    disabled={submitting || overWords || wordCount < 1}
                    className={cn(
                      "rounded-full px-6 py-2 text-[10px] tracking-[0.15em] uppercase transition-all duration-300",
                      wordCount < 1
                        ? "bg-gold/40 text-[#0B0D0F]/50 border-transparent hover:bg-gold/40"
                        : "bg-gold text-[#0B0D0F] hover:bg-gold-hover"
                    )}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" aria-hidden />
                        Posting…
                      </>
                    ) : (
                      "Post Message"
                    )}
                  </Button>
                </div>
              </form>

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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
