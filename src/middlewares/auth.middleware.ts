import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../type/auth.type";
import { PermissionRequirement } from "../type/permission.type";
import CustomError from "../utils/Custom-error";
import { prisma } from "../lib/prisma";
import { env } from "../config/env.config";

const JWT_SECRET = env.JWT_SECRET;


export const authenticate =
  (requirement?: PermissionRequirement) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      if (!token) {
        throw new CustomError("Access token required", 401);
      }

      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
      };

      req.userId = decoded.userId;

      if (!requirement) {
        return next();
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user || !user.role) {
        throw new CustomError("User or Role not found", 403);
      }

      const hasPermission = user.role.rolePermissions.some(
        (rp) =>
          rp.permission.module === requirement.module &&
          rp.permission.action === requirement.action
      );

      if (!hasPermission) {
        throw new CustomError(
          `Permission denied for ${requirement.module}:${requirement.action}`,
          403
        );
      }
      return next();
    } catch (error) {
      next(error);
    }
  };
