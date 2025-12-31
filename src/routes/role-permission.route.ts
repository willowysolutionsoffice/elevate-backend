import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  assignPermissionsToRole,
  getRolePermissions,
  removePermissionsFromRole,
  getAllPermissionModulesAndActions,
} from "../controllers/role-permission.controller";

const router = Router();


router.post("/:roleId/permissions", assignPermissionsToRole);

router.get("/:roleId/permissions", getRolePermissions);

router.delete("/:roleId/permissions", removePermissionsFromRole);

router.get("/modules-actions", getAllPermissionModulesAndActions);

export default router;
