import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { authorizeSetupToken } from "@/lib/setup-auth";
import { setupStatementsSchema } from "@/lib/validators/setup-statements";

export const runtime = "nodejs";

/**
 * POST /api/setup/statements
 * Replace memorial statements during family setup (setup-token auth).
 */
export async function POST(request: Request) {
  const ipLimited = await enforceIpRateLimit(request, "setupIp");
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

  const parsed = setupStatementsSchema.safeParse(json);
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

  const auth = await authorizeSetupToken({
    profileId: parsed.data.profileId,
    setupToken: parsed.data.setupToken,
    request,
  });

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error, message: auth.message },
      { status: auth.status },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: auth.profile.id },
    select: { hashedPin: true },
  });

  if (!profile?.hashedPin) {
    return NextResponse.json(
      {
        error: "PinRequired",
        message: "Save a PIN before adding statements.",
      },
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
