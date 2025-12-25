import express from 'express';
import * as expensesController from '../controllers/expenses.controller';
import isAuth from '../middleware/is-auth';

const router = express.Router();

// /expenses (all protected)
router.post('/', isAuth, expensesController.postExpense);
router.get('/', isAuth, expensesController.getExpenses);
router.put('/:id', isAuth, expensesController.putExpense);
router.delete('/:id', isAuth, expensesController.deleteExpense);

router.get('/summary/categories', isAuth, expensesController.getSummaryByCategory);
router.get('/summary/top', isAuth, expensesController.getTopExpenses);

export default router;