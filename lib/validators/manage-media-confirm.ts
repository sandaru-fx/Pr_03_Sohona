import { z } from "zod";

export const manageMediaConfirmSchema = z.object({
  kind: z.enum(["PHOTO", "VIDEO", "VOICE"]),
  contentType: z.string().trim().min(1, "contentType is required"),
  sizeBytes: z.number().int().positive("sizeBytes must be a positive integer"),
  fileName: z.string().trim().min(1, "fileName is required").max(180),
  r2ObjectKey: z.string().trim().min(1, "r2ObjectKey is required").max(512),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
});

export type ManageMediaConfirmInput = z.infer<typeof manageMediaConfirmSchema>;
