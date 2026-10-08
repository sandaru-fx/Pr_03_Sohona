import { z } from "zod";

export const createProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(120, "Display name must be at most 120 characters"),
  packageId: z.string().min(1, "Please select a package."),
  memorialType: z.enum(["DECEASED", "LIVING"]).default("DECEASED"),
  dateOfBirth: z.string().optional().nullable(),
  dateOfPassing: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactNumber: z.string().optional().nullable(),
  contactEmail: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
