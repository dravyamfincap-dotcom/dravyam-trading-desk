import { Plus, Trash } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import { EmptyState, PageHeader } from "../components/Common";
import { usePortfolioStore } from "../store";

export function Journal() {
  const journal = usePortfolioStore((s) => s.journal);
  const addJournal = usePortfolioStore((s) => s.addJournal);
  const deleteJournal = usePortfolioStore((s) => s.deleteJournal);
  const [open, setOpen] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addJournal({
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      symbol: String(data.get("symbol") || "PORTFOLIO").toUpperCase(),
      title: String(data.get("title") || "Journal note"),
      body: String(data.get("body") || ""),
      tag: String(data.get("tag") || "Review"),
    });
    setOpen(false);
  };
  return (
    <>
      <PageHeader eyebrow="Decision record" title="Keep the thesis beside the trade." copy="Record observations, process notes and review points without turning analytics into advice." actions={<button className="primary-button" onClick={() => setOpen(!open)}><Plus size={18} /> New note</button>} />
      {open && <form className="journal-form panel" onSubmit={submit}><input name="symbol" placeholder="Symbol or PORTFOLIO" required /><input name="title" placeholder="Note title" required /><select name="tag"><option>Review</option><option>Allocation</option><option>Risk</option><option>Thesis</option></select><textarea name="body" placeholder="What changed? What needs review?" required /><button className="primary-button" type="submit">Save note</button></form>}
      <section className="journal-list">
        {!journal.length && <EmptyState title="No journal entries" copy="Add a note to begin a durable decision record." />}
        {journal.map((entry) => <article key={entry.id}><div className="journal-date"><strong>{new Date(entry.date).getDate()}</strong><span>{new Date(entry.date).toLocaleString("en-IN", { month: "short" })}</span></div><div><div className="journal-title"><span>{entry.symbol}</span><em>{entry.tag}</em></div><h2>{entry.title}</h2><p>{entry.body}</p></div><button className="icon-button" onClick={() => deleteJournal(entry.id)} aria-label="Delete note"><Trash size={18} /></button></article>)}
      </section>
    </>
  );
}
