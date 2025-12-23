import { Router } from 'express';
import {
  createFoodLog,
  getFoodLogs,
  getFoodLogById,
  updateFoodLog,
  deleteFoodLog,
} from '../controllers/food.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All food log routes require authentication
router.use(authenticate);

router.post('/', createFoodLog);
router.get('/', getFoodLogs);
router.get('/:id', getFoodLogById);
router.put('/:id', updateFoodLog);
router.delete('/:id', deleteFoodLog);

export default router;
