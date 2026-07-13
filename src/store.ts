import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedJournal, seedPositions } from "./data/seed";
import type { JournalEntry, PortfolioState, Position } from "./types";

interface PortfolioStore extends PortfolioState {
  updatePrice: (id: string, price: number) => void;
  applyQuotes: (quotes: Array<{ symbol: string; price: number; previousClose: number }>) => void;
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

const refreshSeededRates = (positions: Position[]) =>
  positions.map((position) => {
    const seed = seedPositions.find(
      (seedPosition) =>
        seedPosition.id === position.id || seedPosition.symbol === position.symbol,
    );

    return seed
      ? {
          ...position,
          name: seed.name,
          sector: seed.sector,
          currentPrice: seed.currentPrice,
          previousClose: seed.previousClose,
          manualPrice: true,
        }
      : position;
  });

const mergeSeedJournal = (journal: JournalEntry[]) => [
  ...seedJournal.filter((seedEntry) => !journal.some((entry) => entry.id === seedEntry.id)),
  ...journal,
];

const migratePersistedState = (persistedState: unknown): PortfolioState => {
  const state = persistedState as Partial<PortfolioState>;

  return {
    ...initialState,
    ...state,
    positions: refreshSeededRates(state.positions ?? seedPositions),
    journal: mergeSeedJournal(state.journal ?? seedJournal),
    lastUpdated: new Date().toISOString(),
    dataMode: "manual",
  };
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
      applyQuotes: (quotes) =>
        set((state) => ({
          positions: state.positions.map((position) => {
            const quote = quotes.find((item) => item.symbol === position.symbol);

            return quote
              ? {
                  ...position,
                  currentPrice: quote.price,
                  previousClose: quote.previousClose,
                  manualPrice: false,
                }
              : position;
          }),
          lastUpdated: new Date().toISOString(),
          dataMode: "delayed",
        })),
      replacePositions: (positions) =>
        set({ positions, lastUpdated: new Date().toISOString(), dataMode: "manual" }),
      addJournal: (entry) => set((state) => ({ journal: [entry, ...state.journal] })),
      deleteJournal: (id) =>
        set((state) => ({ journal: state.journal.filter((entry) => entry.id !== id) })),
      reset: () => set(initialState),
    }),
    {
      name: "dravyam-portfolio-v1",
      version: 2,
      migrate: migratePersistedState,
    },
  ),
);
