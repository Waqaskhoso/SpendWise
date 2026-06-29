import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactions,
} from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/export', exportTransactions);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
