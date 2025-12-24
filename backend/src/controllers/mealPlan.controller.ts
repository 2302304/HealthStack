import { Request, Response } from 'express';
import { prisma } from '../config/database';
import {
  createMealPlanSchema,
  updateMealPlanSchema,
  getMealPlansQuerySchema,
} from '../validators/mealPlan.validator';

export const getMealPlans = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validatedQuery = getMealPlansQuerySchema.parse(req.query);
    const { startDate, endDate, dietType } = validatedQuery;

    const where: any = { userId };

    if (dietType) {
      where.dietType = dietType;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where,
      include: {
        meals: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return res.json({ mealPlans });
  } catch (error: any) {
    console.error('Error fetching meal plans:', error);
    return res.status(400).json({ error: error.message || 'Failed to fetch meal plans' });
  }
};

export const getMealPlanById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        meals: true,
      },
    });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    return res.json({ mealPlan });
  } catch (error: any) {
    console.error('Error fetching meal plan:', error);
    return res.status(400).json({ error: error.message || 'Failed to fetch meal plan' });
  }
};

export const createMealPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validatedData = createMealPlanSchema.parse(req.body);
    const { meals, ...mealPlanData } = validatedData;

    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId,
        date: new Date(mealPlanData.date),
        dietType: mealPlanData.dietType,
        targetCalories: mealPlanData.targetCalories,
        targetProtein: mealPlanData.targetProtein,
        targetCarbs: mealPlanData.targetCarbs,
        targetFat: mealPlanData.targetFat,
        notes: mealPlanData.notes,
        meals: meals ? {
          create: meals,
        } : undefined,
      },
      include: {
        meals: true,
      },
    });

    return res.status(201).json({
      message: 'Meal plan created successfully',
      mealPlan,
    });
  } catch (error: any) {
    console.error('Error creating meal plan:', error);
    return res.status(400).json({ error: error.message || 'Failed to create meal plan' });
  }
};

export const updateMealPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const existingMealPlan = await prisma.mealPlan.findFirst({
      where: { id, userId },
    });

    if (!existingMealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    const validatedData = updateMealPlanSchema.parse(req.body);
    const { meals, ...mealPlanData } = validatedData;

    // Delete existing meals if new meals are provided
    if (meals) {
      await prisma.meal.deleteMany({
        where: { mealPlanId: id },
      });
    }

    const mealPlan = await prisma.mealPlan.update({
      where: { id },
      data: {
        date: mealPlanData.date ? new Date(mealPlanData.date) : undefined,
        dietType: mealPlanData.dietType,
        targetCalories: mealPlanData.targetCalories,
        targetProtein: mealPlanData.targetProtein,
        targetCarbs: mealPlanData.targetCarbs,
        targetFat: mealPlanData.targetFat,
        notes: mealPlanData.notes,
        meals: meals ? {
          create: meals,
        } : undefined,
      },
      include: {
        meals: true,
      },
    });

    return res.json({
      message: 'Meal plan updated successfully',
      mealPlan,
    });
  } catch (error: any) {
    console.error('Error updating meal plan:', error);
    return res.status(400).json({ error: error.message || 'Failed to update meal plan' });
  }
};

export const deleteMealPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const existingMealPlan = await prisma.mealPlan.findFirst({
      where: { id, userId },
    });

    if (!existingMealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    await prisma.mealPlan.delete({
      where: { id },
    });

    return res.json({ message: 'Meal plan deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting meal plan:', error);
    return res.status(400).json({ error: error.message || 'Failed to delete meal plan' });
  }
};
