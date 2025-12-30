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
    .max(20, "Phone number too long"),

  password: passwordSchema,

  roleId: z.string().uuid("Invalid role ID"),
  branchId: z.string().uuid("Invalid branch ID"),
});
