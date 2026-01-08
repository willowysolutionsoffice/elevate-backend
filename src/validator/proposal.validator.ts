import { z } from "zod";

import { ProposalStatus } from "@prisma/client";

export const createProposalItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
});

export const createProposalSchema = z.object({
  leadId: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  createdByUser: z.string().optional(),
  items: z.array(createProposalItemSchema).optional(),
});

export const updateProposalSchema = z.object({
  clientName: z.string().min(1, "Client name is required").optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  status: z.nativeEnum(ProposalStatus).optional(),
});

export const updateProposalItemSchema = z.object({
  description: z.string().min(1, "Description is required").optional(),
  quantity: z.number().int().positive("Quantity must be a positive integer").optional(),
  unitPrice: z.number().nonnegative("Unit price must be non-negative").optional(),
});

export const updateProposalStatusSchema = z.object({
  status: z.nativeEnum(ProposalStatus),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type UpdateProposalStatusInput = z.infer<typeof updateProposalStatusSchema>;
export type CreateProposalItemInput = z.infer<typeof createProposalItemSchema>;
export type UpdateProposalItemInput = z.infer<typeof updateProposalItemSchema>;
