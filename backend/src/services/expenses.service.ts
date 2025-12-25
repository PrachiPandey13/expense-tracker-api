import { query } from '../db_conn/db';

export type Expense = {
  id: number;
  user_id: number;
  amount: number;
  category: string;
  description: string | null;
  created_at: string;
};

export const createExpense = async (userId: number, amount: number, category: string, description?: string | null): Promise<Expense> => {
  const result = await query(
    `INSERT INTO expenses (user_id, amount, category, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, amount, category, description, created_at`,
    [userId, amount, category, description ?? null]
  );
  return result.rows[0];
};

export const listExpenses = async (userId: number): Promise<Expense[]> => {
  const result = await query(
    `SELECT id, user_id, amount, category, description, created_at
     FROM expenses
     WHERE user_id = $1
     ORDER BY created_at DESC, id DESC`,
    [userId]
  );
  return result.rows;
};

export const updateExpense = async (userId: number, expenseId: number, amount: number, category: string, description?: string | null): Promise<Expense | null> => {
  const result = await query(
    `UPDATE expenses
     SET amount = $1, category = $2, description = $3
     WHERE id = $4 AND user_id = $5
     RETURNING id, user_id, amount, category, description, created_at`,
    [amount, category, description ?? null, expenseId, userId]
  );
  return result.rows[0] ?? null;
};

export const deleteExpense = async (userId: number, expenseId: number): Promise<boolean> => {
  const result = await query(
    `DELETE FROM expenses WHERE id = $1 AND user_id = $2`,
    [expenseId, userId]
  );
  // pg returns rowCount
  // @ts-ignore
  return (result.rowCount ?? 0) > 0;
};

export const summaryByCategory = async (userId: number): Promise<{ category: string; total: string }[]> => {
  const result = await query(
    `SELECT category, COALESCE(SUM(amount), 0)::text AS total
     FROM expenses
     WHERE user_id = $1
     GROUP BY category
     ORDER BY total::numeric DESC`,
    [userId]
  );
  return result.rows;
};

export const topExpenses = async (userId: number, limit: number = 3): Promise<Expense[]> => {
  const result = await query(
    `SELECT id, user_id, amount, category, description, created_at
     FROM expenses
     WHERE user_id = $1
     ORDER BY amount DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};