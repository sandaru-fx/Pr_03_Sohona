"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type SetupSuccessCardProps = {
  displayName: string;
  manageUrl: string;
  publicUrl: string;
};

export function SetupSuccessCard({
  displayName,
  manageUrl,
  publicUrl,
}: SetupSuccessCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyManageUrl() {
    try {
      await navigator.clipboard.writeText(manageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, staggerChildren: 0.1 }}
      className="w-full max-w-2xl rounded-3xl border border-[#2A2E33]/60 bg-surface/80 px-6 py-10 sm:px-8 sm:py-12 shadow-[0_0_40px_-10px_rgba(212,175,55,0.05)] backdrop-blur-md relative overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-success/5 to-transparent pointer-events-none" />

      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)] relative z-10"
      >
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </motion.div>
      <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-gold relative z-10">
        Mathaka QR
      </p>
      <h1 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl relative z-10">
        Setup complete
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-foreground-secondary relative z-10">
        The memorial for{" "}
        <span className="font-medium text-[#F5F1E8]">{displayName}</span> is
        ready. The one-time setup link is now locked and cannot be reused.
      </p>

      <motion.ul 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 space-y-3 rounded-2xl border border-border bg-background-secondary/50 px-6 py-5 text-sm leading-7 text-foreground-secondary relative z-10"
      >
        <li className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-success/70" />
          PIN is saved (required for future edits)
        </li>
        <li className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-success/70" />
          Setup link is permanently invalidated
        </li>
        <li className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-success/70" />
          Temple admin still cannot see private memories
        </li>
      </motion.ul>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10 space-y-4 relative z-10"
      >
        <div>
          <p className="text-sm font-medium text-[#F5F1E8]">Private manage link</p>
          <p className="mt-1 text-sm leading-6 text-foreground-muted">
            Save this link somewhere safe. It is shown only once. Your PIN is
            still required whenever you edit.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            readOnly
            value={manageUrl}
            aria-label="Private manage link"
            className="h-12 w-full rounded-xl border border-[#2A2E33] bg-background-secondary px-4 font-mono text-xs text-[#F5F1E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/20 focus-visible:border-gold/50 transition-all"
          />
          <button
            type="button"
            onClick={() => void copyManageUrl()}
            aria-label={copied ? "Copied manage link" : "Copy manage link"}
            className={cn(
              "inline-flex h-12 min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium text-background transition-all duration-300",
              copied 
                ? "bg-success text-white shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]" 
                : "bg-gold shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.6)] hover:scale-[1.02] active:scale-[0.98]",
            )}
          >
            {copied ? (
              <ShieldCheck className="h-4 w-4" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-5 py-3.5 text-sm text-warning shadow-sm">
          If you leave this page without copying, the manage link cannot be
          shown again from here.
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10 border-t border-[#2A2E33]/60 pt-8 relative z-10"
      >
        <p className="text-sm font-medium text-[#F5F1E8]">Public QR page</p>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gold transition-all duration-300 hover:text-gold-hover hover:gap-3"
        >
          Open public link
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
        <p className="mt-3 break-all font-mono text-xs text-foreground-muted bg-background-secondary/50 rounded-lg p-3 inline-block border border-border">
          {publicUrl}
        </p>
      </motion.div>
    </motion.div>
  );
}
