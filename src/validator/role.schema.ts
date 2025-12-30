import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.enum(["admin", "manager", "site-supervisor"], {
    error: "Invalid role name",
  }),
  description: z.string().optional(),
});
