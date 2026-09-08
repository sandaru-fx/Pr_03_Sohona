import {
  getAdminProfileById,
  getPublicProfileUrl,
} from "@/lib/admin-profiles";
import { adminJson, requireAdminApi } from "@/lib/require-admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/profiles/[id]
 * Admin-safe profile detail (no private content / token hashes).
 */
export async function GET(request: Request, context: RouteContext) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  const { id } = await context.params;
  const profile = await getAdminProfileById(id);

  if (!profile) {
    return adminJson(
      { error: "NotFound", message: "Profile not found." },
      { status: 404 },
    );
  }

  return adminJson({
    profile,
    publicUrl: getPublicProfileUrl(profile.qrId),
  });
}
