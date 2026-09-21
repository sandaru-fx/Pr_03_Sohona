import { z } from "zod";

export const publicCommentSchema = z.object({
  qrId: z.string().trim().min(1, "qrId is required").max(128),
  body: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(4000, "Comment is too long"),
  authorName: z.string().trim().max(100, "Name is too long").optional(),
  authorRelationship: z.string().trim().max(100, "Relationship is too long").optional(),
});

export type PublicCommentInput = z.infer<typeof publicCommentSchema>;
