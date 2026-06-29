import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';

function formatGoal(row: any) {
  return {
    id: row.id,
    title: row.title,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    deadline: row.deadline,
    category: row.category,
    color: row.color,
    createdAt: row.created_at,
  };
}

export function getGoals(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const rows = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  res.json(rows.map(formatGoal));
}

export function createGoal(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { title, targetAmount, currentAmount, deadline, category, color } = req.body;

  if (!title || !targetAmount || !deadline || !category) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO goals (id, user_id, title, target_amount, current_amount, deadline, category, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, targetAmount, currentAmount || 0, deadline, category, color || '#6366f1');

  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  res.status(201).json(formatGoal(row));
}

export function updateGoal(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  const { title, targetAmount, currentAmount, deadline, category, color } = req.body;

  db.prepare(`
    UPDATE goals SET
      title = COALESCE(?, title),
      target_amount = COALESCE(?, target_amount),
      current_amount = COALESCE(?, current_amount),
      deadline = COALESCE(?, deadline),
      category = COALESCE(?, category),
      color = COALESCE(?, color)
    WHERE id = ? AND user_id = ?
  `).run(
    title || null, targetAmount || null, currentAmount !== undefined ? currentAmount : null,
    deadline || null, category || null, color || null,
    id, userId
  );

  const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  res.json(formatGoal(updated as any));
}

export function deleteGoal(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = db.prepare('SELECT id FROM goals WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(id, userId);
  res.status(204).send();
}
