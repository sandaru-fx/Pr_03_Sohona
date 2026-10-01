"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Heart, Loader2, CheckCircle2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Textarea } from "@/components/ui/Textarea";
import { getCommentMaxWordsForIndex } from "@/lib/packages";
import { cn } from "@/lib/utils";
import { countWords } from "@/lib/word-count";
import { motion, AnimatePresence } from "framer-motion";

export type MemorialCommentItem = {
  id: string;
  body: string;
  wordCount: number;
  authorName: string | null;
  authorRelationship: string | null;
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
  const [authorName, setAuthorName] = useState("");
  const [authorRelationship, setAuthorRelationship] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Use a character limit instead of just words for the UI (max 300)
  const charMax = 300;
  const charCount = body.length;
  const overChars = charCount > charMax;
  
  const wordCount = useMemo(() => countWords(body), [body]);
  const full = used >= max || nextMaxWords === null;
  const overWords =
    nextMaxWords !== null && wordCount > nextMaxWords && wordCount > 0;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (full) {
      setError("This memorial already has the maximum number of comments.");
      return;
    }

    if (charCount < 1) {
      setError("Write a short message before posting.");
      return;
    }

    if (overChars) {
      setError(`This comment can be at most ${charMax} characters.`);
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
        body: JSON.stringify({ 
          qrId, 
          body: body.trim(),
          authorName: authorName.trim() || undefined,
          authorRelationship: authorRelationship.trim() || undefined
        }),
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
      
      // Success state!
      setSuccess(true);
      setBody("");
      setAuthorName("");
      setAuthorRelationship("");
      
      // Hide success message after 4s
      setTimeout(() => {
        setSuccess(false);
      }, 4000);

    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate SVG dash array for progress ring
  const circleRadius = 14;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (Math.min(charCount, charMax) / charMax) * circleCircumference;

  return (
    <div>
      {comments.length === 0 && full ? (
        <EmptyState
          className="mt-6"
          title="No messages yet."
          description="This memorial&rsquo;s messages are private."
        />
      ) : (
        <div className={cn(
          "grid items-start gap-8 lg:gap-12 transition-all duration-700",
          comments.length === 0 ? "grid-cols-1 max-w-2xl mx-auto" : "grid-cols-1 lg:grid-cols-12"
        )}>
          {/* Message cards */}
          {comments.length > 0 && (
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence initial={false}>
                {comments.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="memorial-glass-card p-6 flex flex-col gap-4 relative overflow-hidden group"
                  >
                    {/* Subtle hover effect light */}
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    {/* Quote mark */}
                    <span className="text-3xl font-serif text-gold/20 leading-none select-none">
                      &ldquo;&ldquo;
                    </span>

                    <p className="whitespace-pre-wrap font-serif text-base sm:text-lg italic leading-relaxed text-[#F2EDE3]/90 flex-1 relative z-10">
                      {item.body}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-gold/5 relative z-10">
                      <div>
                        <p className="text-xs font-medium text-[#c69f59] uppercase tracking-wider">
                          — {item.authorName || "Guest"}
                          {item.authorRelationship && <span className="text-[#AAA398] lowercase">, {item.authorRelationship}</span>}
                        </p>
                        <p className="text-[10px] text-[#746F67] mt-1 uppercase tracking-wider">
                          {formatCommentDate(item.createdAt)}
                        </p>
                      </div>
                      <Heart className="h-4 w-4 text-gold/20" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* "Leave a message" form card */}
          {!full && (
            <div className={cn(
              "transition-all duration-700",
              comments.length === 0 ? "col-span-1" : "lg:col-span-4 sticky top-8"
            )}>
              <div className="bg-[#0A0A09]/60 backdrop-blur-2xl border border-gold/20 rounded-2xl p-6 shadow-[0_0_25px_rgba(198,159,89,0.05)] relative overflow-hidden group">
                {/* Glowing edge effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-b from-gold/30 to-transparent opacity-0 group-focus-within:opacity-100 rounded-2xl transition-opacity duration-700 pointer-events-none z-0" />
                
                <div className="relative z-10">
                  <h3 className="font-serif text-2xl text-[#F2EDE3] mb-2">
                    Leave a message
                  </h3>
                  <p className="text-xs text-[#AAA398] mb-6 leading-relaxed">
                    Share a memory, a kind word, or a note of love.
                  </p>

                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                      >
                        <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                          <CheckCircle2 className="h-6 w-6 text-gold" />
                        </div>
                        <p className="font-serif text-lg text-[#F2EDE3]">
                          Thank you for sharing your memory.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={(event) => void onSubmit(event)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="relative group">
                            <input
                              type="text"
                              id="authorName"
                              value={authorName}
                              onChange={(e) => setAuthorName(e.target.value)}
                              placeholder=" "
                              maxLength={100}
                              className="peer w-full bg-[#1A1A18]/50 border border-gold/10 rounded-lg px-4 pt-6 pb-2 text-sm text-[#F2EDE3] focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all"
                            />
                            <label
                              htmlFor="authorName"
                              className="absolute left-4 top-3.5 text-[#746F67] text-sm transition-all duration-300 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-gold/80 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-75 origin-left cursor-text"
                            >
                              Your Name
                            </label>
                          </div>
                          <div className="relative group">
                            <input
                              type="text"
                              id="authorRelationship"
                              value={authorRelationship}
                              onChange={(e) => setAuthorRelationship(e.target.value)}
                              placeholder=" "
                              maxLength={100}
                              className="peer w-full bg-[#1A1A18]/50 border border-gold/10 rounded-lg px-4 pt-6 pb-2 text-sm text-[#F2EDE3] focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all"
                            />
                            <label
                              htmlFor="authorRelationship"
                              className="absolute left-4 top-3.5 text-[#746F67] text-sm transition-all duration-300 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-gold/80 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-75 origin-left cursor-text"
                            >
                              Relationship (e.g. Friend)
                            </label>
                          </div>
                        </div>

                        <div className="relative group mt-4">
                          <Textarea
                            id="memorial-comment"
                            value={body}
                            rows={4}
                            disabled={submitting}
                            onChange={(event) => setBody(event.target.value)}
                            placeholder=" "
                            className="peer resize-none bg-[#1A1A18]/50 border-gold/10 rounded-lg px-4 pt-7 pb-3 text-sm text-[#F2EDE3] focus:border-gold/50 focus:ring-1 focus:ring-gold/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all"
                          />
                          <label
                            htmlFor="memorial-comment"
                            className="absolute left-4 top-3.5 text-[#746F67] text-sm transition-all duration-300 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-gold/80 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-75 origin-left cursor-text"
                          >
                            Your message...
                          </label>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          {/* Circular Progress Ring */}
                          <div className="flex items-center gap-3">
                            <div className="relative h-8 w-8 flex items-center justify-center">
                              <svg className="h-8 w-8 -rotate-90 transform" viewBox="0 0 32 32">
                                {/* Background ring */}
                                <circle
                                  cx="16"
                                  cy="16"
                                  r={circleRadius}
                                  className="fill-none stroke-gold/10"
                                  strokeWidth="2.5"
                                />
                                {/* Progress ring */}
                                <circle
                                  cx="16"
                                  cy="16"
                                  r={circleRadius}
                                  className={cn(
                                    "fill-none transition-all duration-300 ease-out",
                                    overChars ? "stroke-red-500/80" : charCount > charMax * 0.8 ? "stroke-yellow-500/80" : "stroke-gold/80"
                                  )}
                                  strokeWidth="2.5"
                                  strokeDasharray={circleCircumference}
                                  strokeDashoffset={strokeDashoffset}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className={cn(
                                "absolute text-[8px] font-medium tracking-wider",
                                overChars ? "text-red-500" : "text-gold/60"
                              )}>
                                {charMax - charCount}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-[#746F67]">
                              Chars
                            </span>
                          </div>

                          <Button
                            type="submit"
                            disabled={submitting || overChars || overWords || charCount < 1}
                            className={cn(
                              "relative overflow-hidden rounded-full px-7 py-2.5 h-auto text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-500",
                              charCount < 1 || overChars
                                ? "bg-[#1A1A18] text-[#746F67] border border-gold/10 hover:bg-[#1A1A18]"
                                : "bg-gradient-to-r from-[#D4AF37] to-[#e7cd82] text-[#0A0A09] shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-[1.02]"
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

                        {error ? (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                            <Alert tone="error" className="mt-4" role="alert">
                              {error}
                            </Alert>
                          </motion.div>
                        ) : null}
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
