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
        packageTier={result.profile.packageTier}
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
    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl",
          tone === "amber" && "bg-amber-50 text-amber-700",
          tone === "zinc" && "bg-zinc-100 text-zinc-600",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-sm tracking-wide text-zinc-500">Sohona</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{result.message}</p>
      {result.status === "not_ready" ? (
        <p className="mt-4 text-sm text-zinc-500">
          Profile:{" "}
          <span className="font-medium text-zinc-800">
            {result.profile.displayName}
          </span>
        </p>
      ) : null}
    </div>
  );
}
