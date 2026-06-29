import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';

function getBudgetsWithSpent(userId: string, month: number, year: number) {
  const budgets = db.prepare(
    'SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?'
  ).all(userId, month, year) as any[];

  const monthStr = String(month).padStart(2, '0');
  const datePrefix = `${year}-${monthStr}`;

  return budgets.map((b) => {
    const result = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as spent
      FROM transactions
      WHERE user_id = ? AND category = ? AND type = 'expense'
        AND date LIKE ?
    `).get(userId, b.category, `${datePrefix}%`) as any;

    return {
      id: b.id,
      category: b.category,
      limit: b.limit,
      spent: result.spent,
      month: b.month,
      year: b.year,
    };
  });
}

export function getBudgets(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const now = new Date();
  const month = parseInt(req.query.month as string, 10) || (now.getMonth() + 1);
  const year = parseInt(req.query.year as string, 10) || now.getFullYear();

  const budgets = getBudgetsWithSpent(userId, month, year);
  res.json(budgets);
}

export function createBudget(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { category, limit, month, year } = req.body;

  if (!category || !limit || !month || !year) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const existing = db.prepare(
    'SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month = ? AND year = ?'
  ).get(userId, category, month, year);

  if (existing) {
    // Update instead of creating duplicate
    db.prepare('UPDATE budgets SET "limit" = ? WHERE user_id = ? AND category = ? AND month = ? AND year = ?')
      .run(limit, userId, category, month, year);
    const budgets = getBudgetsWithSpent(userId, month, year);
    const updated = budgets.find((b) => b.category === category);
    res.json(updated);
    return;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO budgets (id, user_id, category, "limit", month, year)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, category, limit, month, year);

  const budgets = getBudgetsWithSpent(userId, month, year);
  const created = budgets.find((b) => b.id === id);
  res.status(201).json(created);
}

export function updateBudget(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { limit } = req.body;

  const existing = db.prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!existing) {
    res.status(404).json({ error: 'Budget not found' });
    return;
  }

  db.prepare('UPDATE budgets SET "limit" = ? WHERE id = ? AND user_id = ?').run(limit, id, userId);

  const budgets = getBudgetsWithSpent(userId, existing.month, existing.year);
  const updated = budgets.find((b) => b.id === id);
  res.json(updated);
}

export function deleteBudget(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = db.prepare('SELECT id FROM budgets WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) {
    res.status(404).json({ error: 'Budget not found' });
    return;
  }

  db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').run(id, userId);
  res.status(204).send();
}
