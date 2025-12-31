import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createPermission,
  deletePermission,
  getAllPermissions,
  updatePermission,
  bulkCreatePermissions
} from "../controllers/permission.controller";

const router = Router();

router.post("/", authenticate({module:'Permission' , action:'create'}), createPermission);
router.post("/bulk", authenticate({module:'Permission' , action:'create'}), bulkCreatePermissions);
router.get("/", authenticate({module:'Permission' , action:'view'}), getAllPermissions);
router.patch("/:id", authenticate({module:'Permission' , action:'update'}), updatePermission);
router.delete("/:id", authenticate({module:'Permission' , action:'delete'}), deletePermission);

export default router;
