import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import CustomError from "../utils/Custom-error";
import { createBranchSchema } from "../validator/branch.schema";

export const createBranch = async (req: Request, res: Response) => {
  const parsed = createBranchSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new CustomError(
      "Validation failed",
      400,
      parsed.error.flatten().fieldErrors
    );
  }

  const { name, code, address, status } = parsed.data;

  const exists = await prisma.branch.findFirst({
    where: {
      OR: [{ name }, { code }],
    },
  });

  if (exists) {
    throw new CustomError(
      "Branch with same name or code already exists",
      409
    );
  }

  const branch = await prisma.branch.create({
    data: {
      name,
      code,
      address,
      status,
    },
  });

  res.status(201).json({
    success: true,
    branch,
  });
};
