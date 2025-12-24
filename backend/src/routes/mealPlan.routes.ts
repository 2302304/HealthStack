import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
} from '../controllers/mealPlan.controller';

const router = express.Router();

router.use(authenticate);

router.get('/', getMealPlans);
router.get('/:id', getMealPlanById);
router.post('/', createMealPlan);
router.put('/:id', updateMealPlan);
router.delete('/:id', deleteMealPlan);

export default router;
