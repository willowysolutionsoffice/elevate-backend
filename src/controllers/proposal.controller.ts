import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  createProposalSchema,
  updateProposalSchema,
  updateProposalItemSchema,
  createProposalItemSchema,
  updateProposalStatusSchema,
} from "../validator/proposal.validator";
import { ProposalStatus } from "@prisma/client";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { PdfService } from "../services/pdf.service";
import { AuthenticatedRequest } from "../type/auth.type";

// Helper to calculate totals
const calculateItemTotal = (quantity: number, unitPrice: number) => {
  return quantity * unitPrice;
};

export const createProposal = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = createProposalSchema.parse(req.body);
  const userId = req.userId;

  let createdById: string | undefined = undefined;
  let createdByUser = data.createdByUser;

  if (userId) {
     const user = await prisma.user.findUnique({ where: { id: userId } });
     if (user) {
         createdById = user.id;
         if (!createdByUser) {
             createdByUser = user.name;
         }
     }
  }

  if (!createdById && !createdByUser) {
      res.status(400);
      throw new Error("Creator information missing. Provide 'createdByUser' or use a valid internal user token.");
  }

  let clientName = data.clientName;
  let clientEmail = data.clientEmail;
  let clientPhone = data.clientPhone;

  if (data.leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: data.leadId },
    });
    if (lead) {
      if (!clientName) clientName = lead.clientName;
      if (!clientEmail) clientEmail = lead.email || undefined; // Handle potential nulls
      if (!clientPhone) clientPhone = lead.phone || undefined;
    }
  }
  
  // Final validation for required Client Name (schema handles it, but double check logic)
  if (!clientName) {
      res.status(400);  
      throw new Error("Client Name is required (either from body or linked Lead).");
  }

  // Generate Proposal No
  const count = await prisma.proposal.count();
  const proposalNo = `PROP-${new Date().getFullYear()}-${(count + 1)
    .toString()
    .padStart(4, "0")}`;

  // Calculate Totals
  let totalAmount = 0;
  const itemsToCreate =
    data.items?.map((item) => {
      const total = calculateItemTotal(item.quantity, item.unitPrice);
      totalAmount += total;
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: total,
      };
    }) || [];

  const proposal = await prisma.proposal.create({
    data: {
      leadId: data.leadId || undefined, // undefined skips the relation if null/empty
      proposalNo,
      clientName: clientName!,
      clientEmail,
      clientPhone,
      status: ProposalStatus.DRAFT,
      totalAmount: totalAmount,
      createdById: createdById,
      createdByUser: createdByUser,
      items: {
        create: itemsToCreate,
      },
    },
    include: {
      items: true,
    },
  });

  res.status(201).json(proposal);
});

export const getProposals = asyncHandler(async (req: Request, res: Response) => {
  const proposals = await prisma.proposal.findMany({
    include: {
      items: true,
      createdBy: {
        select: { id: true, name: true },
      },
      lead: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(proposals);
});

export const getProposalById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      items: true,
      createdBy: {
        select: { id: true, name: true },
      },
      lead: true,
    },
  });

  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }

  res.json(proposal);
});

export const updateProposal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = updateProposalSchema.parse(req.body);

  const existingProposal = await prisma.proposal.findUnique({ where: { id } });
  if (!existingProposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }

  if (existingProposal.status !== ProposalStatus.DRAFT) {
    if (!data.status) {
      res.status(400);
      throw new Error("Cannot edit proposal that is not in DRAFT status");
    }

    if (data.status) {
      const otherFields = Object.keys(data).filter((k) => k !== "status");
      if (otherFields.length > 0) {
        res.status(400);
        throw new Error(
          "Cannot edit details of proposal that is not in DRAFT status. Only status change allowed."
        );
      }
    }
  }

  const proposal = await prisma.proposal.update({
    where: { id },
    data: data,
    include: { items: true },
  });

  res.json(proposal);
});

