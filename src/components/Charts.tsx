import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PositionMetrics } from "../types";
import { compactINR } from "../lib/portfolio";

const COLORS = ["#174f95", "#d81e45", "#aa7a27", "#2d6b57"];

export function PerformanceChart({ data }: { data: Array<Record<string, unknown>> }) {
  return (
    <ResponsiveContainer width="100%" height={270}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#174f95" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#174f95" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e6e0d3" strokeDasharray="3 5" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#7f7a70", fontSize: 11 }} />
        <YAxis hide domain={["dataMin - 30000", "dataMax + 30000"]} />
        <Tooltip formatter={(value) => compactINR(Number(value))} contentStyle={{ borderRadius: 8, border: "1px solid #ddd5c7" }} />
        <Area type="monotone" dataKey="portfolio" stroke="#174f95" strokeWidth={2.5} fill="url(#portfolioFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AllocationChart({ positions }: { positions: PositionMetrics[] }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie data={positions} dataKey="investment" nameKey="symbol" innerRadius={58} outerRadius={82} paddingAngle={2}>
          {positions.map((position, index) => <Cell key={position.id} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(value) => compactINR(Number(value))} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ContributionChart({ positions }: { positions: PositionMetrics[] }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={positions} layout="vertical" margin={{ left: 4, right: 14 }}>
        <CartesianGrid horizontal={false} stroke="#e6e0d3" />
        <XAxis type="number" hide />
        <YAxis dataKey="symbol" type="category" tickLine={false} axisLine={false} width={82} tick={{ fill: "#34322e", fontSize: 12, fontWeight: 700 }} />
        <Tooltip formatter={(value) => compactINR(Number(value))} />
        <Bar dataKey="pnl" radius={[0, 5, 5, 0]}>
          {positions.map((p) => <Cell key={p.id} fill={p.pnl >= 0 ? "#2d6b57" : "#c83f4f"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Sparkline({ positive, seed }: { positive: boolean; seed: number }) {
  const values = Array.from({ length: 12 }, (_, index) => ({
    x: index,
    y: 45 + Math.sin((index + seed) * 0.9) * 8 + index * (positive ? 1.4 : -0.8),
  }));
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={values}>
        <Area type="monotone" dataKey="y" stroke={positive ? "#2d6b57" : "#c83f4f"} fill="transparent" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
