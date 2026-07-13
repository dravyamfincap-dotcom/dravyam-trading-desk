import {
  ArrowsClockwise,
  BookOpenText,
  ChartLineUp,
  GearSix,
  List,
  ShieldCheck,
  SquaresFour,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { usePortfolioStore } from "../store";

const nav = [
  { to: "/", label: "Dashboard", icon: SquaresFour },
  { to: "/analytics", label: "Analytics", icon: ChartLineUp },
  { to: "/risk", label: "Risk", icon: ShieldCheck },
  { to: "/journal", label: "Journal", icon: BookOpenText },
  { to: "/import", label: "Import", icon: UploadSimple },
  { to: "/settings", label: "Settings", icon: GearSix },
];

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const lastUpdated = usePortfolioStore((state) => state.lastUpdated);
  const dataMode = usePortfolioStore((state) => state.dataMode);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <img className="brand-lockup" src="/dravyam-logo.png" alt="Dravyam Fincap — Generating Alpha" />
          <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav>
          <p className="nav-label">Workspace</p>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={19} weight="duotone" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="private-badge"><ShieldCheck size={16} weight="fill" /> Private workspace</div>
          <p>Analytics only. No investment advice.</p>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <List size={22} />
          </button>
          <div className="market-status">
            <span className="live-dot" />
            <div>
              <strong>NSE delayed data</strong>
              <span>{dataMode === "manual" ? "Manual price mode" : "Provider connected"}</span>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="updated">Updated {new Date(lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            <button className="icon-button" onClick={() => window.location.reload()} title="Refresh">
              <ArrowsClockwise size={19} />
            </button>
            <div className="profile">DK</div>
          </div>
        </header>
        <div className="page-wrap">
          <Outlet />
        </div>
      </main>
      {menuOpen && <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
    </div>
  );
}
