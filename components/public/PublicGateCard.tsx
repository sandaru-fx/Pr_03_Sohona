import { Clock3, SearchX } from "lucide-react";
import { MemorialView } from "@/components/public/MemorialView";
import { PublicLockedCard } from "@/components/public/PublicLockedCard";
import { PublicPinForm } from "@/components/public/PublicPinForm";
import type {
  PublicMemorialContent,
  PublicProfileGateResult,
} from "@/lib/public-profile";
import { cn } from "@/lib/utils";

type PublicGateCardProps = {
  result: PublicProfileGateResult;
  content?: PublicMemorialContent | null;
  r2Configured?: boolean;
};

export function PublicGateCard({
  result,
  content = null,
  r2Configured = false,
}: PublicGateCardProps) {
  if (result.status === "ready" && content) {
    return (
      <MemorialView
        displayName={result.profile.displayName}
        qrId={result.profile.qrId}
        packageTier={result.profile.packageId}
        statements={content.statements}
        media={content.media}
        comments={content.comments}
        commentQuota={content.commentQuota}
        pinProtected={result.access === "pin_required"}
        r2Configured={r2Configured}
      />
    );
  }

  if (result.status === "ready" && result.access === "pin_required") {
    if (result.pinLock) {
      return (
        <PublicLockedCard
          displayName={result.profile.displayName}
          lockedUntil={result.pinLock.lockedUntil}
        />
      );
    }

    return (
      <PublicPinForm
        qrId={result.profile.qrId}
        displayName={result.profile.displayName}
      />
    );
  }

  const tone = result.status === "not_ready" ? "amber" : "zinc";
  const Icon = result.status === "not_ready" ? Clock3 : SearchX;
  const title =
    result.status === "not_ready" ? "Memorial not ready" : "Memorial not found";

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-10 sm:px-8 sm:py-12">
      <div
        className={cn(
          "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl",
          tone === "amber" && "bg-warning/10 text-warning",
          tone === "zinc" && "bg-[#0B0D0F] text-gray-400",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-8 text-center text-xs font-medium uppercase tracking-[0.18em] text-gold">
        Mathaka QR
      </p>
      <h1 className="mt-4 text-center font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-center text-base leading-7 text-gray-400">
        {result.message}
      </p>
      {result.status === "not_ready" ? (
        <p className="mt-6 text-center text-sm text-gray-500">
          Profile:{" "}
          <span className="font-medium text-[#F5F1E8]">
            {result.profile.displayName}
          </span>
        </p>
      ) : null}
    </div>
  );
}
