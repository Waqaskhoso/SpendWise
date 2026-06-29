import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from '../database/db';
import { generateToken } from '../middleware/auth';

function formatUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    currency: row.currency,
    theme: row.theme,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);

    db.prepare(`
      INSERT INTO users (id, email, name, password)
      VALUES (?, ?, ?, ?)
    `).run(id, email.toLowerCase().trim(), name.trim(), hashed);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { name, email, currency, theme } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (email && email !== user.email) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
      if (existing) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
    }

    db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        currency = COALESCE(?, currency),
        theme = COALESCE(?, theme)
      WHERE id = ?
    `).run(name || null, email || null, currency || null, theme || null, userId);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    res.json(formatUser(updated as any));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, userId);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change password' });
  }
}
