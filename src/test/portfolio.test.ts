import { describe, expect, it } from "vitest";
import { seedPositions } from "../data/seed";
import { calculatePositions, compactINR, portfolioTotals, scenarioValue } from "../lib/portfolio";

describe("portfolio calculations", () => {
  it("reconciles the seeded investment total", () => {
    const metrics = calculatePositions(seedPositions, new Date("2026-06-14"));
    expect(portfolioTotals(metrics).invested).toBe(3_866_394);
    expect(metrics.reduce((sum, p) => sum + p.investment, 0)).toBe(3_866_394);
  });

  it("calculates position pnl and allocation", () => {
    const metrics = calculatePositions(seedPositions, new Date("2026-06-14"));
    expect(metrics[0].pnl).toBeCloseTo(
      (seedPositions[0].currentPrice - seedPositions[0].entryPrice) * seedPositions[0].quantity,
    );
    expect(metrics.reduce((sum, p) => sum + p.allocation, 0)).toBeCloseTo(100);
  });

  it("calculates symmetric scenarios", () => {
    expect(scenarioValue(4_000_000, -10)).toBe(-400_000);
    expect(scenarioValue(4_000_000, 10)).toBe(400_000);
  });

  it("formats Indian compact currency", () => {
    expect(compactINR(3_866_394)).toBe("₹38.66 L");
    expect(compactINR(-125_000)).toBe("-₹1.25 L");
  });
});
