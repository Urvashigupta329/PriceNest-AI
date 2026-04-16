import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type TrendPoint = { date: string; price: number };

function formatINR(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  }
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const chartData = data.map((p) => ({
    ...p,
    monthLabel: new Date(p.date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short"
    })
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="font-semibold text-slate-900 mb-2">Price Trend</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="monthLabel" />
            <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} />
            <Tooltip
              formatter={(value: any) => formatINR(Number(value))}
              labelFormatter={(label) => label}
            />
            <Line type="monotone" dataKey="price" stroke="#0f172a" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

