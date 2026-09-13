import { SearchX } from "lucide-react";
import { ManageDashboard } from "@/components/manage/ManageDashboard";
import { ManagePinForm } from "@/components/manage/ManagePinForm";
import { PublicLockedCard } from "@/components/public/PublicLockedCard";
import type { ManageOwnerContent } from "@/lib/manage-content";
import type { ManageGateResult } from "@/lib/manage-lookup";
import { cn } from "@/lib/utils";

type ManageGateCardProps = {
  result: ManageGateResult;
  manageToken: string;
  hasManageSession?: boolean;
  ownerContent?: ManageOwnerContent | null;
  r2Configured?: boolean;
};

/**
 * Day 9 — manage link gate: invalid / locked / PIN / edit dashboard.
 */
export function ManageGateCard({
  result,
  manageToken,
  hasManageSession = false,
  ownerContent = null,
  r2Configured = false,
}: ManageGateCardProps) {
  if (result.status === "ready" && hasManageSession) {
    const statements = ownerContent?.statements ?? [];
    const media = ownerContent?.media ?? [];
    const comments = ownerContent?.comments ?? [];

    return (
      <ManageDashboard
        displayName={result.profile.displayName}
        qrId={result.profile.qrId}
        isPublicPinRequired={
          ownerContent?.profile.isPublicPinRequired ??
          result.profile.isPublicPinRequired
        }
        packageTier={ownerContent?.profile.packageId ?? "A"}
        r2Configured={r2Configured}
        initialStatements={statements.map((item) => ({
          id: item.id,
          body: item.body,
        }))}
        initialMedia={media.map((item) => ({
          id: item.id,
          kind: item.kind,
          contentType: item.contentType,
          sizeBytes: item.sizeBytes,
          originalName: item.originalName,
          durationSeconds: item.durationSeconds,
        }))}
        initialComments={comments.map((item) => ({
          id: item.id,
          body: item.body,
          wordCount: item.wordCount,
          status: item.status,
          createdAt: item.createdAt,
        }))}
      />
    );
  }

  if (result.status === "ready" && result.pinLock) {
    return (
      <PublicLockedCard
        displayName={result.profile.displayName}
        lockedUntil={result.pinLock.lockedUntil}
      />
    );
  }

  if (result.status === "ready") {
    return (
      <ManagePinForm
        manageToken={manageToken}
        displayName={result.profile.displayName}
      />
    );
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-10 sm:px-8 sm:py-12 shadow-none">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-foreground-secondary",
        )}
      >
        <SearchX className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-gold">Mathaka QR</p>
      <h1 className="mt-2 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
        Manage link unavailable
      </h1>
      <p className="mt-3 text-base leading-7 text-gray-400">{result.message}</p>
    </div>
  );
}
