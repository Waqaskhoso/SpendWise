import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from './db';
import { createSchema } from './schema';

createSchema();

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function randomDate(startMonthsAgo: number, endMonthsAgo: number): string {
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - startMonthsAgo);
  const end = new Date(now);
  end.setMonth(end.getMonth() - endMonthsAgo);
  const diff = end.getTime() - start.getTime();
  const d = new Date(start.getTime() + Math.random() * diff);
  return d.toISOString().split('T')[0];
}

async function seed() {
  // Check if demo user exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@example.com');
  if (existing) {
    console.log('Demo user already exists, skipping seed');
    return;
  }

  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create demo user
  db.prepare(`
    INSERT INTO users (id, email, name, password, currency, theme)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, 'demo@example.com', 'Demo User', hashedPassword, 'USD', 'light');

  console.log('Created demo user: demo@example.com / password123');

  // Seed transactions - 50+ across 6 months
  const transactions = [
    // Month 0 (current)
    { title: 'Monthly Salary', amount: 5000, category: 'salary', type: 'income', date: randomDate(0, 0) },
    { title: 'Grocery Shopping', amount: 145.50, category: 'food', type: 'expense', date: randomDate(0, 0) },
    { title: 'Netflix Subscription', amount: 15.99, category: 'entertainment', type: 'expense', date: randomDate(0, 0) },
    { title: 'Electricity Bill', amount: 85.00, category: 'bills', type: 'expense', date: randomDate(0, 0) },
    { title: 'Restaurant Dinner', amount: 67.30, category: 'food', type: 'expense', date: randomDate(0, 0) },
    { title: 'Uber Ride', amount: 22.50, category: 'transport', type: 'expense', date: randomDate(0, 0) },
    { title: 'Amazon Purchase', amount: 89.99, category: 'shopping', type: 'expense', date: randomDate(0, 0) },
    { title: 'Investment Return', amount: 320.00, category: 'investment', type: 'income', date: randomDate(0, 0) },
    { title: 'Coffee Shop', amount: 12.40, category: 'food', type: 'expense', date: randomDate(0, 0) },

    // Month 1
    { title: 'Monthly Salary', amount: 5000, category: 'salary', type: 'income', date: randomDate(1, 1) },
    { title: 'Supermarket Run', amount: 198.70, category: 'food', type: 'expense', date: randomDate(1, 1) },
    { title: 'Gym Membership', amount: 49.99, category: 'healthcare', type: 'expense', date: randomDate(1, 1) },
    { title: 'Internet Bill', amount: 59.99, category: 'bills', type: 'expense', date: randomDate(1, 1) },
    { title: 'Movie Tickets', amount: 34.00, category: 'entertainment', type: 'expense', date: randomDate(1, 1) },
    { title: 'Gas Station', amount: 55.00, category: 'transport', type: 'expense', date: randomDate(1, 1) },
    { title: 'New Shoes', amount: 120.00, category: 'shopping', type: 'expense', date: randomDate(1, 1) },
    { title: 'Doctor Visit Copay', amount: 25.00, category: 'healthcare', type: 'expense', date: randomDate(1, 1) },
    { title: 'Freelance Work', amount: 750.00, category: 'salary', type: 'income', date: randomDate(1, 1) },
    { title: 'Lunch at Work', amount: 45.00, category: 'food', type: 'expense', date: randomDate(1, 1) },

    // Month 2
    { title: 'Monthly Salary', amount: 5000, category: 'salary', type: 'income', date: randomDate(2, 2) },
    { title: 'Phone Bill', amount: 65.00, category: 'bills', type: 'expense', date: randomDate(2, 2) },
    { title: 'Groceries', amount: 167.20, category: 'food', type: 'expense', date: randomDate(2, 2) },
    { title: 'Spotify', amount: 9.99, category: 'entertainment', type: 'expense', date: randomDate(2, 2) },
    { title: 'Taxi', amount: 18.50, category: 'transport', type: 'expense', date: randomDate(2, 2) },
    { title: 'Online Course', amount: 29.99, category: 'education', type: 'expense', date: randomDate(2, 2) },
    { title: 'Water Bill', amount: 32.00, category: 'bills', type: 'expense', date: randomDate(2, 2) },
    { title: 'Birthday Gift', amount: 75.00, category: 'shopping', type: 'expense', date: randomDate(2, 2) },
    { title: 'Dividend Income', amount: 215.00, category: 'investment', type: 'income', date: randomDate(2, 2) },
    { title: 'Pizza Night', amount: 38.50, category: 'food', type: 'expense', date: randomDate(2, 2) },

    // Month 3
    { title: 'Monthly Salary', amount: 4800, category: 'salary', type: 'income', date: randomDate(3, 3) },
    { title: 'Health Insurance', amount: 180.00, category: 'healthcare', type: 'expense', date: randomDate(3, 3) },
    { title: 'Grocery Store', amount: 212.40, category: 'food', type: 'expense', date: randomDate(3, 3) },
    { title: 'Car Insurance', amount: 95.00, category: 'transport', type: 'expense', date: randomDate(3, 3) },
    { title: 'Clothing Store', amount: 145.00, category: 'shopping', type: 'expense', date: randomDate(3, 3) },
    { title: 'Theater Tickets', amount: 55.00, category: 'entertainment', type: 'expense', date: randomDate(3, 3) },
    { title: 'Heating Bill', amount: 112.00, category: 'bills', type: 'expense', date: randomDate(3, 3) },
    { title: 'Side Project Income', amount: 500.00, category: 'salary', type: 'income', date: randomDate(3, 3) },
    { title: 'Pharmacy', amount: 42.00, category: 'healthcare', type: 'expense', date: randomDate(3, 3) },

    // Month 4
    { title: 'Monthly Salary', amount: 5000, category: 'salary', type: 'income', date: randomDate(4, 4) },
    { title: 'Weekly Groceries', amount: 155.30, category: 'food', type: 'expense', date: randomDate(4, 4) },
    { title: 'Bus Pass', amount: 35.00, category: 'transport', type: 'expense', date: randomDate(4, 4) },
    { title: 'Amazon Prime', amount: 14.99, category: 'entertainment', type: 'expense', date: randomDate(4, 4) },
    { title: 'Rent', amount: 1200.00, category: 'bills', type: 'expense', date: randomDate(4, 4) },
    { title: 'Books', amount: 52.00, category: 'education', type: 'expense', date: randomDate(4, 4) },
    { title: 'Investment Gain', amount: 480.00, category: 'investment', type: 'income', date: randomDate(4, 4) },
    { title: 'Tech Gadget', amount: 299.00, category: 'shopping', type: 'expense', date: randomDate(4, 4) },
    { title: 'Coffee & Snacks', amount: 28.70, category: 'food', type: 'expense', date: randomDate(4, 4) },

    // Month 5
    { title: 'Monthly Salary', amount: 5000, category: 'salary', type: 'income', date: randomDate(5, 5) },
    { title: 'Grocery Shopping', amount: 189.60, category: 'food', type: 'expense', date: randomDate(5, 5) },
    { title: 'Dental Checkup', amount: 120.00, category: 'healthcare', type: 'expense', date: randomDate(5, 5) },
    { title: 'Annual Car Service', amount: 280.00, category: 'transport', type: 'expense', date: randomDate(5, 5) },
    { title: 'Home Supplies', amount: 95.40, category: 'shopping', type: 'expense', date: randomDate(5, 5) },
    { title: 'Concert Ticket', amount: 85.00, category: 'entertainment', type: 'expense', date: randomDate(5, 5) },
    { title: 'Utilities', amount: 140.00, category: 'bills', type: 'expense', date: randomDate(5, 5) },
    { title: 'Bonus Payment', amount: 1000.00, category: 'salary', type: 'income', date: randomDate(5, 5) },
    { title: 'Online Shopping', amount: 67.50, category: 'shopping', type: 'expense', date: randomDate(5, 5) },
  ];

  const insertTx = db.prepare(`
    INSERT INTO transactions (id, user_id, title, amount, category, type, date, currency, is_recurring)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  db.exec('BEGIN');
  for (const tx of transactions) {
    insertTx.run(uuidv4(), userId, tx.title, tx.amount, tx.category, tx.type, tx.date, 'USD');
  }
  db.exec('COMMIT');
  console.log(`Inserted ${transactions.length} transactions`);

  // Seed budgets for current month
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const budgets = [
    { category: 'food', limit: 400 },
    { category: 'transport', limit: 150 },
    { category: 'shopping', limit: 300 },
    { category: 'bills', limit: 500 },
    { category: 'entertainment', limit: 100 },
    { category: 'healthcare', limit: 200 },
  ];

  const insertBudget = db.prepare(`
    INSERT OR IGNORE INTO budgets (id, user_id, category, "limit", month, year)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const b of budgets) {
    insertBudget.run(uuidv4(), userId, b.category, b.limit, month, year);
  }

  console.log(`Inserted ${budgets.length} budgets`);

  // Seed goals
  const goals = [
    {
      title: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 6500,
      deadline: new Date(year, 11, 31).toISOString().split('T')[0],
      category: 'other',
      color: '#6366f1',
    },
    {
      title: 'New Laptop',
      targetAmount: 2000,
      currentAmount: 800,
      deadline: new Date(year, now.getMonth() + 3, 1).toISOString().split('T')[0],
      category: 'shopping',
      color: '#3b82f6',
    },
    {
      title: 'Vacation Fund',
      targetAmount: 3000,
      currentAmount: 1200,
      deadline: new Date(year + 1, 5, 1).toISOString().split('T')[0],
      category: 'entertainment',
      color: '#f97316',
    },
    {
      title: 'Investment Portfolio',
      targetAmount: 50000,
      currentAmount: 12000,
      deadline: new Date(year + 3, 0, 1).toISOString().split('T')[0],
      category: 'investment',
      color: '#22c55e',
    },
  ];

  const insertGoal = db.prepare(`
    INSERT INTO goals (id, user_id, title, target_amount, current_amount, deadline, category, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const g of goals) {
    insertGoal.run(uuidv4(), userId, g.title, g.targetAmount, g.currentAmount, g.deadline, g.category, g.color);
  }

  console.log(`Inserted ${goals.length} goals`);
  console.log('\nSeed complete!');
  console.log('Login with: demo@example.com / password123');
}

seed().catch(console.error);
