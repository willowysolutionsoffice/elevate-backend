import { z } from "zod";

export const createBranchSchema = z.object({
  name: z
    .string()
    .min(2, "Branch name too short")
    .max(100, "Branch name too long"),
  code: z
    .string()
    .min(2, "Branch code too short")
    .max(20, "Branch code too long"),
  address: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateBranchSchema = z.object({
  name: z
    .string()
    .min(2, "Branch name too short")
    .max(100, "Branch name too long")
    .optional(),
  code: z
    .string()
    .min(2, "Branch code too short")
    .max(20, "Branch code too long")
    .optional(),
  address: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});