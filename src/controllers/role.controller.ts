import { NextFunction, Request, Response } from "express";
import {prisma} from "../lib/prisma";
import CustomError from "../utils/Custom-error";
import { createRoleSchema } from "../validator/role.schema";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export const createRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createRoleSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new CustomError(
      "Validation failed",
      400,
      parsed.error.flatten().fieldErrors
    );
  }

  const { name, description } = parsed.data;

  const exists = await prisma.role.findFirst({
    where: { name },
  });

  if (exists) {
    throw new CustomError("Role already exists", 409);
  }

  const role = await prisma.role.create({
    data: {
      name,
      description,
    },
  });

  res.status(201).json({
    success: true,
    role,
  });
});

export const getAllRoles = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const roles = await prisma.role.findMany();

  res.status(200).json({
    success: true,
    data: roles,
  });
});

export const getRoleById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!role) {
    throw new CustomError("Role not found", 404);
  }

  res.status(200).json({
    success: true,
    data: role,
  });
});

export const updateRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const parsed = createRoleSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    throw new CustomError(
      "Validation failed",
      400,
      parsed.error.flatten().fieldErrors
    );
  }

  const role = await prisma.role.findUnique({
    where: { id },
  });

  if (!role) {
    throw new CustomError("Role not found", 404);
  }

  const updatedRole = await prisma.role.update({
    where: { id },
    data: parsed.data,
  });

  res.status(200).json({
    success: true,
    data: updatedRole,
  });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const role = await prisma.role.findUnique({
    where: { id },
  });

  if (!role) {
    throw new CustomError("Role not found", 404);
  }

  await prisma.role.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "Role deleted successfully",
  });
});
