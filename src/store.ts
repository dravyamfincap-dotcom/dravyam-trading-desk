import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedJournal, seedPositions } from "./data/seed";
import type { JournalEntry, PortfolioState, Position } from "./types";

interface PortfolioStore extends PortfolioState {
  updatePrice: (id: string, price: number) => void;
  replacePositions: (positions: Position[]) => void;
  addJournal: (entry: JournalEntry) => void;
  deleteJournal: (id: string) => void;
  reset: () => void;
}

const initialState: PortfolioState = {
  positions: seedPositions,
  journal: seedJournal,
  lastUpdated: new Date().toISOString(),
  dataMode: "manual",
};

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      ...initialState,
      updatePrice: (id, price) =>
        set((state) => ({
          positions: state.positions.map((position) =>
            position.id === id
              ? { ...position, currentPrice: price, manualPrice: true }
              : position,
          ),
          lastUpdated: new Date().toISOString(),
          dataMode: "manual",
        })),
      replacePositions: (positions) =>
        set({ positions, lastUpdated: new Date().toISOString(), dataMode: "manual" }),
      addJournal: (entry) => set((state) => ({ journal: [entry, ...state.journal] })),
      deleteJournal: (id) =>
        set((state) => ({ journal: state.journal.filter((entry) => entry.id !== id) })),
      reset: () => set(initialState),
    }),
    { name: "dravyam-portfolio-v1" },
  ),
);
