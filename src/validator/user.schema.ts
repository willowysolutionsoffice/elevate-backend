import { z } from "zod";
import { emailSchema, passwordSchema } from "./common.schema";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name too short")
    .max(100, "Name too long"),

  email: emailSchema,

  phone: z
    .string()
    .min(8, "Phone number too short")
    .max(20, "Phone number too long")
    .optional(),

  password: passwordSchema,

  roleId: z.string().uuid("Invalid role ID"),
  branchId: z.string().uuid("Invalid branch ID"),

  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name too short")
    .max(100, "Name too long")
    .optional(),

  email: emailSchema.optional(),

  phone: z
    .string()
    .min(8, "Phone number too short")
    .max(20, "Phone number too long")
    .optional(),

  roleId: z.string().uuid("Invalid role ID").optional(),
  branchId: z.string().uuid("Invalid branch ID").optional(),

  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

