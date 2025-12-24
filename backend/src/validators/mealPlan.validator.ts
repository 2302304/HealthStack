import { z } from 'zod';

export const createMealPlanSchema = z.object({
  date: z.string().datetime(),
  dietType: z.enum(['KETO', 'PALEO', 'VEGAN', 'VEGETARIAN', 'MEDITERRANEAN', 'BALANCED']).optional(),
  targetCalories: z.number().positive().optional(),
  targetProtein: z.number().positive().optional(),
  targetCarbs: z.number().positive().optional(),
  targetFat: z.number().positive().optional(),
  notes: z.string().optional(),
  meals: z.array(z.object({
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
    name: z.string().min(1),
    description: z.string().optional(),
    calories: z.number().positive().optional(),
    protein: z.number().positive().optional(),
    carbs: z.number().positive().optional(),
    fat: z.number().positive().optional(),
  })).optional(),
});

export const updateMealPlanSchema = createMealPlanSchema.partial();

export const getMealPlansQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dietType: z.enum(['KETO', 'PALEO', 'VEGAN', 'VEGETARIAN', 'MEDITERRANEAN', 'BALANCED']).optional(),
});

export type CreateMealPlanInput = z.infer<typeof createMealPlanSchema>;
export type UpdateMealPlanInput = z.infer<typeof updateMealPlanSchema>;
export type GetMealPlansQuery = z.infer<typeof getMealPlansQuerySchema>;
