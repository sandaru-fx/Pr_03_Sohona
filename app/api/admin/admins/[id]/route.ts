import { adminJson, requireAdminApi } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { isMongoObjectId } from "@/lib/object-id";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/** DELETE /api/admin/admins/[id] — remove an admin invite */
export async function DELETE(request: Request, ctx: RouteContext) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  const { id } = await ctx.params;
  if (!isMongoObjectId(id)) {
    return adminJson({ error: "NotFound" }, { status: 404 });
  }

  // Cannot remove yourself
  const invite = await prisma.adminInvite.findUnique({ where: { id } });
  if (!invite) return adminJson({ error: "NotFound" }, { status: 404 });

  if (invite.email === gate.session.user.email) {
    return adminJson({
      error: "CannotRemoveSelf",
      message: "You cannot remove your own admin access.",
    }, { status: 409 });
  }

  await prisma.adminInvite.delete({ where: { id } });

  // Also disable any existing User record for that email (so active sessions expire)
  await prisma.user.updateMany({
    where: { email: invite.email },
    data: { isDisabled: true },
  });

  return adminJson({ deleted: true });
}
