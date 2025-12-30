import { Router } from "express";
import { createBranch } from "../controllers/branch.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate("admin"), createBranch);

export default router;
