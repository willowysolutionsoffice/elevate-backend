import { Router } from "express";
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  updateRole,
} from "../controllers/role.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();


router.post(
  "/",
  authenticate({ module: "Role", action: "create" }),
  createRole
);
router.get(
  "/",
  authenticate({ module: "Role", action: "view" }),
  getAllRoles
);
router.get(
  "/:id",
  authenticate({ module: "Role", action: "view" }),
  getRoleById
);
router.patch(
  "/:id",
  authenticate({ module: "Role", action: "update" }),
  updateRole
);
router.delete(
  "/:id",
  authenticate({ module: "Role", action: "delete" }),
  deleteRole
);

export default router;
