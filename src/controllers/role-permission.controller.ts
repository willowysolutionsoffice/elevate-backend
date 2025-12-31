import { Response, Request } from "express";
import { AuthenticatedRequest } from "../type/auth.type";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import CustomError from "../utils/Custom-error";
import {
  assignPermissionsToRoleSchema,
  removePermissionsFromRoleSchema
} from "../validator/role-permission.schema";


export const assignPermissionsToRole = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {

    const parsed = assignPermissionsToRoleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new CustomError(
        "Validation failed",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const { roleId, permissionIds } = parsed.data;

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new CustomError("Role not found", 404);
    }

    // Validate all permissionIds exist
    const foundPermissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
      select: { id: true },
    });
    const foundIds = foundPermissions.map(p => p.id);
    if (foundIds.length === 0) {
      throw new CustomError("No valid permissions found to assign", 400);
    }

    const existingAssignments = await prisma.rolePermission.findMany({
      where: {
        roleId,
        permissionId: { in: foundIds },
      },
    });

    const existingPermissionIds = new Set(existingAssignments.map((rp) => rp.permissionId));
    const newPermissionIds = foundIds.filter((id) => !existingPermissionIds.has(id));

    if (newPermissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: newPermissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }

    res.status(200).json({
      success: true,
      message: "Permissions assigned successfully",
      assignedCount: newPermissionIds.length,
    });
  }
);

export const removePermissionsFromRole = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {

    const parsed = removePermissionsFromRoleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new CustomError(
        "Validation failed",
        400,
        parsed.error.flatten().fieldErrors
      );
    }
    const { roleId, permissionIds } = parsed.data;

    // Validate all permissionIds exist
    const foundPermissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
      select: { id: true },
    });
    const foundIds = foundPermissions.map(p => p.id);

    if (foundIds.length > 0) {
      await prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: { in: foundIds },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Permissions removed successfully",
    });
  }
);

export const getRolePermissions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { roleId } = req.params;

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    const permissions = rolePermissions.map((rp) => rp.permission);

    res.status(200).json({
      success: true,
      data: permissions,
    });
  }
);

