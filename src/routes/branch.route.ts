import { Router } from "express";
import {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  disableBranch,
} from "../controllers/branch.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All branch routes require admin authentication
router.get("/", authenticate({module:'Branch',action:'view'}), getAllBranches);
router.get("/:id", authenticate({module:'Branch',action:'view'}), getBranchById);
router.post("/", authenticate({module:'Branch',action:'create'}), createBranch);
router.put("/:id", authenticate({module:'Branch',action:'update'}), updateBranch);
router.patch("/:id/disable", authenticate({module:'Branch',action:'delete'}), disableBranch);

export default router;
