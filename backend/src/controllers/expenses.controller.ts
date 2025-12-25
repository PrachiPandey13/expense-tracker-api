import { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
import * as expenseService from '../services/expenses.service';

// NOTE: is-auth middleware attaches userId to req as (req as any).userId (same as reference)
const createSchema = z.object({
  amount: z.number().finite(),
  category: z.string().min(1),
  description: z.string().optional().nullable(),
});

const updateSchema = z.object({
  amount: z.number().finite(),
  category: z.string().min(1),
  description: z.string().optional().nullable(),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const postExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = (req as any).userId as number;
    const body = createSchema.parse(req.body);

    const expense = await expenseService.createExpense(
      userId,
      body.amount,
      body.category,
      body.description ?? null
    );

    return res.status(201).json(expense);
  } catch (err) {
    return next(err);
  }
};

export const getExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = (req as any).userId as number;
    const expenses = await expenseService.listExpenses(userId);

    return res.status(200).json(expenses);
  } catch (err) {
    return next(err);
  }
};

export const putExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = (req as any).userId as number;
    const { id } = idSchema.parse(req.params);
    const body = updateSchema.parse(req.body);

    const updated = await expenseService.updateExpense(
      userId,
      id,
      body.amount,
      body.category,
      body.description ?? null
    );

    if (!updated) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = (req as any).userId as number;
    const { id } = idSchema.parse(req.params);

    const ok = await expenseService.deleteExpense(userId, id);
    if (!ok) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

export const getSummaryByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = (req as any).userId as number;
    const rows = await expenseService.summaryByCategory(userId);

    return res.status(200).json(rows);
  } catch (err) {
    return next(err);
  }
};

export const getTopExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = (req as any).userId as number;
    const limit = req.query.limit ? Number(req.query.limit) : 3;

    const rows = await expenseService.topExpenses(
      userId,
      Number.isFinite(limit) && limit > 0 ? limit : 3
    );

    return res.status(200).json(rows);
  } catch (err) {
    return next(err);
  }
};
