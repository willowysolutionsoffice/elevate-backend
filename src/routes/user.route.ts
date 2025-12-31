import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  disableUser,
  resetPassword,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All user routes require authentication with appropriate permissions
router.get(
  "/",
  authenticate({ module: "User", action: "view" }),
  getAllUsers
);
router.get(
  "/:id",
  authenticate({ module: "User", action: "view" }),
  getUserById
);
router.post(
  "/",
  authenticate({ module: "User", action: "create" }),
  createUser
);
router.put(
  "/:id",
  authenticate({ module: "User", action: "update" }),
  updateUser
);
router.patch(
  "/:id/disable",
  authenticate({ module: "User", action: "delete" }),
  disableUser
);
router.patch(
  "/:id/reset-password",
  authenticate({ module: "User", action: "update" }),
  resetPassword
);

export default router;

