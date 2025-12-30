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
router.get("/", authenticate("admin"), getAllBranches);
router.get("/:id", authenticate("admin"), getBranchById);
router.post("/", authenticate("admin"), createBranch);
router.put("/:id", authenticate("admin"), updateBranch);
router.patch("/:id/disable", authenticate("admin"), disableBranch);

export default router;
