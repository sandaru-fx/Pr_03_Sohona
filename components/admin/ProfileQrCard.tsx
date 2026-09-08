"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

type ProfileQrCardProps = {
  publicUrl: string;
  fileName?: string;
};

export function ProfileQrCard({
  publicUrl,
  fileName = "sohona-profile-qr.png",
}: ProfileQrCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function buildQr() {
      try {
        const url = await QRCode.toDataURL(publicUrl, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
          color: {
            dark: "#18181b",
            light: "#ffffff",
          },
        });
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setDataUrl(null);
          setError("Could not generate QR code.");
        }
      }
    }

    void buildQr();
    return () => {
      cancelled = true;
    };
  }, [publicUrl]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-700 shadow-sm">
          <QrCode className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900">Profile QR code</p>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Print this QR for the physical monument. It opens the public memorial
            page (full content view comes later).
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt="QR code linking to the public memorial profile"
              className="h-full w-full"
            />
          ) : error ? (
            <p className="px-3 text-center text-xs text-red-600">{error}</p>
          ) : (
            <Loader2
              className="h-6 w-6 animate-spin text-zinc-400"
              aria-label="Generating QR code"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white px-3 py-2">
            <code className="block whitespace-nowrap font-mono text-xs text-zinc-700">
              {publicUrl}
            </code>
          </div>

          <a
            href={dataUrl ?? undefined}
            download={fileName}
            aria-disabled={!dataUrl}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
              dataUrl
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "pointer-events-none cursor-not-allowed bg-zinc-300 text-zinc-600",
            )}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download QR PNG
          </a>
        </div>
      </div>
    </div>
  );
}
