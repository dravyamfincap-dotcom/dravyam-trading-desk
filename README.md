# Dravyam Trading Desk

Private, responsive portfolio intelligence for Indian equities.

## Local development

```bash
npm install
npm run dev
```

For local testing of the Vercel API route:

```bash
npx vercel dev
```

## Validation

```bash
npm run check
```

## Vercel deployment

1. Import the GitHub repository into Vercel.
2. Keep Framework Preset as `Vite`.
3. Deploy. Vercel builds `dist/` and serves `/api/quotes` as a serverless function.
4. The dashboard refreshes quotes on load, every 5 minutes, and when the user clicks `Refresh rates`.

Optional fallback provider:

`TWELVE_DATA_API_KEY=<your Twelve Data key>`

## Live quote flow

- The browser calls `/api/quotes?symbols=AVALON,CPPLUS,SUPRIYA,TRITURBINE` using the current portfolio symbols.
- Vercel fetches `SYMBOL.NS` quotes from Yahoo Finance by default.
- If Yahoo Finance fails and `TWELVE_DATA_API_KEY` is configured, the API falls back to Twelve Data `SYMBOL:NSE`.
- The dashboard applies `currentPrice` and `previousClose` without exposing provider details to the browser.

Prices remain manually editable whenever providers are unavailable. Yahoo Finance is an unofficial no-key source for personal dashboards; market analysis is informational and not investment advice.
