import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { register , changePassword , login } from "../controllers/auth.contorller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();


router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/change-password", authenticate(), asyncHandler(changePassword));

export default router;