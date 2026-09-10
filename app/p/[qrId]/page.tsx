import { PublicGateCard } from "@/components/public/PublicGateCard";
import {
  canViewPublicContent,
  loadPublicMemorialContent,
  resolvePublicProfileGate,
} from "@/lib/public-profile";
import { hasValidPublicViewSession } from "@/lib/public-view-session";
import { isR2Configured } from "@/lib/r2-config";

type PublicProfilePageProps = {
  params: Promise<{ qrId: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { qrId: rawQrId } = await params;
  const result = await resolvePublicProfileGate(decodeURIComponent(rawQrId));

  if (result.status === "ready") {
    return {
      title: `${result.profile.displayName} · Mathaka QR`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: "Memorial · Mathaka QR",
    robots: { index: false, follow: false },
  };
}

/**
 * Public QR gate, PIN session, view-only memorial + secure media.
 */
export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { qrId: rawQrId } = await params;
  const qrId = decodeURIComponent(rawQrId);
  const result = await resolvePublicProfileGate(qrId);
  const hasViewSession =
    result.status === "ready" && result.access === "pin_required"
      ? await hasValidPublicViewSession(qrId)
      : false;

  const allowed = canViewPublicContent(result, hasViewSession);
  const content =
    allowed && result.status === "ready"
      ? await loadPublicMemorialContent(result.profile.id)
      : null;

  const isMemorial =
    result.status === "ready" && content !== null;

  return (
    <main
      className={
        isMemorial
          ? "flex min-h-full flex-1 flex-col items-center bg-[#0B0D0F] px-5 py-12 text-[#F5F1E8] sm:px-6 sm:py-16"
          : "relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-[#0B0D0F] px-5 py-16 text-[#F5F1E8] sm:px-6"
      }
    >
      {!isMemorial ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(201,164,92,0.08),transparent_55%)]"
        />
      ) : null}
      <div className="relative w-full max-w-2xl">
        <PublicGateCard
          result={result}
          content={content}
          r2Configured={isR2Configured()}
        />
      </div>
    </main>
  );
}
