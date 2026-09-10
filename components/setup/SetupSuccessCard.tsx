"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
        <CheckCircle2 className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-sm tracking-wide text-foreground-muted">Sohona</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        Setup complete
      </h1>
      <p className="mt-3 text-sm leading-6 text-foreground-secondary">
        The memorial for{" "}
        <span className="font-medium text-foreground">{displayName}</span> is
        ready. The one-time setup link is now locked and cannot be reused.
      </p>

      <ul className="mt-6 space-y-2 rounded-xl border border-border bg-background-secondary px-4 py-3 text-sm text-foreground-secondary">
        <li>PIN is saved (required for future edits)</li>
        <li>Setup link is permanently invalidated</li>
        <li>Temple admin still cannot see private memories</li>
      </ul>

      <div className="mt-8 space-y-3">
        <p className="text-sm font-medium text-foreground">Private manage link</p>
        <p className="text-sm leading-6 text-foreground-secondary">
          Save this link somewhere safe. It is shown only once. Your PIN is still
          required whenever you edit.
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={manageUrl}
            aria-label="Private manage link"
            className="h-11 w-full rounded-xl border border-border bg-background-secondary px-3.5 font-mono text-xs text-foreground"
          />
          <button
            type="button"
            onClick={() => void copyManageUrl()}
            aria-label={copied ? "Copied manage link" : "Copy manage link"}
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-medium text-background transition",
              copied ? "bg-success" : "bg-gold hover:bg-gold-hover",
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
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          If you leave this page without copying, the manage link cannot be shown
          again from here.
        </p>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm font-medium text-foreground">Public QR page</p>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Open public link
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
        <p className="mt-2 break-all font-mono text-xs text-foreground-muted">
          {publicUrl}
        </p>
      </div>
    </div>
  );
}
