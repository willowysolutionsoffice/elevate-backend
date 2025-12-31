import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import CustomError from "../utils/Custom-error";
import {
  createBranchSchema,
  updateBranchSchema,
} from "../validator/branch.schema";

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

export const getAllBranches = async (req: Request, res: Response) => {
  const branches = await prisma.branch.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    branches,
  });
};

export const getBranchById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const branch = await prisma.branch.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
      },
    },
  });

  if (!branch) {
    throw new CustomError("Branch not found", 404);
  }

  res.json({
    success: true,
    branch,
  });
};

export const updateBranch = async (req: Request, res: Response) => {
  const { id } = req.params;

  const parsed = updateBranchSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new CustomError(
      "Validation failed",
      400,
      parsed.error.flatten().fieldErrors
    );
  }

  const branch = await prisma.branch.findUnique({
    where: { id },
  });

  if (!branch) {
    throw new CustomError("Branch not found", 404);
  }

  const { name, code, address, status } = parsed.data;

  // Check for duplicate name or code if they're being updated
  if (name || code) {
    const exists = await prisma.branch.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              ...(name ? [{ name }] : []),
              ...(code ? [{ code }] : []),
            ],
          },
        ],
      },
    });

    if (exists) {
      throw new CustomError(
        "Branch with same name or code already exists",
        409
      );
    }
  }

  const updatedBranch = await prisma.branch.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(code && { code }),
      ...(address !== undefined && { address }),
      ...(status && { status }),
    },
  });

  res.json({
    success: true,
    branch: updatedBranch,
  });
};

export const disableBranch = async (req: Request, res: Response) => {
  const { id } = req.params;

  const branch = await prisma.branch.findUnique({
    where: { id },
    include: {
      users: {
        where: {
          status: "ACTIVE",
        },
      },
    },
  });

  if (!branch) {
    throw new CustomError("Branch not found", 404);
  }

  if (branch.status === "INACTIVE") {
    throw new CustomError("Branch is already disabled", 400);
  }

  // Check if branch has active users
  if (branch.users.length > 0) {
    throw new CustomError(
      "Cannot disable branch with active users. Please reassign or deactivate users first.",
      400
    );
  }

  const updatedBranch = await prisma.branch.update({
    where: { id },
    data: {
      status: "INACTIVE",
    },
  });

  res.json({
    success: true,
    message: "Branch disabled successfully",
    branch: updatedBranch,
  });
};
