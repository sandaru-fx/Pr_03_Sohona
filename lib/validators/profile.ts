import { z } from "zod";
import { PACKAGE_TIERS } from "@/lib/packages";

export const createProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(120, "Display name must be at most 120 characters"),
  packageTier: z.enum(PACKAGE_TIERS, {
    message: "Package must be A, B, or C.",
  }),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
