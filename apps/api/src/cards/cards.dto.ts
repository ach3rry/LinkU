import { OnlineMode, ZoneCode } from "@prisma/client";
import { z } from "zod";

export const publicZoneToPrisma: Record<"tutoring" | "buddy" | "premium", ZoneCode> = {
  tutoring: ZoneCode.TUTORING,
  buddy: ZoneCode.BUDDY,
  premium: ZoneCode.PREMIUM
};

export const publicOnlineModeToPrisma: Record<"online" | "offline" | "hybrid", OnlineMode> = {
  online: OnlineMode.ONLINE,
  offline: OnlineMode.OFFLINE,
  hybrid: OnlineMode.HYBRID
};

export const cardCreateSchema = z
  .object({
    zone: z.enum(["tutoring", "buddy", "premium"]),
    type: z.string().trim().min(1).max(60),
    title: z.string().trim().min(1).max(40),
    subtitle: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(500),
    tags: z.array(z.string().trim().min(1).max(24)).max(10).default([]),
    priceMin: z.number().int().nonnegative().optional(),
    priceMax: z.number().int().nonnegative().optional(),
    schedule: z.record(z.unknown()).default({}),
    location: z.string().trim().max(80).optional(),
    onlineMode: z.enum(["online", "offline", "hybrid"]).default("hybrid"),
    aiGenerated: z.boolean().default(false)
  })
  .refine((value) => !value.priceMin || !value.priceMax || value.priceMin <= value.priceMax, {
    message: "最低价格不能高于最高价格",
    path: ["priceMin"]
  });

export type CardCreateInput = z.infer<typeof cardCreateSchema>;

