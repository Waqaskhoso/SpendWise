import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { CategoryData } from '../../types';
import { getCategoryLabel, getCategoryColor } from '../../utils/categoryUtils';
import { formatCurrency } from '../../utils/formatters';

interface CategoryChartProps {
  data: CategoryData[];
  currency: string;
  title?: string;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill={fill} className="text-base font-bold" style={{ fontSize: 13, fontWeight: 700 }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 11 }}>
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

export function CategoryChart({ data, currency, title = 'Spending by Category' }: CategoryChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const chartData = data
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((d) => ({
      name: getCategoryLabel(d.category),
      value: d.amount,
      color: getCategoryColor(d.category),
      category: d.category,
      count: d.count,
    }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader title={title} subtitle="Where your money goes" />
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center text-2xl">📊</div>
          <p className="text-sm">No spending data yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={title} subtitle="Where your money goes" />
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                onMouseEnter={(_, i) => setActiveIndex(i)}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [formatCurrency(v, currency), 'Amount']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category list */}
        <div className="flex-1 w-full space-y-2">
          {chartData.slice(0, 7).map((item, i) => (
            <div
              key={item.category}
              className="flex items-center gap-3 cursor-pointer group"
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-2 flex-shrink-0">
                    {formatCurrency(item.value, currency)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 w-10 text-right">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
