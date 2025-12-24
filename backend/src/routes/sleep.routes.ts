import { Router } from 'express';
import {
  createSleepLog,
  getSleepLogs,
  getSleepLogById,
  updateSleepLog,
  deleteSleepLog,
} from '../controllers/sleep.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createSleepLog);
router.get('/', getSleepLogs);
router.get('/:id', getSleepLogById);
router.put('/:id', updateSleepLog);
router.delete('/:id', deleteSleepLog);

export default router;
