import { Router } from 'express';
import {
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getTrendAnalytics,
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/monthly', getMonthlyAnalytics);
router.get('/categories', getCategoryAnalytics);
router.get('/trends', getTrendAnalytics);

export default router;
