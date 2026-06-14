import { FileCsv, FileXls, UploadSimple } from "@phosphor-icons/react";
import { ChangeEvent, useState } from "react";
import { PageHeader } from "../components/Common";
import { usePortfolioStore } from "../store";
import type { Position } from "../types";

const aliases: Record<string, string[]> = {
  symbol: ["symbol", "ticker", "stock", "stock name"],
  quantity: ["quantity", "qty", "shares"],
  entryPrice: ["entry price", "avg", "average", "buy price", "rate"],
  currentPrice: ["cmp", "current price", "ltp"],
  entryDate: ["buy date", "entry date", "date"],
  sector: ["sector", "industry"],
};

function pick(row: Record<string, unknown>, field: string) {
  const key = Object.keys(row).find((column) => aliases[field]?.includes(column.trim().toLowerCase()));
  return key ? row[key] : undefined;
}

export function ImportPage() {
  const replacePositions = usePortfolioStore((s) => s.replacePositions);
  const [preview, setPreview] = useState<Position[]>([]);
  const [error, setError] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) return setError("File exceeds the 5 MB limit.");
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      const parsed = rows.map((row, index): Position => {
        const symbol = String(pick(row, "symbol") || "").trim().toUpperCase();
        const entryPrice = Number(pick(row, "entryPrice"));
        const currentPrice = Number(pick(row, "currentPrice")) || entryPrice;
        const quantity = Number(pick(row, "quantity"));
        if (!symbol || !quantity || !entryPrice) throw new Error(`Row ${index + 2}: symbol, quantity and entry price are required.`);
        const rawDate = pick(row, "entryDate");
        const date = rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : String(rawDate || "2026-06-01").slice(0, 10);
        return {
          id: `${symbol.toLowerCase()}-${index}`,
          symbol,
          name: symbol,
          sector: String(pick(row, "sector") || "Unclassified").replace(/[<>&]/g, ""),
          quantity,
          entryPrice,
          currentPrice,
          previousClose: currentPrice,
          entryDate: date,
          status: "active",
          strategy: "Imported",
          manualPrice: true,
        };
      });
      setPreview(parsed);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to parse the selected file.");
      setPreview([]);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Portfolio intake" title="Bring any ledger into focus." copy="Upload CSV or Excel. We detect common portfolio columns, validate required fields and let you review before replacing the active ledger." />
      <section className="upload-zone">
        <div className="upload-icons"><FileCsv size={32} weight="duotone" /><FileXls size={32} weight="duotone" /></div>
        <h2>Drop a portfolio file here</h2>
        <p>CSV or XLSX up to 5 MB. Required: symbol, quantity and entry price.</p>
        <label className="primary-button"><UploadSimple size={18} /> Choose file<input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} hidden /></label>
      </section>
      {error && <div className="error-banner">{error}</div>}
      {preview.length > 0 && <article className="panel table-panel"><div className="panel-head"><div><span className="eyebrow">Validation passed</span><h2>{preview.length} positions ready</h2></div><button className="primary-button" onClick={() => replacePositions(preview)}>Use this portfolio</button></div><div className="table-scroll"><table><thead><tr><th>Symbol</th><th>Quantity</th><th>Entry</th><th>CMP</th><th>Sector</th></tr></thead><tbody>{preview.map((p) => <tr key={p.id}><td><strong>{p.symbol}</strong></td><td>{p.quantity}</td><td>{p.entryPrice}</td><td>{p.currentPrice}</td><td>{p.sector}</td></tr>)}</tbody></table></div></article>}
      <article className="mapping-guide panel"><span className="eyebrow">Recognised headings</span><h2>Smart column matching</h2><div>{Object.entries(aliases).map(([field, values]) => <p key={field}><strong>{field}</strong><span>{values.join(", ")}</span></p>)}</div></article>
    </>
  );
}
