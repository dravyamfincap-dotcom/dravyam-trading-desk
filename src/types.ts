export type PositionStatus = "active" | "partial" | "closed";

export interface Position {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  previousClose: number;
  entryDate: string;
  status: PositionStatus;
  strategy: string;
  notes?: string;
  manualPrice?: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  symbol: string;
  title: string;
  body: string;
  tag: string;
}

export interface PortfolioState {
  positions: Position[];
  journal: JournalEntry[];
  lastUpdated: string;
  dataMode: "manual" | "delayed" | "mixed";
}

export interface PositionMetrics extends Position {
  investment: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  dayPnl: number;
  dayPct: number;
  allocation: number;
  contribution: number;
  holdingDays: number;
}
