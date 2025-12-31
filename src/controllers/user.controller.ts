import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import CustomError from "../utils/Custom-error";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from "../validator/user.schema";

export const createUser = async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new CustomError(
      "Validation failed",
      400,
      parsed.error.flatten().fieldErrors
    );
  }

  const { name, email, phone, password, roleId, branchId, status } = parsed.data;

  // Check if user with email or phone already exists
  const exists = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });

  if (exists) {
    throw new CustomError("User with this email or phone already exists", 409);
  }

  // Verify role exists
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new CustomError("Role not found", 404);
  }

  // Verify branch exists
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    throw new CustomError("Branch not found", 404);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      roleId,
      branchId,
      status: status || "ACTIVE",
    },
    include: {
      role: true,
      branch: true,
    },
  });

  res.status(201).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      branch: {
        id: user.branch.id,
        name: user.branch.name,
        code: user.branch.code,
      },
      createdAt: user.createdAt,
    },
  });
};

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const usersWithoutPassword = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    role: user.role,
    branch: user.branch,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  res.json({
    success: true,
    users: usersWithoutPassword,
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role,
      branch: user.branch,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const parsed = updateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new CustomError(
      "Validation failed",
      400,
      parsed.error.flatten().fieldErrors
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const { name, email, phone, roleId, branchId, status } = parsed.data;

  // Check for duplicate email or phone if they're being updated
  if (email || phone) {
    const exists = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              ...(email ? [{ email }] : []),
              ...(phone ? [{ phone }] : []),
            ],
          },
        ],
      },
    });

    if (exists) {
      throw new CustomError(
        "User with this email or phone already exists",
        409
      );
    }
  }

  // Verify role exists if being updated
  if (roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new CustomError("Role not found", 404);
    }
  }

  // Verify branch exists if being updated
  if (branchId) {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new CustomError("Branch not found", 404);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
      ...(roleId && { roleId }),
      ...(branchId && { branchId }),
      ...(status && { status }),
    },
    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  res.json({
    success: true,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      status: updatedUser.status,
      role: updatedUser.role,
      branch: updatedUser.branch,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
  });
};

export const disableUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  if (user.status === "INACTIVE") {
    throw new CustomError("User is already disabled", 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      status: "INACTIVE",
    },
    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  res.json({
    success: true,
    message: "User disabled successfully",
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      status: updatedUser.status,
      role: updatedUser.role,
      branch: updatedUser.branch,
      updatedAt: updatedUser.updatedAt,
    },
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { id } = req.params;

  const parsed = resetPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new CustomError(
      "Validation failed",
      400,
      parsed.error.flatten().fieldErrors
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const { newPassword } = parsed.data;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
    },
  });

  res.json({
    success: true,
    message: "Password reset successfully",
  });
};

