'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface ChartData {
  date: string;
  Faturamento: number;
}

export function SalesChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value}`}
        />
        <Tooltip
          contentStyle={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
          }}
          formatter={(value: number) => [
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(value),
            'Faturamento',
          ]}
        />
        <Area
          type="monotone"
          dataKey="Faturamento"
          stroke="#18181b"
          fill="#18181b"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
