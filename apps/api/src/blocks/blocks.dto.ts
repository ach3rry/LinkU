import { z } from "zod";

export const createBlockSchema = z.object({
  blockedUserId: z.string().uuid(),
  reason: z.string().trim().max(200).optional(),
});

export type CreateBlockInput = z.infer<typeof createBlockSchema>;
