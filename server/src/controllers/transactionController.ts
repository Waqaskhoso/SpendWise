import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';

function formatTransaction(row: any) {
  return {
    id: row.id,
    title: row.title,
    amount: row.amount,
    category: row.category,
    type: row.type,
    date: row.date,
    notes: row.notes || undefined,
    tags: row.tags ? JSON.parse(row.tags) : [],
    isRecurring: Boolean(row.is_recurring),
    recurringInterval: row.recurring_interval || undefined,
    currency: row.currency,
    createdAt: row.created_at,
  };
}

export function getTransactions(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { search, category, type, startDate, endDate, page = '1', limit = '20' } = req.query;

  let query = 'WHERE user_id = ?';
  const params: any[] = [userId];

  if (search) {
    query += ' AND (title LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const offset = (pageNum - 1) * limitNum;

  const total = (db.prepare(`SELECT COUNT(*) as count FROM transactions ${query}`).get(...params) as any).count;
  const rows = db.prepare(`SELECT * FROM transactions ${query} ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

  res.json({
    data: rows.map(formatTransaction),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
}

export function createTransaction(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { title, amount, category, type, date, notes, tags, isRecurring, recurringInterval, currency } = req.body;

  if (!title || !amount || !category || !type || !date) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO transactions (id, user_id, title, amount, category, type, date, notes, tags, is_recurring, recurring_interval, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, userId, title, amount, category, type, date,
    notes || null,
    tags && tags.length > 0 ? JSON.stringify(tags) : null,
    isRecurring ? 1 : 0,
    recurringInterval || null,
    currency || 'USD'
  );

  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  res.status(201).json(formatTransaction(row as any));
}

export function updateTransaction(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }

  const { title, amount, category, type, date, notes, tags, isRecurring, recurringInterval, currency } = req.body;

  db.prepare(`
    UPDATE transactions SET
      title = COALESCE(?, title),
      amount = COALESCE(?, amount),
      category = COALESCE(?, category),
      type = COALESCE(?, type),
      date = COALESCE(?, date),
      notes = ?,
      tags = ?,
      is_recurring = COALESCE(?, is_recurring),
      recurring_interval = ?,
      currency = COALESCE(?, currency)
    WHERE id = ? AND user_id = ?
  `).run(
    title || null, amount || null, category || null, type || null, date || null,
    notes !== undefined ? notes : (existing as any).notes,
    tags !== undefined ? (tags.length > 0 ? JSON.stringify(tags) : null) : (existing as any).tags,
    isRecurring !== undefined ? (isRecurring ? 1 : 0) : null,
    recurringInterval !== undefined ? recurringInterval : (existing as any).recurring_interval,
    currency || null,
    id, userId
  );

  const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  res.json(formatTransaction(updated as any));
}

export function deleteTransaction(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = db.prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }

  db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, userId);
  res.status(204).send();
}

export function exportTransactions(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const rows = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC').all(userId);

  const headers = 'Date,Title,Category,Type,Amount,Currency,Notes,Tags\n';
  const csvRows = rows.map((row: any) => {
    const tags = row.tags ? JSON.parse(row.tags).join(';') : '';
    return `${row.date},"${row.title}",${row.category},${row.type},${row.amount},${row.currency},"${row.notes || ''}","${tags}"`;
  });

  const csv = headers + csvRows.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  res.send(csv);
}
