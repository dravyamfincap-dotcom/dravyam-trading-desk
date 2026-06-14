import { useMemo, useState } from "react";
import { MetricCard, PageHeader } from "../components/Common";
import { calculatePositions, compactINR, portfolioTotals, scenarioValue } from "../lib/portfolio";
import { usePortfolioStore } from "../store";

export function Risk() {
  const positions = usePortfolioStore((s) => s.positions);
  const metrics = useMemo(() => calculatePositions(positions), [positions]);
  const totals = portfolioTotals(metrics);
  const [shock, setShock] = useState(10);
  const largest = [...metrics].sort((a, b) => b.allocation - a.allocation)[0];
  return (
    <>
      <PageHeader eyebrow="Risk register" title="Stress the portfolio, not the narrative." copy="Sensitivity scenarios quantify possible portfolio movement. They are not stop-losses, targets or recommendations." />
      <section className="metric-grid four">
        <MetricCard label="Capital exposed" value={compactINR(totals.currentValue)} />
        <MetricCard label="Largest position" value={largest?.symbol ?? "—"} delta={largest ? `${largest.allocation.toFixed(1)}% allocation` : undefined} />
        <MetricCard label="5% downside" value={compactINR(scenarioValue(totals.currentValue, -5))} tone="negative" />
        <MetricCard label="10% upside" value={`+${compactINR(scenarioValue(totals.currentValue, 10))}`} tone="positive" />
      </section>
      <section className="risk-layout">
        <article className="panel scenario-panel">
          <div className="panel-head"><div><span className="eyebrow">Scenario engine</span><h2>Portfolio sensitivity</h2></div><strong className="shock-label">{shock}% shock</strong></div>
          <input className="range" type="range" min="5" max="15" step="5" value={shock} onChange={(e) => setShock(Number(e.target.value))} />
          <div className="scenario-scale"><span>5%</span><span>10%</span><span>15%</span></div>
          <div className="scenario-pair">
            <div className="downside"><span>Downside scenario</span><strong>{compactINR(scenarioValue(totals.currentValue, -shock))}</strong><small>Illustrative portfolio movement</small></div>
            <div className="upside"><span>Upside scenario</span><strong>+{compactINR(scenarioValue(totals.currentValue, shock))}</strong><small>Illustrative portfolio movement</small></div>
          </div>
        </article>
        <article className="panel">
          <div className="panel-head"><div><span className="eyebrow">Exposure matrix</span><h2>Position stress</h2></div></div>
          <div className="heatmap">{metrics.map((p) => <div key={p.id} style={{ flexBasis: `${Math.max(34, p.allocation * 1.7)}%` }}><span>{p.symbol}</span><strong>{compactINR(scenarioValue(p.currentValue, -shock))}</strong><small>{p.allocation.toFixed(1)}% weight</small></div>)}</div>
        </article>
      </section>
      <article className="risk-note"><strong>Risk interpretation</strong><p>Scenario values assume all holdings move by the same percentage at the same time. Real markets have different correlations, gaps, liquidity and volatility. Use these figures for sensitivity review only.</p></article>
    </>
  );
}
