import { AlertTriangle, Clock3, ShieldOff } from "lucide-react";
import { SetupFlow } from "@/components/setup/SetupFlow";
import type { SetupGateResult } from "@/lib/setup-lookup";
import { cn } from "@/lib/utils";

function formatExpiry(value: Date | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

type SetupGateCardProps = {
  result: SetupGateResult;
  setupToken: string;
  r2Configured: boolean;
};

export function SetupGateCard({
  result,
  setupToken,
  r2Configured,
}: SetupGateCardProps) {
  if (result.status === "valid") {
    return (
      <SetupFlow
        profileId={result.profile.id}
        displayName={result.profile.displayName}
        setupToken={setupToken}
        expiresLabel={formatExpiry(result.profile.setupTokenExpiresAt)}
        hasPin={result.profile.hasPin}
        r2Configured={r2Configured}
        packageTier={result.profile.packageTier}
        initialStatements={result.statements}
        initialMedia={result.media.map((item) => ({
          id: item.id,
          kind: item.kind,
          originalName: item.originalName,
          sizeBytes: item.sizeBytes,
          contentType: item.contentType,
          durationSeconds: item.durationSeconds,
        }))}
      />
    );
  }

  const tone =
    result.status === "expired"
      ? "amber"
      : result.status === "used"
        ? "zinc"
        : "red";

  const Icon =
    result.status === "expired"
      ? Clock3
      : result.status === "used"
        ? ShieldOff
        : AlertTriangle;

  const title =
    result.status === "expired"
      ? "Setup link expired"
      : result.status === "used"
        ? "Setup already completed"
        : "Setup link unavailable";

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-10 sm:px-8 sm:py-12">
      <div
        className={cn(
          "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl",
          tone === "amber" && "bg-warning/10 text-warning",
          tone === "zinc" && "bg-[#0B0D0F] text-gray-400",
          tone === "red" && "bg-error/10 text-error",
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
      {result.profile?.displayName ? (
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
