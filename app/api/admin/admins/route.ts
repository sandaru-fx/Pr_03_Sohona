import { adminJson, requireAdminApi } from "@/lib/require-admin";
import { isAdminEmailAllowed, getAdminAllowlist } from "@/lib/admin-allowlist";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

/** GET /api/admin/admins — list all allowed admins (env + DB) */
export async function GET(request: Request) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  const envEmails = getAdminAllowlist();
  const dbInvites = await prisma.adminInvite.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Merge: env admins don't have a DB invite record
  const dbEmails = new Set(dbInvites.map((i) => i.email));
  const envOnly = envEmails
    .filter((e) => !dbEmails.has(e))
    .map((email) => ({
      id: null,
      email,
      addedBy: "Environment variable",
      createdAt: null,
      isEnv: true,
    }));

  // Logged-in User records for emails that have signed in
  const allEmails = [...envEmails, ...dbInvites.map((i) => i.email)];
  const users = await prisma.user.findMany({
    where: { email: { in: allEmails } },
    select: { email: true, name: true, image: true, isDisabled: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.email ?? "", u]));

  const result = [
    ...envOnly,
    ...dbInvites.map((i) => ({
      id: i.id,
      email: i.email,
      addedBy: i.addedBy,
      createdAt: i.createdAt,
      isEnv: false,
    })),
  ].map((entry) => ({
    ...entry,
    user: userMap[entry.email] ?? null,
  }));

  return adminJson({ admins: result, currentEmail: gate.session.user.email });
}

const addSchema = z.object({
  email: z.string().email("Enter a valid Gmail / Google account email.").toLowerCase().trim(),
});

/** POST /api/admin/admins — add a new admin email */
export async function POST(request: Request) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  let json: unknown;
  try { json = await request.json(); }
  catch { return adminJson({ error: "InvalidJSON" }, { status: 400 }); }

  const parsed = addSchema.safeParse(json);
  if (!parsed.success) {
    return adminJson({
      error: "ValidationError",
      message: parsed.error.issues[0]?.message ?? "Invalid email.",
    }, { status: 400 });
  }

  const email = parsed.data.email;

  // Don't add if already in env list
  if (isAdminEmailAllowed(email)) {
    return adminJson({
      error: "AlreadyExists",
      message: "This email is already a super-admin via environment variable.",
    }, { status: 409 });
  }

  try {
    const invite = await prisma.adminInvite.create({
      data: {
        email,
        addedBy: gate.session.user.email ?? undefined,
      },
    });
    return adminJson({ invite }, { status: 201 });
  } catch {
    return adminJson({
      error: "AlreadyExists",
      message: "This email is already in the admin list.",
    }, { status: 409 });
  }
}
