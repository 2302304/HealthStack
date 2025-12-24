import { Router } from 'express';
import {
  createMoodLog,
  getMoodLogs,
  getMoodLogById,
  updateMoodLog,
  deleteMoodLog,
} from '../controllers/mood.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createMoodLog);
router.get('/', getMoodLogs);
router.get('/:id', getMoodLogById);
router.put('/:id', updateMoodLog);
router.delete('/:id', deleteMoodLog);

export default router;
