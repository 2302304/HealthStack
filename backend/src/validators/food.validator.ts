import { z } from 'zod';
import { MealType } from '@prisma/client';

export const createFoodLogSchema = z.object({
  foodName: z.string().min(1, 'Food name is required'),
  calories: z.number().min(0, 'Calories must be a positive number'),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  mealType: z.nativeEnum(MealType),
  servingSize: z.string().optional(),
  notes: z.string().optional(),
  loggedAt: z.string().datetime().optional(),
});

export const updateFoodLogSchema = createFoodLogSchema.partial();

export type CreateFoodLogInput = z.infer<typeof createFoodLogSchema>;
export type UpdateFoodLogInput = z.infer<typeof updateFoodLogSchema>;
