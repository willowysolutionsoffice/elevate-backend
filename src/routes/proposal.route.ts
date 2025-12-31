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
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate({ module: "Proposal", action: "create" }),
  createProposal
);

router.get(
  "/",
  authenticate({ module: "Proposal", action: "view" }),
  getProposals
);

router.get(
  "/:id",
  authenticate({ module: "Proposal", action: "view" }),
  getProposalById
);

router.get(
  "/:id/pdf",
  authenticate({ module: "Proposal", action: "view" }),
  generateProposalPdf
);

router.put(
  "/:id",
  authenticate({ module: "Proposal", action: "update" }),
  updateProposal
);

router.post(
  "/:id/items",
  authenticate({ module: "Proposal", action: "update" }),
  addProposalItem
);

router.put(
  "/items/:itemId",
  authenticate({ module: "Proposal", action: "update" }),
  updateProposalItem
);

router.delete(
  "/items/:itemId",
  authenticate({ module: "Proposal", action: "update" }),
  deleteProposalItem
);

router.patch(
  "/:id/status",
  authenticate({ module: "Proposal", action: "update" }),
  updateProposalStatus
);

router.delete(
  "/:id",
  authenticate({ module: "Proposal", action: "delete" }),
  deleteProposal
);

export default router;
