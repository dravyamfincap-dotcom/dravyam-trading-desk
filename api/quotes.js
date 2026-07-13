const CACHE_SECONDS = 300;
const NSE_SYMBOL_PATTERN = /^[A-Z0-9&-]{1,24}$/;

function parseSymbols(value) {
  return [...new Set(String(value ?? "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .filter((symbol) => NSE_SYMBOL_PATTERN.test(symbol)))];
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fetchYahooQuote(symbol) {
  const providerSymbol = `${symbol}.NS`;
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${providerSymbol}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 DravyamTradingDesk/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance failed for ${symbol}`);
  }

  const payload = await response.json();
  const result = payload.chart?.result?.[0];
  const error = payload.chart?.error;

  if (error) {
    throw new Error(error.description ?? `Yahoo Finance rejected ${symbol}`);
  }

  const meta = result?.meta;
  const price = toNumber(meta?.regularMarketPrice);
  const previousClose = toNumber(meta?.chartPreviousClose ?? meta?.previousClose);

  if (!price || !previousClose) {
    throw new Error(`Yahoo Finance returned incomplete data for ${symbol}`);
  }

  return {
    symbol,
    providerSymbol,
    price,
    previousClose,
    change: price - previousClose,
    changePercent: previousClose ? ((price - previousClose) / previousClose) * 100 : 0,
    currency: meta?.currency ?? "INR",
    exchange: meta?.exchangeName ?? "NSE",
    provider: "yahoo",
    refreshedAt: new Date().toISOString(),
  };
}

async function fetchTwelveDataQuote(symbol, apiKey) {
  const providerSymbol = `${symbol}:NSE`;
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
    provider: "twelvedata",
    refreshedAt: new Date().toISOString(),
  };
}

async function fetchQuote(symbol, apiKey) {
  try {
    return await fetchYahooQuote(symbol);
  } catch (yahooError) {
    if (!apiKey) {
      throw yahooError;
    }

    return fetchTwelveDataQuote(symbol, apiKey);
  }
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const symbols = parseSymbols(request.query.symbols);
  if (!symbols.length) {
    return response.status(400).json({ error: "No supported symbols requested" });
  }

  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    const quotes = await Promise.all(symbols.map((symbol) => fetchQuote(symbol, apiKey)));
    response.setHeader("Cache-Control", `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=600`);
    return response.status(200).json({ quotes });
  } catch (error) {
    return response.status(502).json({
      error: error instanceof Error ? error.message : "Quote refresh failed",
    });
  }
}
