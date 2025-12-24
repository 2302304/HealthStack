import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createExerciseSchema, updateExerciseSchema } from '../validators/exercise.validator';
import { asyncHandler, AppError } from '../middleware/error.middleware';

export const createExercise = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const validatedData = createExerciseSchema.parse(req.body);

  const exercise = await prisma.exercise.create({
    data: {
      ...validatedData,
      userId,
      loggedAt: validatedData.loggedAt ? new Date(validatedData.loggedAt) : new Date(),
    },
  });

  res.status(201).json({
    message: 'Exercise logged successfully',
    exercise,
  });
});

export const getExercises = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { startDate, endDate, exerciseType } = req.query;

  const where: any = { userId };

  if (startDate || endDate) {
    where.loggedAt = {};
    if (startDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      where.loggedAt.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      where.loggedAt.lte = end;
    }
  }

  if (exerciseType) {
    where.exerciseType = exerciseType;
  }

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: { loggedAt: 'desc' },
  });

  const totals = exercises.reduce(
    (acc, ex) => ({
      totalExercises: acc.totalExercises + 1,
      totalDuration: acc.totalDuration + ex.duration,
      totalCalories: acc.totalCalories + (ex.calories || 0),
      totalDistance: acc.totalDistance + (ex.distance || 0),
    }),
    { totalExercises: 0, totalDuration: 0, totalCalories: 0, totalDistance: 0 }
  );

  res.json({
    exercises,
    totals,
  });
});

export const getExerciseById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const exercise = await prisma.exercise.findFirst({
    where: { id, userId },
  });

  if (!exercise) {
    throw new AppError('Exercise not found', 404);
  }

  res.json({ exercise });
});

export const updateExercise = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const validatedData = updateExerciseSchema.parse(req.body);

  const existingExercise = await prisma.exercise.findFirst({
    where: { id, userId },
  });

  if (!existingExercise) {
    throw new AppError('Exercise not found', 404);
  }

  const exercise = await prisma.exercise.update({
    where: { id },
    data: {
      ...validatedData,
      loggedAt: validatedData.loggedAt ? new Date(validatedData.loggedAt) : undefined,
    },
  });

  res.json({
    message: 'Exercise updated successfully',
    exercise,
  });
});

export const deleteExercise = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existingExercise = await prisma.exercise.findFirst({
    where: { id, userId },
  });

  if (!existingExercise) {
    throw new AppError('Exercise not found', 404);
  }

  await prisma.exercise.delete({
    where: { id },
  });

  res.json({ message: 'Exercise deleted successfully' });
});
