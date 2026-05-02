import { z } from "zod";

export const parsedDemandOutputSchema = z.object({
  zone: z.enum(["tutoring", "buddy", "premium"]),
  intent: z.string().min(1),
  subject: z.string().optional(),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  scheduleText: z.string().optional(),
  location: z.string().optional(),
  onlineMode: z.enum(["online", "offline", "hybrid"]).default("hybrid"),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  relationshipBoundary: z
    .enum(["study_only", "activity_partner", "light_social", "open_to_relationship"])
    .default("study_only"),
  safetyRisk: z.enum(["low", "medium", "high"]).default("low"),
});

export type ParsedDemandOutput = z.infer<typeof parsedDemandOutputSchema>;

export const cardDraftOutputSchema = z.object({
  title: z.string().min(1).max(40),
  subtitle: z.string().min(1).max(80),
  tags: z.array(z.string()).max(10),
  description: z.string().min(1).max(500),
  highlight: z.string().min(1).max(120),
});

export type CardDraftOutput = z.infer<typeof cardDraftOutputSchema>;

export const matchReasonOutputSchema = z.object({
  reason: z.string().min(1).max(180),
  matchedFactors: z.array(z.string()).default([]),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export type MatchReasonOutput = z.infer<typeof matchReasonOutputSchema>;

export const icebreakerOutputSchema = z.object({
  icebreakers: z.array(z.string().min(1).max(140)).min(1).max(3),
});

export type IcebreakerOutput = z.infer<typeof icebreakerOutputSchema>;

export const moderationOutputSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  categories: z.array(z.string()).default([]),
  actionSuggestion: z.enum(["allow", "review", "block"]),
  reason: z.string().min(1).max(240),
});

export type ModerationOutput = z.infer<typeof moderationOutputSchema>;

export const parseDemandInputSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  profile: z.record(z.unknown()).optional(),
});

export type ParseDemandInput = z.infer<typeof parseDemandInputSchema>;

export const generateCardInputSchema = z.object({
  demand: parsedDemandOutputSchema,
  profile: z.record(z.unknown()).optional(),
});

export type GenerateCardInput = z.infer<typeof generateCardInputSchema>;

export const matchReasonInputSchema = z.object({
  score: z.number().int().min(0).max(100),
  matchedFactors: z.array(z.string()).default([]),
  cardTitle: z.string().trim().max(80).optional(),
  cardTags: z.array(z.string()).default([]),
  userNeed: z.string().trim().max(300).optional(),
});

export type MatchReasonInput = z.infer<typeof matchReasonInputSchema>;

export const icebreakerInputSchema = z.object({
  matchSummary: z.string().trim().max(500).optional(),
  myCardTitle: z.string().trim().max(80).optional(),
  targetCardTitle: z.string().trim().max(80).optional(),
});

export type IcebreakerInput = z.infer<typeof icebreakerInputSchema>;

export const moderationInputSchema = z.object({
  targetType: z.enum(["profile", "card", "message", "contact_request", "demand"]),
  content: z.string().trim().min(1).max(2000),
});

export type ModerationInput = z.infer<typeof moderationInputSchema>;
