import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { MonthlyOverview } from '../components/dashboard/MonthlyOverview';
import { CategoryChart } from '../components/analytics/CategoryChart';
import { PageLoader } from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Transaction, MonthlyData, CategoryData } from '../types';

export function Dashboard() {
  const { user } = useAuthStore();
  const { currency } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/transactions?limit=5&page=1'),
      api.get('/analytics/monthly'),
      api.get('/analytics/categories'),
    ])
      .then(([txRes, monthRes, catRes]) => {
        setTransactions(txRes.data.data || []);
        setMonthlyData(monthRes.data || []);
        setCategoryData(catRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  // Compute from monthly data for better stats
  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const balance = totalIncome - totalExpenses;
  const savings = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here's what's happening with your finances
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          amount={balance}
          currency={currency}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Total Income"
          amount={totalIncome}
          currency={currency}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Expenses"
          amount={totalExpenses}
          currency={currency}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Savings Rate"
          amount={savings}
          currency="%"
          icon={PiggyBank}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MonthlyOverview data={monthlyData} currency={currency} />
        <CategoryChart
          data={categoryData.filter((d) => d.amount > 0)}
          currency={currency}
          title="Expense Breakdown"
        />
      </div>

      {/* Recent transactions */}
      <RecentTransactions transactions={transactions} currency={currency} />
    </div>
  );
}
