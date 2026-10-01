import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, adminJson } from "@/lib/require-admin";
import { z } from "zod";
import { isMongoObjectId } from "@/lib/object-id";

export const runtime = "nodejs";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  retentionYears: z.number().int().min(1).max(1000).optional(),
  priceAmount: z.number().min(0).nullable().optional(),
  priceCurrency: z.string().optional(),
  features: z.array(z.string().trim().min(1)).optional(),
  isActive: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/admin/packages/[id] — update a package */
export async function PATCH(request: Request, ctx: RouteContext) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  const { id } = await ctx.params;
  if (!isMongoObjectId(id)) {
    return adminJson({ error: "NotFound" }, { status: 404 });
  }

  let json: unknown;
  try { json = await request.json(); }
  catch { return adminJson({ error: "InvalidJSON" }, { status: 400 }); }

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return adminJson({
      error: "ValidationError",
      issues: parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message })),
    }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if ("description" in data && data.description === "") data.description = null;

  try {
    const pkg = await prisma.package.update({ where: { id }, data });
    return adminJson({ package: pkg });
  } catch {
    return adminJson({ error: "NotFound" }, { status: 404 });
  }
}

/** DELETE /api/admin/packages/[id] — delete a package (only if no profiles attached) */
export async function DELETE(request: Request, ctx: RouteContext) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  const { id } = await ctx.params;
  if (!isMongoObjectId(id)) {
    return adminJson({ error: "NotFound" }, { status: 404 });
  }

  // Safety: cannot delete a package still in use
  const count = await prisma.profile.count({ where: { packageId: id } });
  if (count > 0) {
    return adminJson({
      error: "PackageInUse",
      message: `Cannot delete: ${count} memorial(s) are using this package. Deactivate it instead.`,
    }, { status: 409 });
  }

  try {
    await prisma.package.delete({ where: { id } });
    return adminJson({ deleted: true });
  } catch {
    return adminJson({ error: "NotFound" }, { status: 404 });
  }
}
