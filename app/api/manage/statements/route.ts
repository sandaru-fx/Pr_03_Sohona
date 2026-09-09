import { NextResponse } from "next/server";
import {
  authorizeManageSession,
  manageAuthErrorResponse,
} from "@/lib/manage-auth";
import { assertStatementWordLimit } from "@/lib/package-limits";
import { prisma } from "@/lib/prisma";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { manageStatementsSchema } from "@/lib/validators/manage-statements";

export const runtime = "nodejs";

/**
 * PUT /api/manage/statements
 * Replace memorial statements for the unlocked manage session.
 */
export async function PUT(request: Request) {
  const ipLimited = await enforceIpRateLimit(request, "manageIp");
  if (ipLimited) return ipLimited;

  const auth = await authorizeManageSession();
  if (!auth.ok) return manageAuthErrorResponse(auth);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "InvalidJSON", message: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const parsed = manageStatementsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "ValidationError",
        message: "Invalid statements payload.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const wordLimit = assertStatementWordLimit(
    auth.profile.packageTier,
    parsed.data.statements,
  );
  if (!wordLimit.ok) {
    return NextResponse.json(
      { error: wordLimit.error, message: wordLimit.message },
      { status: 400 },
    );
  }

  const rows = parsed.data.statements.map((statement, index) => ({
    profileId: auth.profile.id,
    body: statement.body,
    sortOrder: index,
  }));

  await prisma.$transaction([
    prisma.statement.deleteMany({ where: { profileId: auth.profile.id } }),
    ...(rows.length > 0
      ? [prisma.statement.createMany({ data: rows })]
      : []),
  ]);

  const statements = await prisma.statement.findMany({
    where: { profileId: auth.profile.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true, body: true, sortOrder: true },
  });

  return NextResponse.json(
    { statements },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
