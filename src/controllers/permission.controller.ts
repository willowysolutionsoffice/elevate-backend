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
      orderBy: {
        module: "asc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Permissions fetched successfully",
      data: permissions,
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
