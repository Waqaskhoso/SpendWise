import { Request, Response } from 'express';
import db from '../database/db';

export function getMonthlyAnalytics(req: Request, res: Response): void {
  const userId = req.user!.userId;

  const result = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthStr = String(month).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    const label = date.toLocaleString('default', { month: 'short' }) + ' ' + String(year).slice(2);

    const income = (db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ? AND type = 'income' AND date LIKE ?
    `).get(userId, `${prefix}%`) as any).total;

    const expenses = (db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ? AND type = 'expense' AND date LIKE ?
    `).get(userId, `${prefix}%`) as any).total;

    result.push({ month: label, income, expenses });
  }

  res.json(result);
}

export function getCategoryAnalytics(req: Request, res: Response): void {
  const userId = req.user!.userId;

  const rows = db.prepare(`
    SELECT category, SUM(amount) as amount, COUNT(*) as count
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
    GROUP BY category
    ORDER BY amount DESC
  `).all(userId) as any[];

  res.json(rows.map((r) => ({
    category: r.category,
    amount: r.amount,
    count: r.count,
  })));
}

export function getTrendAnalytics(req: Request, res: Response): void {
  const userId = req.user!.userId;

  // Last 30 days daily totals
  const rows = db.prepare(`
    SELECT date, SUM(amount) as amount
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
      AND date >= date('now', '-30 days')
    GROUP BY date
    ORDER BY date ASC
  `).all(userId) as any[];

  // Fill in missing dates with 0
  const result: Array<{ date: string; amount: number }> = [];
  const map = new Map(rows.map((r) => [r.date, r.amount]));

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: d.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      amount: map.get(dateStr) || 0,
    });
  }

  res.json(result);
}
