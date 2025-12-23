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
      where.loggedAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.loggedAt.lte = new Date(endDate as string);
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
      duration: acc.duration + ex.duration,
      calories: acc.calories + (ex.calories || 0),
      distance: acc.distance + (ex.distance || 0),
    }),
    { duration: 0, calories: 0, distance: 0 }
  );

  res.json({
    exercises,
    totals,
    count: exercises.length,
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
