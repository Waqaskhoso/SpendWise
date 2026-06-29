import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { Resend } from 'resend';
import db from '../database/db';
import { generateToken } from '../middleware/auth';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const resend = new Resend(process.env.RESEND_API_KEY);

function formatUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    currency: row.currency,
    theme: row.theme,
    avatar: row.avatar || null,
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

    db.prepare(`INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)`)
      .run(id, email.toLowerCase().trim(), name.trim(), hashed);

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

    if (!user.password) {
      res.status(401).json({ error: 'This account uses Google Sign-In. Please sign in with Google.' });
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

export async function googleAuth(req: Request, res: Response): Promise<void> {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ error: 'Google credential is required' });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;

    if (user) {
      // Link Google ID if not already linked
      if (!user.google_id) {
        db.prepare('UPDATE users SET google_id = ?, avatar = ? WHERE id = ?')
          .run(googleId, picture || null, user.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as any;
      }
    } else {
      // Create new user
      const id = uuidv4();
      db.prepare(`INSERT INTO users (id, email, name, google_id, avatar) VALUES (?, ?, ?, ?, ?)`)
        .run(id, email.toLowerCase(), name || email.split('@')[0], googleId, picture || null);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    }

    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ message: 'If that email exists, a reset code has been sent.' });
      return;
    }

    if (!user.password) {
      res.json({ message: 'If that email exists, a reset code has been sent.' });
      return;
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Invalidate old tokens
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?').run(user.id);

    // Save new token
    db.prepare(`INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`)
      .run(tokenId, user.id, code, expiresAt);

    // Send email
    await resend.emails.send({
      from: 'SpendWise <onboarding@resend.dev>',
      to: email,
      subject: 'Your SpendWise Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #6366f1; font-size: 28px; margin: 0;">SpendWise</h1>
            <p style="color: #64748b; margin: 8px 0 0;">Password Reset</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 32px; text-align: center;">
            <p style="color: #334155; font-size: 16px; margin: 0 0 24px;">Use this code to reset your password. It expires in <strong>15 minutes</strong>.</p>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; letter-spacing: 8px; font-size: 36px; font-weight: bold; color: #6366f1;">
              ${code}
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    res.json({ message: 'If that email exists, a reset code has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400).json({ error: 'Email, code, and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      res.status(400).json({ error: 'Invalid or expired code' });
      return;
    }

    const resetToken = db.prepare(`
      SELECT * FROM password_reset_tokens
      WHERE user_id = ? AND token = ? AND used = 0 AND expires_at > datetime('now')
    `).get(user.id, code) as any;

    if (!resetToken) {
      res.status(400).json({ error: 'Invalid or expired code' });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, user.id);
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(resetToken.id);

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
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

    if (!user.password) {
      res.status(400).json({ error: 'This account uses Google Sign-In and has no password.' });
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
