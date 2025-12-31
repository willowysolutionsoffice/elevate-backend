import { z } from "zod";

export const assignPermissionsToRoleSchema = z.object({
  roleId: z.string().uuid("Invalid role ID"),
  permissionIds: z.array(z.string().uuid(), {
    error: "permissionIds must be an array of UUID strings",
  }).min(1, "At least one permissionId is required"),
});

export const removePermissionsFromRoleSchema = z.object({
  roleId: z.string().uuid("Invalid role ID"),
  permissionIds: z.array(z.string().uuid(), {
    error: "permissionIds must be an array of UUID strings",
  }).min(1, "At least one permissionId is required"),
});
