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
3. Add the environment variable in Vercel Project Settings:

   `TWELVE_DATA_API_KEY=<your Twelve Data key>`

4. Deploy. Vercel builds `dist/` and serves `/api/quotes` as a serverless function.
5. The dashboard refreshes quotes on load, every 5 minutes, and when the user clicks `Refresh rates`.

## Live quote flow

- The browser calls `/api/quotes?symbols=AVALON,CPPLUS,SUPRIYA,TRITURBINE` using the current portfolio symbols.
- Vercel reads `TWELVE_DATA_API_KEY` server-side.
- The API accepts clean NSE symbols and fetches `SYMBOL:NSE` quotes from Twelve Data.
- The dashboard applies `currentPrice` and `previousClose` without exposing the API key.

Prices remain manually editable whenever the provider is unavailable. Market analysis is informational and not investment advice.
