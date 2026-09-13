import { adminJson, requireAdminApi } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const updateSchema = z.object({
  templeName: z.string().trim().min(1, "Temple name is required").max(100),
  templeAddress: z.string().trim().max(300).optional().or(z.literal("")),
  templePhone: z.string().trim().max(50).optional().or(z.literal("")),
  templeEmail: z.string().trim().email("Invalid email").optional().or(z.literal("")),
});

/** GET /api/admin/temple-settings — get the singleton settings record */
export async function GET(request: Request) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  let settings = await prisma.templeSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.templeSettings.create({
      data: { templeName: "Mathaka QR Temple" }
    });
  }

  return adminJson({ settings });
}

/** PATCH /api/admin/temple-settings — update the singleton settings record */
export async function PATCH(request: Request) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  let json: unknown;
  try { json = await request.json(); }
  catch { return adminJson({ error: "InvalidJSON" }, { status: 400 }); }

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return adminJson({
      error: "ValidationError",
      message: parsed.error.issues[0]?.message ?? "Invalid form data.",
    }, { status: 400 });
  }

  const data = parsed.data;

  // Find the first record
  const existing = await prisma.templeSettings.findFirst();
  let settings;

  if (existing) {
    settings = await prisma.templeSettings.update({
      where: { id: existing.id },
      data: {
        templeName: data.templeName,
        templeAddress: data.templeAddress || null,
        templePhone: data.templePhone || null,
        templeEmail: data.templeEmail || null,
      },
    });
  } else {
    settings = await prisma.templeSettings.create({
      data: {
        templeName: data.templeName,
        templeAddress: data.templeAddress || null,
        templePhone: data.templePhone || null,
        templeEmail: data.templeEmail || null,
      },
    });
  }

  return adminJson({ settings });
}
