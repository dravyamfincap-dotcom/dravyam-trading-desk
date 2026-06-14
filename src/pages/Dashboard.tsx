import { DownloadSimple, Info, SlidersHorizontal, TrendDown, TrendUp } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { AllocationChart, ContributionChart, PerformanceChart, Sparkline } from "../components/Charts";
import { MetricCard, PageHeader } from "../components/Common";
import { buildInsights, calculatePositions, compactINR, INR_PRECISE, makePerformanceSeries, portfolioTotals } from "../lib/portfolio";
import { usePortfolioStore } from "../store";

export function Dashboard() {
  const positions = usePortfolioStore((state) => state.positions);
  const updatePrice = usePortfolioStore((state) => state.updatePrice);
  const metrics = useMemo(() => calculatePositions(positions), [positions]);
  const totals = portfolioTotals(metrics);
  const performance = makePerformanceSeries(totals.invested, totals.currentValue);
  const insights = buildInsights(metrics);
  const [query, setQuery] = useState("");
  const filtered = metrics.filter((p) => p.symbol.toLowerCase().includes(query.toLowerCase()) || p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeader
        eyebrow="Portfolio command"
        title="Capital, clearly accounted for."
        copy="A private ledger of exposure, contribution and risk across your active NSE positions."
        actions={<button className="primary-button" onClick={() => window.print()}><DownloadSimple size={18} /> Export brief</button>}
      />
      <section className="metric-grid">
        <MetricCard label="Invested capital" value={compactINR(totals.invested)} delta="Four active positions" />
        <MetricCard label="Current value" value={compactINR(totals.currentValue)} delta={`${totals.pnlPct >= 0 ? "+" : ""}${totals.pnlPct.toFixed(2)}% since entry`} tone={totals.pnl >= 0 ? "positive" : "negative"} />
        <MetricCard label="Total P&L" value={compactINR(totals.pnl)} delta={`${totals.winners} of ${metrics.length} positions positive`} tone={totals.pnl >= 0 ? "positive" : "negative"} />
        <MetricCard label="Session P&L" value={compactINR(totals.dayPnl)} delta={`${totals.dayPct >= 0 ? "+" : ""}${totals.dayPct.toFixed(2)}% today`} tone={totals.dayPnl >= 0 ? "positive" : "negative"} />
        <MetricCard label="Largest allocation" value={`${totals.concentration.toFixed(1)}%`} delta="Balanced concentration" />
      </section>

      <section className="dashboard-grid">
        <article className="panel performance-panel">
          <div className="panel-head">
            <div><span className="eyebrow">Portfolio trajectory</span><h2>Value since deployment</h2></div>
            <div className="legend"><span><i className="blue-dot" /> Portfolio value</span><span><i className="gold-line" /> Invested capital</span></div>
          </div>
          <PerformanceChart data={performance} />
          <div className="chart-foot"><span>1 Jun 2026</span><strong>{compactINR(totals.pnl)} net movement</strong><span>Today</span></div>
        </article>
        <article className="panel insight-panel">
          <div className="panel-head"><div><span className="eyebrow">Dravyam lens</span><h2>Portfolio observations</h2></div><Info size={19} /></div>
          <div className="insight-list">
            {insights.map((insight, index) => <div key={insight}><span>0{index + 1}</span><p>{insight}</p></div>)}
          </div>
          <p className="disclaimer">Generated from portfolio arithmetic. Not investment advice.</p>
        </article>
      </section>

      <section className="section-head">
        <div><span className="eyebrow">Open positions</span><h2>Holdings ledger</h2></div>
        <div className="filter-row"><SlidersHorizontal size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter holdings" /></div>
      </section>
      <section className="position-grid">
        {filtered.map((p, index) => (
          <article className="position-card" key={p.id}>
            <div className="position-top">
              <div><span className="symbol">{p.symbol}</span><p>{p.name}</p></div>
              <span className={`status ${p.pnl >= 0 ? "gain" : "loss"}`}>{p.pnl >= 0 ? <TrendUp size={14} /> : <TrendDown size={14} />}{p.pnlPct.toFixed(2)}%</span>
            </div>
            <Sparkline positive={p.pnl >= 0} seed={index} />
            <div className="position-value"><strong>{compactINR(p.currentValue)}</strong><span className={p.pnl >= 0 ? "positive" : "negative"}>{p.pnl >= 0 ? "+" : ""}{compactINR(p.pnl)}</span></div>
            <dl>
              <div><dt>Qty</dt><dd>{p.quantity.toLocaleString("en-IN")}</dd></div>
              <div><dt>Entry</dt><dd>{INR_PRECISE.format(p.entryPrice)}</dd></div>
              <div><dt>CMP</dt><dd><input aria-label={`${p.symbol} current price`} type="number" value={p.currentPrice} onChange={(e) => updatePrice(p.id, Number(e.target.value))} /></dd></div>
              <div><dt>Allocation</dt><dd>{p.allocation.toFixed(1)}%</dd></div>
            </dl>
            <div className="allocation-track"><span style={{ width: `${p.allocation}%` }} /></div>
            <div className="position-meta"><span>{p.sector}</span><span>{p.holdingDays} days</span></div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid lower-grid">
        <article className="panel">
          <div className="panel-head"><div><span className="eyebrow">Capital map</span><h2>Allocation by position</h2></div></div>
          <div className="allocation-wrap">
            <AllocationChart positions={metrics} />
            <div className="allocation-list">{metrics.map((p) => <div key={p.id}><i style={{ background: ["#174f95", "#d81e45", "#aa7a27", "#2d6b57"][metrics.indexOf(p)] }} /><span>{p.symbol}</span><strong>{p.allocation.toFixed(1)}%</strong></div>)}</div>
          </div>
        </article>
        <article className="panel">
          <div className="panel-head"><div><span className="eyebrow">Return attribution</span><h2>P&L contribution</h2></div></div>
          <ContributionChart positions={metrics} />
        </article>
      </section>
    </>
  );
}
