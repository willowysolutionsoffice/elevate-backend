import { Router } from "express";
import { createTestDb, getAllTestDb } from "../controllers/testdb.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

const router = Router();

router.post("/", asyncHandler(createTestDb))
router.get("/", asyncHandler(getAllTestDb));

export default router;