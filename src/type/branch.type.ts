import z from "zod";
import { createBranchSchema } from "../validator/branch.schema";

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
