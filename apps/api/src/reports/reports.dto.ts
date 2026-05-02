import { z } from "zod";

export const createReportSchema = z
  .object({
    targetUserId: z.string().uuid().optional(),
    targetCardId: z.string().uuid().optional(),
    targetMessageId: z.string().trim().max(100).optional(),
    reason: z.string().trim().min(1).max(80),
    detail: z.string().trim().max(500).optional(),
  })
  .refine((value) => value.targetUserId || value.targetCardId || value.targetMessageId, {
    message: "至少需要一个举报目标",
    path: ["targetUserId"],
  });

export type CreateReportInput = z.infer<typeof createReportSchema>;
