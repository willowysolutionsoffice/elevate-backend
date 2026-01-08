import { Router } from "express";
import {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  updateProposalItem,
  deleteProposalItem,
  addProposalItem,
  generateProposalPdf,
  updateProposalStatus,
  deleteProposal,
} from "../controllers/proposal.controller";
import { authenticateSimple } from "../middlewares/auth-simple.middleware";

const router = Router();

router.post(
  "/",
  authenticateSimple,
  createProposal
);

router.get(
  "/",
  authenticateSimple,
  getProposals
);

router.get(
  "/:id",
  authenticateSimple,
  getProposalById
);

router.get(
  "/:id/pdf",
  authenticateSimple,
  generateProposalPdf
);

router.put(
  "/:id",
  authenticateSimple,
  updateProposal
);

router.post(
  "/:id/items",
  authenticateSimple,
  addProposalItem
);

router.put(
  "/items/:itemId",
  authenticateSimple,
  updateProposalItem
);

router.delete(
  "/items/:itemId",
  authenticateSimple,
  deleteProposalItem
);

router.patch(
  "/:id/status",
  authenticateSimple,
  updateProposalStatus
);

router.delete(
  "/:id",
  authenticateSimple,
  deleteProposal
);

export default router;
