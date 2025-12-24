import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createMoodLogSchema, updateMoodLogSchema } from '../validators/mood.validator';
import { asyncHandler, AppError } from '../middleware/error.middleware';

export const createMoodLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const validatedData = createMoodLogSchema.parse(req.body);

  const moodLog = await prisma.moodLog.create({
    data: {
      ...validatedData,
      userId,
      loggedAt: validatedData.loggedAt ? new Date(validatedData.loggedAt) : new Date(),
    },
  });

  res.status(201).json({
    message: 'Mood log created successfully',
    moodLog,
  });
});

export const getMoodLogs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

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

  const moodLogs = await prisma.moodLog.findMany({
    where,
    orderBy: { loggedAt: 'desc' },
  });

  const totals = moodLogs.reduce(
    (acc, log) => ({
      totalLogs: acc.totalLogs + 1,
      averageMood: acc.averageMood + log.mood,
      averageEnergy: acc.averageEnergy + (log.energy || 0),
      averageStress: acc.averageStress + (log.stress || 0),
      energyCount: acc.energyCount + (log.energy ? 1 : 0),
      stressCount: acc.stressCount + (log.stress ? 1 : 0),
    }),
    {
      totalLogs: 0,
      averageMood: 0,
      averageEnergy: 0,
      averageStress: 0,
      energyCount: 0,
      stressCount: 0,
    }
  );

  if (totals.totalLogs > 0) {
    totals.averageMood = totals.averageMood / totals.totalLogs;
    totals.averageEnergy = totals.energyCount > 0 ? totals.averageEnergy / totals.energyCount : 0;
    totals.averageStress = totals.stressCount > 0 ? totals.averageStress / totals.stressCount : 0;
  }

  res.json({
    moodLogs,
    totals: {
      totalLogs: totals.totalLogs,
      averageMood: totals.averageMood,
      averageEnergy: totals.averageEnergy,
      averageStress: totals.averageStress,
    },
  });
});

export const getMoodLogById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const moodLog = await prisma.moodLog.findFirst({
    where: { id, userId },
  });

  if (!moodLog) {
    throw new AppError('Mood log not found', 404);
  }

  res.json({ moodLog });
});

export const updateMoodLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const validatedData = updateMoodLogSchema.parse(req.body);

  const existingMoodLog = await prisma.moodLog.findFirst({
    where: { id, userId },
  });

  if (!existingMoodLog) {
    throw new AppError('Mood log not found', 404);
  }

  const moodLog = await prisma.moodLog.update({
    where: { id },
    data: {
      ...validatedData,
      loggedAt: validatedData.loggedAt ? new Date(validatedData.loggedAt) : undefined,
    },
  });

  res.json({
    message: 'Mood log updated successfully',
    moodLog,
  });
});

export const deleteMoodLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existingMoodLog = await prisma.moodLog.findFirst({
    where: { id, userId },
  });

  if (!existingMoodLog) {
    throw new AppError('Mood log not found', 404);
  }

  await prisma.moodLog.delete({
    where: { id },
  });

  res.json({ message: 'Mood log deleted successfully' });
});
