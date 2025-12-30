import z from "zod";
import { createRoleSchema } from "../validator/role.schema";


export type CreateRoleInput = z.infer<typeof createRoleSchema>;
