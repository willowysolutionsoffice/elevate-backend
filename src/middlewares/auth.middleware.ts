import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AllowedRole, AuthenticatedRequest } from "../type/auth.type";
import CustomError from "../utils/Custom-error";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export const authenticate =
  (requiredRole?: AllowedRole) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      throw new CustomError("Access token required", 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role?: AllowedRole;
    };

    req.userId = decoded.userId;

    if (requiredRole) {
      if (!decoded.role) {
        throw new CustomError("Role missing in token", 403);
      }

      if (decoded.role !== requiredRole) {
        throw new CustomError("Unauthorized access", 403);
      }
    }

    next();
  };
