import { z } from "zod";

export const emailSchema = z.string().email("Invalid email format");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");
