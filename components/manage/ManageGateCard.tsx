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

    return (
      <ManageDashboard
        displayName={result.profile.displayName}
        qrId={result.profile.qrId}
        isPublicPinRequired={
          ownerContent?.profile.isPublicPinRequired ??
          result.profile.isPublicPinRequired
        }
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
    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600",
        )}
      >
        <SearchX className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-sm tracking-wide text-zinc-500">Sohona</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        Manage link unavailable
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{result.message}</p>
    </div>
  );
}
