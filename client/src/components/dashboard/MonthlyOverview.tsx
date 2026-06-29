import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { MonthlyData } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface MonthlyOverviewProps {
  data: MonthlyData[];
  currency: string;
}

export function MonthlyOverview({ data, currency }: MonthlyOverviewProps) {
  return (
    <Card>
      <CardHeader
        title="Monthly Overview"
        subtitle="Income vs expenses for the last 6 months"
      />
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-dark-600" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value, currency)}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #fff)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
