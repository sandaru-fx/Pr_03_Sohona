"use client";

import { useState } from "react";
import { Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { regenerateSetupLink } from "@/app/admin/profiles/[id]/actions";
import { cn } from "@/lib/utils";

export function RegenerateSetupLinkButton({ profileId }: { profileId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleRegenerate() {
    if (!confirm("Are you sure you want to regenerate the setup link? This will invalidate any previously generated link for this memorial.")) {
      return;
    }
    setBusy(true);
    setError(null);
    setSetupUrl(null);
    
    try {
      const res = await regenerateSetupLink(profileId);
      if (res.error) {
        setError(res.error);
      } else if (res.setupUrl) {
        setSetupUrl(res.setupUrl);
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setBusy(false);
    }
  }

  async function copySetupUrl() {
    if (!setupUrl) return;
    try {
      await navigator.clipboard.writeText(setupUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-4">
      {setupUrl ? (
        <div className="rounded-xl border border-success/30 bg-success/10 p-4">
          <p className="text-sm font-medium text-success mb-3">
            Setup link regenerated successfully! Copy it now:
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-success/20 bg-background-secondary px-4 py-3">
              <code className="block whitespace-nowrap font-mono text-sm text-foreground">
                {setupUrl}
              </code>
            </div>
            <button
              type="button"
              onClick={() => void copySetupUrl()}
              className={cn(
                "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition",
                copied
                  ? "bg-success text-background"
                  : "bg-gold text-background hover:bg-gold-hover",
              )}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => void handleRegenerate()}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-surface-elevated border border-border px-4 text-sm font-medium text-foreground transition hover:bg-background-secondary disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden />
            )}
            {busy ? "Regenerating..." : "Regenerate Setup Link"}
          </button>
          {error && <span className="text-sm text-error">{error}</span>}
        </div>
      )}
    </div>
  );
}
