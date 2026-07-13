export interface LiveQuote {
  symbol: string;
  providerSymbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  exchange: string;
  refreshedAt: string;
}

export async function fetchLiveQuotes(symbols: string[]): Promise<LiveQuote[]> {
  const params = new URLSearchParams({ symbols: symbols.join(",") });
  const response = await fetch(`/api/quotes?${params.toString()}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to refresh quotes");
  }

  const payload = (await response.json()) as { quotes?: LiveQuote[] };
  return payload.quotes ?? [];
}
