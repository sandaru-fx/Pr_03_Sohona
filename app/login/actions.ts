"use server";

import { signIn } from "@/auth";

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", {
    redirectTo: callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/admin",
  });
}

export async function signInWithDemo(callbackUrl?: string) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo login is strictly disabled in production.");
  }
  await signIn("credentials", {
    redirectTo: callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/admin",
  });
}
