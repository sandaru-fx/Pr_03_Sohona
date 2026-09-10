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
    <div className="w-full max-w-2xl rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-10 sm:px-8 sm:py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
        <CheckCircle2 className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-gold">
        Mathaka QR
      </p>
      <h1 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
        Setup complete
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-gray-400">
        The memorial for{" "}
        <span className="font-medium text-[#F5F1E8]">{displayName}</span> is
        ready. The one-time setup link is now locked and cannot be reused.
      </p>

      <ul className="mt-8 space-y-3 rounded-xl border border-[#2A2E33] bg-[#0B0D0F]/50 px-5 py-4 text-sm leading-7 text-gray-400">
        <li>PIN is saved (required for future edits)</li>
        <li>Setup link is permanently invalidated</li>
        <li>Temple admin still cannot see private memories</li>
      </ul>

      <div className="mt-10 space-y-3">
        <p className="text-sm font-medium text-[#F5F1E8]">Private manage link</p>
        <p className="text-sm leading-7 text-gray-400">
          Save this link somewhere safe. It is shown only once. Your PIN is
          still required whenever you edit.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={manageUrl}
            aria-label="Private manage link"
            className="h-12 w-full rounded-xl border border-[#2A2E33] bg-[#0B0D0F] px-3.5 font-mono text-xs text-[#F5F1E8] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C]"
          />
          <button
            type="button"
            onClick={() => void copyManageUrl()}
            aria-label={copied ? "Copied manage link" : "Copy manage link"}
            className={cn(
              "inline-flex h-12 min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-[#0B0D0F] transition-opacity duration-300",
              copied ? "bg-success" : "bg-gold hover:opacity-90",
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
          If you leave this page without copying, the manage link cannot be
          shown again from here.
        </p>
      </div>

      <div className="mt-10 border-t border-[#2A2E33] pt-8">
        <p className="text-sm font-medium text-[#F5F1E8]">Public QR page</p>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gold transition-opacity duration-300 hover:opacity-80"
        >
          Open public link
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
        <p className="mt-2 break-all font-mono text-xs text-gray-500">
          {publicUrl}
        </p>
      </div>
    </div>
  );
}
