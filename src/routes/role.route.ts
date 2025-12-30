import { Router } from "express";
import { createRole } from "../controllers/role.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate("admin"), createRole);

export default router;
