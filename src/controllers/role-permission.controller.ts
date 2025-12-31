import { Response, Request } from "express";
import { AuthenticatedRequest } from "../type/auth.type";
import {prisma} from "../lib/prisma";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import CustomError from "../utils/Custom-error";
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from "../constants/permissions";

export const assignPermissionsToRole = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      throw new CustomError("permissionIds array is required", 400);
    }

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

    const existingPermissionIds = new Set(existingAssignments.map((rp: any) => rp.permissionId));
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
    const { roleId } = req.params;
    const { permissionIds } = req.body; // Expecting [permissionId]

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      throw new CustomError("permissionIds array is required", 400);
    }

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

    const permissions = rolePermissions.map((rp: any) => rp.permission);

    res.status(200).json({
      success: true,
      data: permissions,
    });
  }
);

export const getAllPermissionModulesAndActions = (req: Request, res: Response) => {
  const modules = Object.values(PERMISSION_MODULES);
  const actions = Object.values(PERMISSION_ACTIONS);
  res.json({ modules, actions });
};
