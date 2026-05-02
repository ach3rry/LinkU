import { z } from "zod";

export const mockLoginSchema = z.object({
  nickname: z.string().trim().min(1).max(24),
  school: z.string().trim().min(1).max(60),
  city: z.string().trim().min(1).max(40).optional(),
  email: z.string().email().optional(),
  role: z.enum(["user", "admin"]).default("user")
});

export type MockLoginInput = z.infer<typeof mockLoginSchema>;

