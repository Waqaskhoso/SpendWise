import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

interface TrendChartProps {
  data: Array<{ date: string; amount: number }>;
  currency: string;
  title?: string;
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-100 dark:border-dark-600 p-3 text-xs">
      <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</p>
      <p className="text-indigo-600 font-bold">{formatCurrency(payload[0].value, currency)}</p>
    </div>
  );
};

export function TrendChart({ data, currency, title = 'Daily Spending Trend' }: TrendChartProps) {
  return (
    <Card>
      <CardHeader title={title} subtitle="Daily expense pattern over time" />
      {data.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center text-2xl">📉</div>
          <p className="text-sm">No trend data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              width={35}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fill="url(#trendGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
