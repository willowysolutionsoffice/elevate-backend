import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  assignPermissionsToRole,
  getRolePermissions,
  removePermissionsFromRole,
  getAllPermissionModulesAndActions,
} from "../controllers/role-permission.controller";

const router = Router();


router.post("/:roleId/permissions", authenticate({module:'Permission' , action:'create'}), assignPermissionsToRole);

router.get("/:roleId/permissions", authenticate({module:'Permission' , action:'view'}), getRolePermissions);

router.delete("/:roleId/permissions", authenticate({module:'Permission' , action:'delete'}), removePermissionsFromRole);

router.get("/modules-actions", authenticate({module:'Permission' , action:'view'}), getAllPermissionModulesAndActions);

export default router;
