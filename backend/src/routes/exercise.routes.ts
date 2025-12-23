import { Router } from 'express';
import {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
} from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createExercise);
router.get('/', getExercises);
router.get('/:id', getExerciseById);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);

export default router;
