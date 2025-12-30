import z from "zod";
import {
  createBranchSchema,
  updateBranchSchema,
} from "../validator/branch.schema";

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
