import { NextResponse } from "next/server";
import { assertCanCreateComment } from "@/lib/comment-limits";
import { prisma } from "@/lib/prisma";
import { authorizePublicMemorialByQrId } from "@/lib/public-memorial-access";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { publicCommentSchema } from "@/lib/validators/public-comment";

export const runtime = "nodejs";

/**
 * POST /api/public/comments
 * Leave a comment on the QR memorial page (after public access gate).
 * Admin never uses this path; comments stay off temple admin surfaces.
 */
export async function POST(request: Request) {
  const ipLimited = await enforceIpRateLimit(request, "publicCommentIp");
  if (ipLimited) return ipLimited;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "InvalidJSON", message: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const parsed = publicCommentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "ValidationError",
        message: "Invalid comment payload.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const auth = await authorizePublicMemorialByQrId(parsed.data.qrId);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error, message: auth.message },
      { status: auth.status },
    );
  }

  const limit = await assertCanCreateComment({
    profileId: auth.profile.id,
    tier: auth.profile.packageId,
    body: parsed.data.body,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: limit.error, message: limit.message },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      profileId: auth.profile.id,
      body: parsed.data.body,
      wordCount: limit.wordCount,
      status: "VISIBLE",
    },
    select: {
      id: true,
      body: true,
      wordCount: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    { comment },
    {
      status: 201,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
