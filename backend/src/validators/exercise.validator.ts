import { z } from 'zod';
import { ExerciseType, Intensity } from '@prisma/client';

export const createExerciseSchema = z.object({
  exerciseName: z.string().min(1, 'Exercise name is required'),
  exerciseType: z.nativeEnum(ExerciseType),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  calories: z.number().min(0).optional(),
  distance: z.number().min(0).optional(),
  intensity: z.nativeEnum(Intensity).optional(),
  notes: z.string().optional(),
  loggedAt: z.string().datetime().optional(),
});

export const updateExerciseSchema = createExerciseSchema.partial();

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
