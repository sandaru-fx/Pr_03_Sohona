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
    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-sm tracking-wide text-zinc-500">Sohona</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        Setup complete
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        The memorial for{" "}
        <span className="font-medium text-zinc-900">{displayName}</span> is
        ready. The one-time setup link is now locked and cannot be reused.
      </p>

      <ul className="mt-6 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
        <li>PIN is saved (required for future edits)</li>
        <li>Setup link is permanently invalidated</li>
        <li>Temple admin still cannot see private memories</li>
      </ul>

      <div className="mt-8 space-y-3">
        <p className="text-sm font-medium text-zinc-900">Private manage link</p>
        <p className="text-sm leading-6 text-zinc-600">
          Save this link somewhere safe. It is shown only once. Your PIN is still
          required whenever you edit.
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={manageUrl}
            aria-label="Private manage link"
            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 font-mono text-xs text-zinc-800"
          />
          <button
            type="button"
            onClick={() => void copyManageUrl()}
            aria-label={copied ? "Copied manage link" : "Copy manage link"}
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white transition",
              copied ? "bg-emerald-700" : "bg-zinc-900 hover:bg-zinc-800",
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
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          If you leave this page without copying, the manage link cannot be shown
          again from here.
        </p>
      </div>

      <div className="mt-8 border-t border-zinc-200 pt-6">
        <p className="text-sm font-medium text-zinc-900">Public QR page</p>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
        >
          Open public link
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
        <p className="mt-2 break-all font-mono text-xs text-zinc-500">
          {publicUrl}
        </p>
      </div>
    </div>
  );
}
