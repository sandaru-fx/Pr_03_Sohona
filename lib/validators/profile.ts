import { z } from "zod";

export const createProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(120, "Display name must be at most 120 characters"),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
