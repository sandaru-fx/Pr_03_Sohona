import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { isAdminEmailAllowed } from "@/lib/admin-allowlist";

/**
 * Edge-safe Auth.js config (no Prisma / Node-only imports).
 * Phase 2.3: allow-list gate + ADMIN role on JWT/session.
 */
function googleProvider() {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return [];
  }

  return [
    Google({
      clientId,
      clientSecret,
    }),
  ];
}

function demoProvider() {
  return [
    Credentials({
      name: "Demo Login",
      credentials: {},
      async authorize() {
        // Returns a dummy admin user based on the allowed email. 
        // ID must be a valid 24-hex-char MongoDB ObjectId.
        return {
          id: "650000000000000000000000",
          name: "Demo Admin",
          email: "sandaruchamod62@gmail.com", 
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoAdmin"
        };
      }
    })
  ];
}

export const authConfig = {
  trustHost: true,
  providers: [...googleProvider(), ...demoProvider()],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      // Used by Auth.js route wrappers; /admin requires ADMIN role
      if (request.nextUrl.pathname.startsWith("/admin")) {
        return auth?.user?.role === "ADMIN" && Boolean(auth.user.id);
      }
      return true;
    },
    async signIn({ user }) {
      if (!isAdminEmailAllowed(user.email)) {
        // Non-allowlisted Google accounts cannot become admins
        return "/login?error=AccessDenied";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      const email = user?.email ?? token.email;
      if (email && isAdminEmailAllowed(email)) {
        token.role = "ADMIN";
      } else {
        // Removed from allow-list → drop admin role
        delete token.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }
        if (token.role === "ADMIN") {
          session.user.role = "ADMIN";
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
