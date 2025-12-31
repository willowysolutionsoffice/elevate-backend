import { Response } from "express";
import { AuthenticatedRequest } from "../type/auth.type";
import {prisma} from "../lib/prisma";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import CustomError from "../utils/Custom-error";

export const createPermission = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { module, action } = req.body;

    if (!module || !action) {
      throw new CustomError("Module and Action are required", 400);
    }

    const existingPermission = await prisma.permission.findFirst({
      where: {
        module,
        action,
      },
    });

    if (existingPermission) {
      throw new CustomError("Permission already exists", 409);
    }

    const permission = await prisma.permission.create({
      data: {
        module,
        action,
      },
    });

    res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: permission,
    });
  }
);

export const getAllPermissions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }],
    });

    const matrix = permissions.reduce<Record<string, Record<string, string>>>(
      (acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = {};
        }

        acc[permission.module][permission.action] = permission.id;

        return acc;
      },
      {}
    );

    res.status(200).json({
      success: true,
      message: "Permissions fetched successfully",
      data: matrix,
    });
  }
);


export const updatePermission = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { module, action } = req.body;

    const permissionCallback = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permissionCallback) {
      throw new CustomError("Permission not found", 404);
    }

    // Check if new combination exists
    if (module || action) {
        const existing = await prisma.permission.findFirst({
            where: {
                module: module || permissionCallback.module,
                action: action || permissionCallback.action,
                NOT: {
                    id
                }
            }
        });
        
        if (existing) {
            throw new CustomError("Permission with this module/action already exists", 409);
        }
    }

    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: {
        module,
        action,
      },
    });

    res.status(200).json({
      success: true,
      message: "Permission updated successfully",
      data: updatedPermission,
    });
  }
);

export const deletePermission = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new CustomError("Permission not found", 404);
    }

    await prisma.permission.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Permission deleted successfully",
    });
  }
);

export const bulkCreatePermissions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const permissions = req.body.permissions;
    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new CustomError("Permissions array is required", 400);
    }

    // Validate all items
    const invalid = permissions.filter(
      (p) => !p.module || !p.action
    );
    if (invalid.length > 0) {
      throw new CustomError("Each permission must have module and action", 400);
    }

    // Find existing permissions
    const existing = await prisma.permission.findMany({
      where: {
        OR: permissions.map((p) => ({ module: p.module, action: p.action }))
      }
    });
    const existingSet = new Set(existing.map((e) => `${e.module}:${e.action}`));

    // Filter out duplicates
    const toCreate = permissions.filter(
      (p) => !existingSet.has(`${p.module}:${p.action}`)
    );

    // Bulk create
    let createdCount = 0;
    if (toCreate.length > 0) {
      const batchPayload = await prisma.permission.createMany({
        data: toCreate,
        skipDuplicates: true
      });
      createdCount = batchPayload.count;
    }

    res.status(201).json({
      success: true,
      message: `${createdCount} permissions created, ${existing.length} already existed`,
      created: toCreate,
      skipped: existing.map((e) => ({ module: e.module, action: e.action }))
    });
  }
);
