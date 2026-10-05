"use server";

import { signIn } from "@/auth";

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", {
    redirectTo: callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/admin",
  });
}

export async function signInWithDemo(callbackUrl?: string) {
  await signIn("credentials", {
    redirectTo: callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/admin",
  });
}
