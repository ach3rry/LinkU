import { CardStatus, ReportStatus, UserStatus } from "@prisma/client";
import { z } from "zod";

export const reviewReportSchema = z.object({
  status: z.nativeEnum(ReportStatus),
  note: z.string().trim().max(500).optional(),
});

export type ReviewReportInput = z.infer<typeof reviewReportSchema>;

export const reviewCardSchema = z.object({
  status: z.nativeEnum(CardStatus),
  reason: z.string().trim().max(500).optional(),
});

export type ReviewCardInput = z.infer<typeof reviewCardSchema>;

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
  reason: z.string().trim().max(500).optional(),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
