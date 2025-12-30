import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import CustomError from "../utils/Custom-error";
import { createRoleSchema } from "../validator/role.schema";

export const createRole = async (req: Request, res: Response) => {
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
};
