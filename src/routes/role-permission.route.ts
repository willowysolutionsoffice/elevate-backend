import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  assignPermissionsToRole,
  getRolePermissions,
  removePermissionsFromRole,
} from "../controllers/role-permission.controller";

const router = Router();


router.post("/:roleId/permissions", authenticate({module:'Permission' , action:'create'}), assignPermissionsToRole);

router.get("/:roleId/permissions", authenticate({module:'Permission' , action:'view'}), getRolePermissions);

router.delete("/:roleId/permissions", authenticate({module:'Permission' , action:'delete'}), removePermissionsFromRole);

export default router;
