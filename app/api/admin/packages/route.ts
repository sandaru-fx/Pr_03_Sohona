import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, adminJson } from "@/lib/require-admin";
import { z } from "zod";

export const runtime = "nodejs";

const packageSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  retentionYears: z.number().int().min(1).max(1000),
  priceAmount: z.number().min(0).nullable().optional(),
  priceCurrency: z.string().default("LKR"),
  features: z.array(z.string().trim().min(1)).default([]),
  isActive: z.boolean().default(true),
});

/** GET /api/admin/packages — list all packages */
export async function GET(request: Request) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  const packages = await prisma.package.findMany({
    orderBy: { retentionYears: "asc" },
    include: {
      _count: { select: { profiles: true } },
    },
  });

  return adminJson({ packages });
}

/** POST /api/admin/packages — create a new package */
export async function POST(request: Request) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  let json: unknown;
  try { json = await request.json(); }
  catch { return adminJson({ error: "InvalidJSON" }, { status: 400 }); }

  const parsed = packageSchema.safeParse(json);
  if (!parsed.success) {
    return adminJson({
      error: "ValidationError",
      issues: parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message })),
    }, { status: 400 });
  }

  const pkg = await prisma.package.create({
    data: {
      ...parsed.data,
      description: parsed.data.description || null,
      priceAmount: parsed.data.priceAmount ?? null,
    },
  });

  return adminJson({ package: pkg }, { status: 201 });
}
