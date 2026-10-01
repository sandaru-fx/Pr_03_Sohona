import { z } from "zod";

export const manageStatementsSchema = z.object({
  statements: z
    .array(
      z.object({
        body: z
          .string()
          .trim()
          .min(1, "Statement cannot be empty")
          .max(5000, "Statement is too long"),
      }),
    )
    .max(30, "You can add at most 30 statements"),
});

export type ManageStatementsInput = z.infer<typeof manageStatementsSchema>;