export const updateProposalItem = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const data = updateProposalItemSchema.parse(req.body);

  const item = await prisma.proposalItem.findUnique({
    where: { id: itemId },
    include: { proposal: true },
  });
  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  if (item.proposal.status !== ProposalStatus.DRAFT) {
    res.status(400);
    throw new Error("Cannot edit item of a proposal that is not in DRAFT status");
  }

  // Update item
  const quantity = data.quantity !== undefined ? data.quantity : item.quantity;
  const unitPrice =
    data.unitPrice !== undefined ? data.unitPrice : Number(item.unitPrice);
  const total = calculateItemTotal(quantity, unitPrice);

  await prisma.$transaction(async (tx) => {
    await tx.proposalItem.update({
      where: { id: itemId },
      data: {
        ...data,
        total: total,
      },
    });

    // Recalculate Proposal Total
    const allItems = await tx.proposalItem.findMany({
      where: { proposalId: item.proposalId },
    });
    const newProposalTotal = allItems.reduce(
      (sum, i) => sum + Number(i.total),
      0
    );

    await tx.proposal.update({
      where: { id: item.proposalId },
      data: { totalAmount: newProposalTotal },
    });
  });

  res.json({ message: "Item updated successfully" });
});

export const deleteProposalItem = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;

  const item = await prisma.proposalItem.findUnique({
    where: { id: itemId },
    include: { proposal: true },
  });
  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  if (item.proposal.status !== ProposalStatus.DRAFT) {
    res.status(400);
    throw new Error(
      "Cannot delete item from a proposal that is not in DRAFT status"
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.proposalItem.delete({
      where: { id: itemId },
    });

    // Recalculate Proposal Total
    const allItems = await tx.proposalItem.findMany({
      where: { proposalId: item.proposalId },
    });
    const newProposalTotal = allItems.reduce(
      (sum, i) => sum + Number(i.total),
      0
    );

    await tx.proposal.update({
      where: { id: item.proposalId },
      data: { totalAmount: newProposalTotal },
    });
  });

  res.json({ message: "Item deleted successfully" });
});

export const addProposalItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = createProposalItemSchema.parse(req.body);

  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }

  if (proposal.status !== ProposalStatus.DRAFT) {
    res.status(400);
    throw new Error("Cannot add item to a proposal that is not in DRAFT status");
  }

  const total = calculateItemTotal(data.quantity, data.unitPrice);

  await prisma.$transaction(async (tx) => {
    await tx.proposalItem.create({
      data: {
        proposalId: id,
        description: data.description,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        total,
      },
    });

    // Recalculate Proposal Total
    const allItems = await tx.proposalItem.findMany({
      where: { proposalId: id },
    });
    const newProposalTotal = allItems.reduce(
      (sum, i) => sum + Number(i.total),
      0
    );

    await tx.proposal.update({
      where: { id: id },
      data: { totalAmount: newProposalTotal },
    });
  });

  res.status(201).json({ message: "Item added successfully" });
});

export const generateProposalPdf = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: { items: true }
    });
    
    if (!proposal) {
        res.status(404);
        throw new Error("Proposal not found");
    }
    
    const filename = `proposal-${proposal.proposalNo}.pdf`;
    
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');
    
    PdfService.generateProposalPdf(
        proposal,
        (chunk) => res.write(chunk),
        () => res.end()
    );
});

export const updateProposalStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = updateProposalStatusSchema.parse(req.body);

  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }

  const updatedProposal = await prisma.proposal.update({
    where: { id },
    data: { status },
  });

  res.json(updatedProposal);
});

export const deleteProposal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }

  if (proposal.status !== ProposalStatus.DRAFT) {
      res.status(400);
      throw new Error("Cannot delete a proposal that is not in DRAFT status");
  }

  // Deleting proposal - items should be deleted via cascade if configured in Prisma schema
  // If not, we might need manual deletion. Assuming proper relation setup.
  // Safest to try generic delete.
  await prisma.proposal.delete({
    where: { id },
  });

  res.json({ message: "Proposal deleted successfully" });
});
