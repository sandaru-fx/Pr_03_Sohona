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
    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl",
          tone === "amber" && "bg-amber-50 text-amber-700",
          tone === "zinc" && "bg-zinc-100 text-zinc-600",
          tone === "red" && "bg-red-50 text-red-600",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-sm tracking-wide text-zinc-500">Sohona</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{result.message}</p>
      {result.profile?.displayName ? (
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
