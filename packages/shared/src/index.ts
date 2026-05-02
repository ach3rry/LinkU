import { z } from "zod";

export const zoneCodes = ["tutoring", "buddy", "premium"] as const;

export type ZoneCode = (typeof zoneCodes)[number];

export const ZONES: Array<{
  code: ZoneCode;
  name: string;
  shortName: string;
  description: string;
  promise: string;
}> = [
  {
    code: "tutoring",
    name: "家教专区",
    shortName: "家教",
    description: "找家教、当家教，按科目、价格、时间、学校和认证状态匹配。",
    promise: "把一句学习需求变成高匹配家教卡片。",
  },
  {
    code: "buddy",
    name: "搭子专区",
    shortName: "搭子",
    description: "饭搭子、自习搭子、运动搭子、黑客松队友和英语口语搭子。",
    promise: "找到边界清楚、节奏合拍的校园搭子。",
  },
  {
    code: "premium",
    name: "学长学姐专区",
    shortName: "Premium",
    description: "保研考研经验、简历修改、项目修改、AI coding 陪跑等高价值资源。",
    promise: "用 Premium Match 预留高价值咨询场景。",
  },
];

export const relationshipBoundarySchema = z.enum([
  "study_only",
  "activity_partner",
  "light_social",
  "open_to_relationship",
]);

export const onlineModeSchema = z.enum(["online", "offline", "hybrid"]);

export const parsedDemandSchema = z.object({
  zone: z.enum(zoneCodes),
  intent: z.string().min(1),
  subject: z.string().optional(),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  scheduleText: z.string().optional(),
  location: z.string().optional(),
  onlineMode: onlineModeSchema.default("hybrid"),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  relationshipBoundary: relationshipBoundarySchema.default("study_only"),
  safetyRisk: z.enum(["low", "medium", "high"]).default("low"),
});

export type ParsedDemand = z.infer<typeof parsedDemandSchema>;

export const generatedCardSchema = z.object({
  title: z.string().min(1).max(40),
  subtitle: z.string().min(1).max(80),
  tags: z.array(z.string()).max(10),
  description: z.string().min(1).max(500),
  highlight: z.string().min(1).max(120),
});

export type GeneratedCard = z.infer<typeof generatedCardSchema>;
