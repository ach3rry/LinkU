import { RelationshipBoundary } from "@prisma/client";
import { z } from "zod";

export const relationshipBoundaryMap = {
  study_only: RelationshipBoundary.STUDY_ONLY,
  activity_partner: RelationshipBoundary.ACTIVITY_PARTNER,
  light_social: RelationshipBoundary.LIGHT_SOCIAL,
  open_to_relationship: RelationshipBoundary.OPEN_TO_RELATIONSHIP,
} as const;

export const profileUpsertSchema = z.object({
  school: z.string().trim().min(1).max(60),
  city: z.string().trim().min(1).max(40),
  campus: z.string().trim().max(60).optional(),
  grade: z.string().trim().max(30).optional(),
  major: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(300).optional(),
  gender: z.string().trim().max(20).optional(),
  relationshipBoundary: z
    .enum(["study_only", "activity_partner", "light_social", "open_to_relationship"])
    .default("study_only"),
  safetyPreference: z.record(z.unknown()).default({}),
});

export type ProfileUpsertInput = z.infer<typeof profileUpsertSchema>;
