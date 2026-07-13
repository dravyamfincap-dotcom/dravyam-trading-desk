import { DownloadSimple, Info, SlidersHorizontal, TrendDown, TrendUp, X } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { AllocationChart, ContributionChart, PerformanceChart, Sparkline } from "../components/Charts";
import { MetricCard, PageHeader } from "../components/Common";
import { buildInsights, calculatePositions, compactINR, INR, INR_PRECISE, makePerformanceSeries, portfolioTotals } from "../lib/portfolio";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = metrics.find((p) => p.id === selectedId);

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

      <section className="rate-tape" aria-label="Current and purchase rates">
        {metrics.map((p) => {
          const rateMove = p.currentPrice - p.entryPrice;
          return (
            <button key={p.id} className="rate-tile" onClick={() => setSelectedId(p.id)}>
              <span>{p.symbol}</span>
              <strong>{INR_PRECISE.format(p.currentPrice)}</strong>
              <small>Bought {INR_PRECISE.format(p.entryPrice)}</small>
              <em className={rateMove >= 0 ? "positive" : "negative"}>
                {rateMove >= 0 ? "+" : ""}{INR_PRECISE.format(rateMove)} / share
              </em>
            </button>
          );
        })}
      </section>

      <section className="section-head">
        <div><span className="eyebrow">Open positions</span><h2>Holdings ledger</h2></div>
        <div className="filter-row"><SlidersHorizontal size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter holdings" /></div>
      </section>
      <section className="position-grid">
        {filtered.map((p, index) => (
          <article className="position-card" key={p.id} onClick={() => setSelectedId(p.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") setSelectedId(p.id); }}>
            <div className="position-top">
              <div><span className="symbol">{p.symbol}</span><p>{p.name}</p></div>
              <span className={`status ${p.pnl >= 0 ? "gain" : "loss"}`}>{p.pnl >= 0 ? <TrendUp size={14} /> : <TrendDown size={14} />}{p.pnlPct.toFixed(2)}%</span>
            </div>
            <Sparkline positive={p.pnl >= 0} seed={index} />
            <div className="rate-compare">
              <div><span>Purchase rate</span><strong>{INR_PRECISE.format(p.entryPrice)}</strong></div>
              <div><span>Current rate</span><strong>{INR_PRECISE.format(p.currentPrice)}</strong></div>
            </div>
            <div className="position-value"><strong>{compactINR(p.currentValue)}</strong><span className={p.pnl >= 0 ? "positive" : "negative"}>{p.pnl >= 0 ? "+" : ""}{compactINR(p.pnl)}</span></div>
            <dl>
              <div><dt>Qty</dt><dd>{p.quantity.toLocaleString("en-IN")}</dd></div>
              <div><dt>Entry</dt><dd>{INR_PRECISE.format(p.entryPrice)}</dd></div>
              <div><dt>CMP</dt><dd><input aria-label={`${p.symbol} current price`} type="number" value={p.currentPrice} onClick={(event) => event.stopPropagation()} onChange={(e) => updatePrice(p.id, Number(e.target.value))} /></dd></div>
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

      {selected && (
        <div className="stock-modal-backdrop" role="presentation" onClick={() => setSelectedId(null)}>
          <article className="stock-modal" role="dialog" aria-modal="true" aria-label={`${selected.symbol} position details`} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedId(null)} aria-label="Close stock details"><X size={18} /></button>
            <div className="stock-hero">
              <div>
                <span className="eyebrow">Position detail</span>
                <h2>{selected.symbol}</h2>
                <p>{selected.name} · {selected.sector}</p>
              </div>
              <span className={`status ${selected.pnl >= 0 ? "gain" : "loss"}`}>{selected.pnl >= 0 ? <TrendUp size={16} /> : <TrendDown size={16} />}{selected.pnlPct.toFixed(2)}%</span>
            </div>

            <div className="stock-price-board">
              <div>
                <span>Purchase rate</span>
                <strong>{INR_PRECISE.format(selected.entryPrice)}</strong>
                <small>Entry date {new Date(selected.entryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</small>
              </div>
              <div>
                <span>Current rate</span>
                <strong>{INR_PRECISE.format(selected.currentPrice)}</strong>
                <small>Previous close {INR_PRECISE.format(selected.previousClose)}</small>
              </div>
              <div>
                <span>Per-share move</span>
                <strong className={selected.currentPrice >= selected.entryPrice ? "positive" : "negative"}>{INR_PRECISE.format(selected.currentPrice - selected.entryPrice)}</strong>
                <small>{selected.dayPct >= 0 ? "+" : ""}{selected.dayPct.toFixed(2)}% versus previous close</small>
              </div>
            </div>

            <div className="stock-detail-grid">
              <div><span>Quantity</span><strong>{selected.quantity.toLocaleString("en-IN")}</strong></div>
              <div><span>Invested</span><strong>{INR.format(selected.investment)}</strong></div>
              <div><span>Current value</span><strong>{INR.format(selected.currentValue)}</strong></div>
              <div><span>Total P&L</span><strong className={selected.pnl >= 0 ? "positive" : "negative"}>{INR.format(selected.pnl)}</strong></div>
              <div><span>Day P&L</span><strong className={selected.dayPnl >= 0 ? "positive" : "negative"}>{INR.format(selected.dayPnl)}</strong></div>
              <div><span>Allocation</span><strong>{selected.allocation.toFixed(1)}%</strong></div>
              <div><span>Contribution</span><strong>{selected.contribution.toFixed(1)}%</strong></div>
              <div><span>Holding period</span><strong>{selected.holdingDays} days</strong></div>
            </div>

            <div className="scenario-strip">
              {[5, 10, 15].map((move) => (
                <div key={move}>
                  <span>+{move}% CMP</span>
                  <strong>{INR.format(selected.currentValue * (1 + move / 100))}</strong>
                </div>
              ))}
              {[-5, -10, -15].map((move) => (
                <div key={move}>
                  <span>{move}% CMP</span>
                  <strong>{INR.format(selected.currentValue * (1 + move / 100))}</strong>
                </div>
              ))}
            </div>
            <p className="modal-note">Scenario values are mechanical price shocks on current value. They are not trading recommendations.</p>
          </article>
        </div>
      )}
    </>
  );
}
