import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../type/auth.type";
import CustomError from "../utils/Custom-error";
import { env } from "../config/env.config";

const JWT_SECRET = env.JWT_SECRET;

export const authenticateSimple = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      throw new CustomError("Access token required", 401);
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
      };

      req.userId = decoded.userId; 

      return next();
    } catch (err) {
       throw new CustomError("Invalid token", 403);
    }
  } catch (error) {
    next(error);
  }
};
