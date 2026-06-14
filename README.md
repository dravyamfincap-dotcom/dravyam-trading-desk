# Dravyam Trading Desk

Private, responsive portfolio intelligence for Indian equities.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run check
```

## Cloudflare deployment

1. Create a private GitHub repository named `dravyam-trading-desk`.
2. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets.
3. Deploy once with `npm run deploy`, then add the market-data secret:

```bash
npx wrangler secret put TWELVE_DATA_API_KEY
```

4. In Cloudflare Zero Trust, create an Access self-hosted application for the Worker domain.
5. Add an Allow policy for the owner's email and keep the default deny behavior.
6. Protect both the custom domain and the `workers.dev` hostname.

Prices remain manually editable whenever the provider is unavailable. Market analysis is informational and not investment advice.
