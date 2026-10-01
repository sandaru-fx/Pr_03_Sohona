import { z } from "zod";

export const manageMediaPresignSchema = z.object({
  kind: z.enum(["PHOTO", "VIDEO", "VOICE"]),
  contentType: z.string().trim().min(1, "contentType is required"),
  sizeBytes: z.number().int().positive("sizeBytes must be a positive integer"),
  fileName: z.string().trim().min(1, "fileName is required").max(180),
});

export type ManageMediaPresignInput = z.infer<typeof manageMediaPresignSchema>;
