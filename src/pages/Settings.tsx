import { DownloadSimple, LockKey, UploadSimple, Warning } from "@phosphor-icons/react";
import { ChangeEvent, useState } from "react";
import { PageHeader } from "../components/Common";
import { decryptBackup, encryptBackup } from "../lib/crypto";
import { usePortfolioStore } from "../store";
import type { PortfolioState } from "../types";

function download(content: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Settings() {
  const positions = usePortfolioStore((s) => s.positions);
  const journal = usePortfolioStore((s) => s.journal);
  const replacePositions = usePortfolioStore((s) => s.replacePositions);
  const reset = usePortfolioStore((s) => s.reset);
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const sheet = XLSX.utils.json_to_sheet(positions);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Portfolio");
    XLSX.writeFile(book, "dravyam-portfolio.xlsx");
  };
  const exportEncrypted = async () => {
    if (secret.length < 8) return setMessage("Use a backup passphrase of at least 8 characters.");
    const payload = await encryptBackup({ positions, journal, exportedAt: new Date().toISOString() }, secret);
    download(payload, "dravyam-private-backup.dtb", "application/octet-stream");
    setMessage("Encrypted backup created. Keep the passphrase separately.");
  };
  const restore = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || secret.length < 8) return setMessage("Choose a backup and enter its passphrase.");
    try {
      const restored = await decryptBackup(await file.text(), secret) as PortfolioState;
      replacePositions(restored.positions);
      setMessage("Portfolio restored successfully.");
    } catch {
      setMessage("Restore failed. Check the file and passphrase.");
    }
  };

  return (
    <>
      <PageHeader eyebrow="Workspace controls" title="Your data stays under your control." copy="Manage exports, encrypted backups and provider configuration for this browser." />
      <section className="settings-grid">
        <article className="panel settings-card"><LockKey size={28} weight="duotone" /><h2>Encrypted backup</h2><p>Create an AES-GCM encrypted file for moving the portfolio between trusted devices.</p><input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Backup passphrase" /><div className="button-row"><button className="primary-button" onClick={exportEncrypted}><DownloadSimple size={18} /> Export</button><label className="secondary-button"><UploadSimple size={18} /> Restore<input type="file" accept=".dtb" hidden onChange={restore} /></label></div></article>
        <article className="panel settings-card"><FileSettings /><h2>Portable data</h2><p>Export a standard Excel workbook for analysis or archival outside the application.</p><button className="secondary-button" onClick={exportExcel}><DownloadSimple size={18} /> Export Excel</button></article>
        <article className="panel settings-card danger-card"><Warning size={28} weight="duotone" /><h2>Reset workspace</h2><p>Restore the original four-position ledger and remove local changes from this browser.</p><button className="danger-button" onClick={() => { if (confirm("Reset the local Dravyam workspace?")) reset(); }}>Reset local data</button></article>
      </section>
      {message && <div className="notice-banner">{message}</div>}
      <article className="panel provider-card"><div><span className="eyebrow">Market data provider</span><h2>Twelve Data adapter</h2><p>The Cloudflare Worker reads the API key from a server-side secret. Until configured, prices remain editable and visibly marked as manual.</p></div><span className="provider-status">Manual fallback active</span></article>
    </>
  );
}

function FileSettings() {
  return <DownloadSimple size={28} weight="duotone" />;
}
