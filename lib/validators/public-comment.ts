import { z } from "zod";

export const publicCommentSchema = z.object({
  qrId: z.string().trim().min(1, "qrId is required").max(128),
  body: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(4000, "Comment is too long"),
});

export type PublicCommentInput = z.infer<typeof publicCommentSchema>;
