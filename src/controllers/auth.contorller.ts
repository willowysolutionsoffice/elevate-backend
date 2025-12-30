import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";
import { createUserSchema } from "../validator/auth.schema";
import CustomError from "../utils/Custom-error";
import { AuthenticatedRequest } from "../type/auth.type";

export const register = async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new CustomError(
      "Validation failed",
      400,
      parsed.error.flatten().fieldErrors
    );
  }

  const { name, email, phone, password, roleId, branchId } = parsed.data;

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  if (exists) {
    throw new CustomError("User already exists", 409);
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
      role: user.role.name,
      branch: user.branch.name,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    throw new CustomError("Email and password are required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    throw new CustomError("Invalid credentials", 401);
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new CustomError("Invalid credentials", 401);
  }

  const token = signToken({
    userId: user.id,
    role: user.role.name,
  });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    },
  });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body as {
    oldPassword?: string;
    newPassword?: string;
  };

  if (!userId) {
    throw new CustomError("Unauthorized", 401);
  }

  if (!oldPassword || !newPassword) {
    throw new CustomError("Missing required fields", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    throw new CustomError("Wrong password", 401);
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  res.json({ success: true });
};
;
