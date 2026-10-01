import { NextResponse } from "next/server";
import {
  authorizeManageSession,
  manageAuthErrorResponse,
} from "@/lib/manage-auth";
import { isMongoObjectId } from "@/lib/object-id";
import { prisma } from "@/lib/prisma";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * DELETE /api/manage/comments/[id]
 * Family owner can remove a comment from their memorial (admin cannot).
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const ipLimited = await enforceIpRateLimit(_request, "manageIp");
  if (ipLimited) return ipLimited;

  const auth = await authorizeManageSession();
  if (!auth.ok) return manageAuthErrorResponse(auth);

  const { id } = await context.params;
  if (!isMongoObjectId(id)) {
    return NextResponse.json(
      { error: "InvalidCommentId", message: "comment id must be a valid id." },
      { status: 400 },
    );
  }

  const existing = await prisma.comment.findFirst({
    where: { id, profileId: auth.profile.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "NotFound", message: "Comment was not found." },
      { status: 404 },
    );
  }

  await prisma.comment.delete({ where: { id: existing.id } });

  return NextResponse.json(
    { ok: true, message: "Comment removed." },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
