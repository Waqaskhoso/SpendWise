import React, { useEffect, useState } from 'react';
import { MonthlyChart } from '../components/analytics/MonthlyChart';
import { CategoryChart } from '../components/analytics/CategoryChart';
import { TrendChart } from '../components/analytics/TrendChart';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Card, CardHeader } from '../components/ui/Card';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';
import { MonthlyData, CategoryData } from '../types';
import { getCategoryColor, getCategoryLabel } from '../utils/categoryUtils';
import { formatCurrency } from '../utils/formatters';
import { TrendingDown, TrendingUp, Zap, Award } from 'lucide-react';

export function Analytics() {
  const { currency } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [trends, setTrends] = useState<Array<{ date: string; amount: number }>>([]);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/monthly'),
      api.get('/analytics/categories'),
      api.get('/analytics/trends'),
    ])
      .then(([m, c, t]) => {
        setMonthly(m.data || []);
        setCategories(c.data || []);
        setTrends(t.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const expenseCategories = categories
    .filter((c) => ['food', 'transport', 'shopping', 'bills', 'entertainment', 'healthcare', 'education', 'other'].includes(c.category))
    .sort((a, b) => b.amount - a.amount);

  const totalExpenses = expenseCategories.reduce((s, c) => s + c.amount, 0);
  const totalIncome = categories
    .filter((c) => ['salary', 'investment'].includes(c.category))
    .reduce((s, c) => s + c.amount, 0);

  const topCategory = expenseCategories[0];
  const avgMonthlyExpense = monthly.length > 0
    ? monthly.reduce((s, m) => s + m.expenses, 0) / monthly.length
    : 0;
  const lastMonth = monthly[monthly.length - 1];
  const prevMonth = monthly[monthly.length - 2];
  const spendingChange = prevMonth && lastMonth
    ? ((lastMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100
    : 0;

  return (
    <div className="space-y-6">

      {/* Insight cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-indigo-100">Total Spent</p>
            <TrendingDown className="h-4 w-4 text-indigo-200" />
          </div>
          <p className="text-xl font-bold">{formatCurrency(totalExpenses, currency)}</p>
          <p className="text-xs text-indigo-200 mt-1">All time expenses</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-emerald-100">Total Earned</p>
            <TrendingUp className="h-4 w-4 text-emerald-200" />
          </div>
          <p className="text-xl font-bold">{formatCurrency(totalIncome, currency)}</p>
          <p className="text-xs text-emerald-200 mt-1">All time income</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-4 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-orange-100">Avg / Month</p>
            <Zap className="h-4 w-4 text-orange-200" />
          </div>
          <p className="text-xl font-bold">{formatCurrency(avgMonthlyExpense, currency)}</p>
          <p className={`text-xs mt-1 ${spendingChange > 0 ? 'text-rose-200' : 'text-emerald-200'}`}>
            {spendingChange > 0 ? '↑' : '↓'} {Math.abs(spendingChange).toFixed(1)}% vs last month
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-4 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-blue-100">Top Category</p>
            <Award className="h-4 w-4 text-blue-200" />
          </div>
          <p className="text-xl font-bold truncate">
            {topCategory ? getCategoryLabel(topCategory.category) : 'None'}
          </p>
          <p className="text-xs text-blue-200 mt-1">
            {topCategory ? formatCurrency(topCategory.amount, currency) : 'No data'}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MonthlyChart data={monthly} currency={currency} />
        <CategoryChart data={expenseCategories} currency={currency} title="Expense Breakdown" />
      </div>

      {/* Spending by category — detailed bars */}
      <Card>
        <CardHeader title="Category Breakdown" subtitle="Detailed spending per category" />
        {expenseCategories.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">No expense data yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {expenseCategories.map((cat) => {
              const pct = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
              const color = getCategoryColor(cat.category);
              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {getCategoryLabel(cat.category)}
                      </span>
                      <span className="text-xs text-slate-400">({cat.count} txns)</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                  </div>
                  <div className="relative h-2 w-full bg-slate-100 dark:bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-right">{pct.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Trend chart */}
      <TrendChart data={trends} currency={currency} title="Daily Spending Trend" />
    </div>
  );
}
