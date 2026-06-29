import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { MonthlyData } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface MonthlyChartProps {
  data: MonthlyData[];
  currency: string;
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (!active || !payload?.length) return null;
  const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
  const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
  const savings = income - expenses;

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-100 dark:border-dark-600 p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Income</span>
          <span className="font-medium text-emerald-600">{formatCurrency(income, currency)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Expenses</span>
          <span className="font-medium text-rose-600">{formatCurrency(expenses, currency)}</span>
        </div>
        <div className="border-t border-slate-100 dark:border-dark-600 pt-1.5 flex justify-between gap-4">
          <span className="text-slate-500">Saved</span>
          <span className={`font-semibold ${savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(savings, currency)}</span>
        </div>
      </div>
    </div>
  );
};

export function MonthlyChart({ data, currency }: MonthlyChartProps) {
  return (
    <Card>
      <CardHeader title="Monthly Overview" subtitle="Income vs expenses per month" />
      {data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center text-2xl">📈</div>
          <p className="text-sm">No monthly data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                <stop offset="100%" stopColor="#fb7185" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              width={40}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(99,102,241,0.05)', radius: 8 }} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
              formatter={(value) => <span style={{ color: '#94a3b8', fontWeight: 500 }}>{value}</span>}
            />
            <Bar dataKey="income" fill="url(#incomeGrad)" name="Income" radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expenses" fill="url(#expenseGrad)" name="Expenses" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
