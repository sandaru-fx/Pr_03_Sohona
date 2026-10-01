import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import { isAdminEmailAllowed } from "@/lib/admin-allowlist";
import { prisma } from "@/lib/prisma";
import { requireEnv } from "@/lib/env";

requireEnv("AUTH_SECRET");

/**
 * Full Auth.js setup (Node runtime).
 * Phase 2.3: keep DB User.role in sync for allow-listed admins.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: requireEnv("AUTH_SECRET"),
  events: {
    async signIn({ user }) {
      if (!user.id || !isAdminEmailAllowed(user.email)) return;

      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
    },
  },
});
