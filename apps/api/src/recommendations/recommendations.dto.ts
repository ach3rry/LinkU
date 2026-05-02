import { z } from "zod";

export const recommendationQuerySchema = z.object({
  zone: z.enum(["tutoring", "buddy", "premium"]).default("tutoring"),
  limit: z.coerce.number().int().min(1).max(30).default(10),
});

export type RecommendationQuery = z.infer<typeof recommendationQuerySchema>;
