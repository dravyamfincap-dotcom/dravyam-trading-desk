import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";

const Analytics = lazy(() => import("./pages/Analytics").then((module) => ({ default: module.Analytics })));
const Risk = lazy(() => import("./pages/Risk").then((module) => ({ default: module.Risk })));
const Journal = lazy(() => import("./pages/Journal").then((module) => ({ default: module.Journal })));
const ImportPage = lazy(() => import("./pages/ImportPage").then((module) => ({ default: module.ImportPage })));
const Settings = lazy(() => import("./pages/Settings").then((module) => ({ default: module.Settings })));

export function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="route-loader">Preparing the ledger…</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/risk" element={<Risk />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
