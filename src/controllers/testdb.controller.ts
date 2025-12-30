import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import CustomError from '../utils/Custom-error';

export const createTestDb = async (req: Request, res: Response) => {
  const { name } = req.body;

  // Validate input
  if (!name) {
    throw new CustomError('Name is required', 400);
  }

  // Create the record
  const testDb = await prisma.testDb.create({
    data: {
      name
    }
  });

  return res.status(201).json({
    success: true,
    data: testDb
  });
};

export const getAllTestDb = async (req: Request, res: Response) => {
  const testDbs = await prisma.testDb.findMany();
  
  return res.status(200).json({
    success: true,
    data: testDbs
  });
};