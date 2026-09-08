import { PublicGateCard } from "@/components/public/PublicGateCard";
import {
  canViewPublicContent,
  loadPublicMemorialContent,
  resolvePublicProfileGate,
} from "@/lib/public-profile";
import { hasValidPublicViewSession } from "@/lib/public-view-session";

type PublicProfilePageProps = {
  params: Promise<{ qrId: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { qrId: rawQrId } = await params;
  const result = await resolvePublicProfileGate(decodeURIComponent(rawQrId));

  if (result.status === "ready") {
    return {
      title: `${result.profile.displayName} · Sohona`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: "Memorial · Sohona",
    robots: { index: false, follow: false },
  };
}

/**
 * Day 6 complete — public QR gate, PIN session, view-only memorial, lock foundation.
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

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
      <PublicGateCard result={result} content={content} />
    </main>
  );
}
