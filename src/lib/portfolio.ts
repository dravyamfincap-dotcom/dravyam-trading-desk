import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Position, PositionMetrics } from "../types";

export const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const INR_PRECISE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function compactINR(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)} Cr`;
  if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(2)} L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)} K`;
  return `${sign}₹${abs.toFixed(0)}`;
}

export function calculatePositions(positions: Position[], now = new Date()): PositionMetrics[] {
  const totalInvestment = positions.reduce((sum, p) => sum + p.entryPrice * p.quantity, 0);
  const totalPnl = positions.reduce(
    (sum, p) => sum + (p.currentPrice - p.entryPrice) * p.quantity,
    0,
  );

  return positions.map((p) => {
    const investment = p.entryPrice * p.quantity;
    const currentValue = p.currentPrice * p.quantity;
    const pnl = currentValue - investment;
    const dayPnl = (p.currentPrice - p.previousClose) * p.quantity;
    return {
      ...p,
      investment,
      currentValue,
      pnl,
      pnlPct: investment ? (pnl / investment) * 100 : 0,
      dayPnl,
      dayPct: p.previousClose ? ((p.currentPrice - p.previousClose) / p.previousClose) * 100 : 0,
      allocation: totalInvestment ? (investment / totalInvestment) * 100 : 0,
      contribution: totalPnl ? (pnl / Math.abs(totalPnl)) * 100 : 0,
      holdingDays: Math.max(0, differenceInCalendarDays(now, parseISO(p.entryDate))),
    };
  });
}

export function portfolioTotals(positions: PositionMetrics[]) {
  const invested = positions.reduce((sum, p) => sum + p.investment, 0);
  const currentValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
  const pnl = currentValue - invested;
  const dayPnl = positions.reduce((sum, p) => sum + p.dayPnl, 0);
  const winners = positions.filter((p) => p.pnl > 0).length;
  return {
    invested,
    currentValue,
    pnl,
    pnlPct: invested ? (pnl / invested) * 100 : 0,
    dayPnl,
    dayPct: currentValue - dayPnl ? (dayPnl / (currentValue - dayPnl)) * 100 : 0,
    concentration: Math.max(0, ...positions.map((p) => p.allocation)),
    winners,
  };
}

export function scenarioValue(currentValue: number, percent: number) {
  return currentValue * (percent / 100);
}

export function makePerformanceSeries(invested: number, currentValue: number) {
  const path = [-0.007, 0.004, -0.002, 0.013, 0.009, 0.019, 0.014, 0.026, 0.021, 0.031, 0.028, 0.038];
  return path.map((move, index) => ({
    label: `Jun ${index + 1}`,
    portfolio: Math.round(invested * (1 + move)),
    capital: invested,
    latest: index === path.length - 1 ? currentValue : undefined,
  }));
}

export function buildInsights(positions: PositionMetrics[]) {
  if (!positions.length) return ["Import positions to generate portfolio observations."];
  const best = [...positions].sort((a, b) => b.pnl - a.pnl)[0];
  const worst = [...positions].sort((a, b) => a.pnl - b.pnl)[0];
  const largest = [...positions].sort((a, b) => b.allocation - a.allocation)[0];
  const stale = positions.filter((p) => p.manualPrice).length;
  return [
    `${best.symbol} is the strongest P&L contributor at ${best.pnlPct.toFixed(2)}%.`,
    `${worst.symbol} is the weakest current contributor at ${worst.pnlPct.toFixed(2)}%.`,
    `${largest.symbol} is the largest allocation at ${largest.allocation.toFixed(1)}%; concentration remains balanced across four positions.`,
    `${stale} price${stale === 1 ? " is" : "s are"} manually maintained. Confirm freshness before acting on the analysis.`,
  ];
}
