import { useMemo } from "react";
import { ContributionChart, PerformanceChart } from "../components/Charts";
import { MetricCard, PageHeader } from "../components/Common";
import { calculatePositions, compactINR, makePerformanceSeries, portfolioTotals } from "../lib/portfolio";
import { usePortfolioStore } from "../store";

export function Analytics() {
  const positions = usePortfolioStore((s) => s.positions);
  const metrics = useMemo(() => calculatePositions(positions), [positions]);
  const totals = portfolioTotals(metrics);
  const best = [...metrics].sort((a, b) => b.pnlPct - a.pnlPct)[0];
  const worst = [...metrics].sort((a, b) => a.pnlPct - b.pnlPct)[0];
  return (
    <>
      <PageHeader eyebrow="Performance studio" title="Understand what moved the ledger." copy="Contribution, attribution and portfolio movement shown without directional recommendations." />
      <section className="metric-grid four">
        <MetricCard label="Return since entry" value={`${totals.pnlPct.toFixed(2)}%`} tone={totals.pnl >= 0 ? "positive" : "negative"} />
        <MetricCard label="Best performer" value={best?.symbol ?? "—"} delta={best ? `${best.pnlPct.toFixed(2)}% return` : undefined} tone="positive" />
        <MetricCard label="Weakest performer" value={worst?.symbol ?? "—"} delta={worst ? `${worst.pnlPct.toFixed(2)}% return` : undefined} tone="negative" />
        <MetricCard label="Average position" value={compactINR(totals.invested / Math.max(metrics.length, 1))} />
      </section>
      <section className="dashboard-grid">
        <article className="panel"><div className="panel-head"><div><span className="eyebrow">Portfolio curve</span><h2>Capital versus current value</h2></div></div><PerformanceChart data={makePerformanceSeries(totals.invested, totals.currentValue)} /></article>
        <article className="panel"><div className="panel-head"><div><span className="eyebrow">Contribution</span><h2>Position-level P&L</h2></div></div><ContributionChart positions={metrics} /></article>
      </section>
      <article className="panel table-panel">
        <div className="panel-head"><div><span className="eyebrow">Full attribution</span><h2>Performance ledger</h2></div></div>
        <div className="table-scroll"><table><thead><tr><th>Position</th><th>Sector</th><th>Invested</th><th>Current</th><th>Day P&L</th><th>Total P&L</th><th>Return</th></tr></thead><tbody>{metrics.map((p) => <tr key={p.id}><td><strong>{p.symbol}</strong><small>{p.name}</small></td><td>{p.sector}</td><td>{compactINR(p.investment)}</td><td>{compactINR(p.currentValue)}</td><td className={p.dayPnl >= 0 ? "positive" : "negative"}>{compactINR(p.dayPnl)}</td><td className={p.pnl >= 0 ? "positive" : "negative"}>{compactINR(p.pnl)}</td><td>{p.pnlPct.toFixed(2)}%</td></tr>)}</tbody></table></div>
      </article>
    </>
  );
}
