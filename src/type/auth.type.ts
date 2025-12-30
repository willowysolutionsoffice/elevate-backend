import { Request } from "express";
import z from "zod";
import { createUserSchema } from "../validator/auth.schema";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export type AllowedRole = "admin" | "manager" | "site-supervisor";


export type CreateUserInput = z.infer<typeof createUserSchema>;

export interface UserPayload extends CreateUserInput {
  id: string;
  roleId: string;
  branchId: string;
}