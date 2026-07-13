const PROVIDER_SYMBOLS = {
  AVALON: "AVALON:NSE",
  CPPLUS: "CPPLUS:NSE",
  SUPRIYA: "SUPRIYA:NSE",
  TRITURBINE: "TRITURBINE:NSE",
};

const CACHE_SECONDS = 300;

function parseSymbols(value) {
  return String(value ?? "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .filter((symbol) => Object.hasOwn(PROVIDER_SYMBOLS, symbol));
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fetchQuote(symbol, apiKey) {
  const providerSymbol = PROVIDER_SYMBOLS[symbol];
  const params = new URLSearchParams({
    symbol: providerSymbol,
    apikey: apiKey,
  });
  const response = await fetch(`https://api.twelvedata.com/quote?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Quote provider failed for ${symbol}`);
  }

  const quote = await response.json();

  if (quote.status === "error") {
    throw new Error(quote.message ?? `Quote provider rejected ${symbol}`);
  }

  const price = toNumber(quote.close);
  const previousClose = toNumber(quote.previous_close);

  if (!price || !previousClose) {
    throw new Error(`Quote provider returned incomplete data for ${symbol}`);
  }

  return {
    symbol,
    providerSymbol,
    price,
    previousClose,
    change: toNumber(quote.change),
    changePercent: toNumber(quote.percent_change),
    currency: quote.currency ?? "INR",
    exchange: quote.exchange ?? "NSE",
    refreshedAt: new Date().toISOString(),
  };
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      error: "Missing TWELVE_DATA_API_KEY. Add it in Vercel Project Settings > Environment Variables.",
    });
  }

  const symbols = parseSymbols(request.query.symbols);
  if (!symbols.length) {
    return response.status(400).json({ error: "No supported symbols requested" });
  }

  try {
    const quotes = await Promise.all(symbols.map((symbol) => fetchQuote(symbol, apiKey)));
    response.setHeader("Cache-Control", `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=600`);
    return response.status(200).json({ quotes });
  } catch (error) {
    return response.status(502).json({
      error: error instanceof Error ? error.message : "Quote refresh failed",
    });
  }
}
