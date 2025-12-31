import { z } from "zod";

export const assignPermissionsToRoleSchema = z.object({
  permissionIds: z.array(z.string().uuid(), {
    error: "permissionIds must be an array of UUID strings",
  }).min(1, "At least one permissionId is required"),
});

export const removePermissionsFromRoleSchema = z.object({
  permissionIds: z.array(z.string().uuid(), {
    error: "permissionIds must be an array of UUID strings",
  }).min(1, "At least one permissionId is required"),
});
