# Expense Tracker App

A full-stack expense tracking application built with React, TypeScript, Node.js, and SQLite.

## Features

- **Dashboard** - Overview with stat cards, monthly charts, category pie chart, and recent transactions
- **Transactions** - Full CRUD with search, filters, pagination, and CSV export
- **Analytics** - Monthly trends, category breakdown, and spending trend charts
- **Budget** - Set and track monthly budgets per category with progress bars
- **Goals** - Financial goals with progress tracking
- **Settings** - Profile management, theme toggle, data export
- **Dark Mode** - Full dark/light theme support
- **PWA** - Progressive Web App support
- **Auth** - JWT-based authentication

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS (styling)
- Recharts (charts)
- Zustand (state management)
- React Router v6
- Axios

### Backend
- Node.js + Express + TypeScript
- SQLite (better-sqlite3)
- JWT authentication
- bcryptjs (password hashing)

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Seed the database with demo data

```bash
cd server
npx ts-node src/database/seed.ts
```

This creates a demo user: `demo@example.com` / `password123` with 50+ sample transactions.

### 3. Start the server

```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

### 4. Start the client

```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

### 5. Open your browser

Navigate to `http://localhost:5173` and log in with:
- Email: `demo@example.com`
- Password: `password123`

## Docker (Production)

```bash
# Build and run with Docker Compose
docker-compose up --build

# App will be available at http://localhost
# API at http://localhost:3001
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `PUT /api/auth/profile` - Update profile (auth required)
- `PUT /api/auth/password` - Change password (auth required)

### Transactions
- `GET /api/transactions` - List transactions (supports search, category, type, date filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/export` - Export as CSV

### Budgets
- `GET /api/budgets?month=&year=` - Get budgets with spent amounts
- `POST /api/budgets` - Create/update budget
- `PUT /api/budgets/:id` - Update budget limit
- `DELETE /api/budgets/:id` - Delete budget

### Goals
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Analytics
- `GET /api/analytics/monthly` - Monthly income/expense for last 6 months
- `GET /api/analytics/categories` - Spending by category
- `GET /api/analytics/trends` - Daily spending for last 30 days

## Project Structure

```
expense-tracker/
├── client/          # React frontend
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── hooks/       # Custom React hooks
│       ├── services/    # API service functions
│       ├── store/       # Zustand state stores
│       ├── types/       # TypeScript types
│       └── utils/       # Utility functions
├── server/          # Express backend
│   └── src/
│       ├── controllers/ # Route handlers
│       ├── database/    # DB setup, schema, seed
│       ├── middleware/  # Auth, error handling
│       ├── routes/      # Express routes
│       └── types/       # TypeScript types
├── docker-compose.yml
├── Dockerfile.client
├── Dockerfile.server
└── nginx.conf
```

## Environment Variables

### Server
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `JWT_SECRET` | (insecure default) | JWT signing secret — **change in production** |
| `NODE_ENV` | `development` | Environment |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

## License

MIT
