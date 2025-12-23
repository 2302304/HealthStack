import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createFoodLogSchema, updateFoodLogSchema } from '../validators/food.validator';
import { asyncHandler, AppError } from '../middleware/error.middleware';

/**
 * Create a new food log
 * POST /api/food-logs
 */
export const createFoodLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const validatedData = createFoodLogSchema.parse(req.body);

  const foodLog = await prisma.foodLog.create({
    data: {
      ...validatedData,
      userId,
      loggedAt: validatedData.loggedAt ? new Date(validatedData.loggedAt) : new Date(),
    },
  });

  res.status(201).json({
    message: 'Food log created successfully',
    foodLog,
  });
});

/**
 * Get all food logs for the current user
 * GET /api/food-logs
 * Query params: startDate, endDate, mealType
 */
export const getFoodLogs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { startDate, endDate, mealType } = req.query;

  const where: any = { userId };

  if (startDate || endDate) {
    where.loggedAt = {};
    if (startDate) {
      where.loggedAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.loggedAt.lte = new Date(endDate as string);
    }
  }

  if (mealType) {
    where.mealType = mealType;
  }

  const foodLogs = await prisma.foodLog.findMany({
    where,
    orderBy: { loggedAt: 'desc' },
  });

  // Calculate totals
  const totals = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
      fiber: acc.fiber + (log.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  res.json({
    foodLogs,
    totals,
    count: foodLogs.length,
  });
});

/**
 * Get a single food log by ID
 * GET /api/food-logs/:id
 */
export const getFoodLogById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const foodLog = await prisma.foodLog.findFirst({
    where: { id, userId },
  });

  if (!foodLog) {
    throw new AppError('Food log not found', 404);
  }

  res.json({ foodLog });
});

/**
 * Update a food log
 * PUT /api/food-logs/:id
 */
export const updateFoodLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const validatedData = updateFoodLogSchema.parse(req.body);

  // Check if food log exists and belongs to user
  const existingFoodLog = await prisma.foodLog.findFirst({
    where: { id, userId },
  });

  if (!existingFoodLog) {
    throw new AppError('Food log not found', 404);
  }

  const foodLog = await prisma.foodLog.update({
    where: { id },
    data: {
      ...validatedData,
      loggedAt: validatedData.loggedAt ? new Date(validatedData.loggedAt) : undefined,
    },
  });

  res.json({
    message: 'Food log updated successfully',
    foodLog,
  });
});

/**
 * Delete a food log
 * DELETE /api/food-logs/:id
 */
export const deleteFoodLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if food log exists and belongs to user
  const existingFoodLog = await prisma.foodLog.findFirst({
    where: { id, userId },
  });

  if (!existingFoodLog) {
    throw new AppError('Food log not found', 404);
  }

  await prisma.foodLog.delete({
    where: { id },
  });

  res.json({ message: 'Food log deleted successfully' });
});
