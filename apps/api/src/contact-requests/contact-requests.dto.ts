import { z } from "zod";

export const createContactRequestSchema = z.object({
  matchId: z.string().uuid(),
  message: z.string().trim().min(1).max(500),
});

export type CreateContactRequestInput = z.infer<typeof createContactRequestSchema>;
