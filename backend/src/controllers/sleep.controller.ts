import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createSleepLogSchema, updateSleepLogSchema } from '../validators/sleep.validator';
import { asyncHandler, AppError } from '../middleware/error.middleware';

export const createSleepLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const validatedData = createSleepLogSchema.parse(req.body);

  const sleepStart = new Date(validatedData.sleepStart);
  const sleepEnd = new Date(validatedData.sleepEnd);
  const duration = (sleepEnd.getTime() - sleepStart.getTime()) / (1000 * 60 * 60); // in hours

  const sleepLog = await prisma.sleepLog.create({
    data: {
      userId,
      sleepStart,
      sleepEnd,
      duration,
      quality: validatedData.quality,
      notes: validatedData.notes,
    },
  });

  res.status(201).json({
    message: 'Sleep log created successfully',
    sleepLog,
  });
});

export const getSleepLogs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const where: any = { userId };

  if (startDate || endDate) {
    where.sleepStart = {};
    if (startDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      where.sleepStart.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      where.sleepStart.lte = end;
    }
  }

  const sleepLogs = await prisma.sleepLog.findMany({
    where,
    orderBy: { sleepStart: 'desc' },
  });

  const totals = sleepLogs.reduce(
    (acc, log) => ({
      totalLogs: acc.totalLogs + 1,
      totalDuration: acc.totalDuration + log.duration,
      averageQuality: acc.averageQuality + log.quality,
    }),
    { totalLogs: 0, totalDuration: 0, averageQuality: 0 }
  );

  if (totals.totalLogs > 0) {
    totals.averageQuality = totals.averageQuality / totals.totalLogs;
  }

  res.json({
    sleepLogs,
    totals,
  });
});

export const getSleepLogById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const sleepLog = await prisma.sleepLog.findFirst({
    where: { id, userId },
  });

  if (!sleepLog) {
    throw new AppError('Sleep log not found', 404);
  }

  res.json({ sleepLog });
});

export const updateSleepLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const validatedData = updateSleepLogSchema.parse(req.body);

  const existingSleepLog = await prisma.sleepLog.findFirst({
    where: { id, userId },
  });

  if (!existingSleepLog) {
    throw new AppError('Sleep log not found', 404);
  }

  const updateData: any = { ...validatedData };

  if (validatedData.sleepStart || validatedData.sleepEnd) {
    const sleepStart = validatedData.sleepStart
      ? new Date(validatedData.sleepStart)
      : existingSleepLog.sleepStart;
    const sleepEnd = validatedData.sleepEnd
      ? new Date(validatedData.sleepEnd)
      : existingSleepLog.sleepEnd;

    updateData.sleepStart = sleepStart;
    updateData.sleepEnd = sleepEnd;
    updateData.duration = (sleepEnd.getTime() - sleepStart.getTime()) / (1000 * 60 * 60);
  }

  const sleepLog = await prisma.sleepLog.update({
    where: { id },
    data: updateData,
  });

  res.json({
    message: 'Sleep log updated successfully',
    sleepLog,
  });
});

export const deleteSleepLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existingSleepLog = await prisma.sleepLog.findFirst({
    where: { id, userId },
  });

  if (!existingSleepLog) {
    throw new AppError('Sleep log not found', 404);
  }

  await prisma.sleepLog.delete({
    where: { id },
  });

  res.json({ message: 'Sleep log deleted successfully' });
});
