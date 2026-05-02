import { z } from "zod";

export const createSwipeSchema = z.object({
  targetCardId: z.string().uuid(),
  direction: z.enum(["left", "right"]),
});

export type CreateSwipeInput = z.infer<typeof createSwipeSchema>;
