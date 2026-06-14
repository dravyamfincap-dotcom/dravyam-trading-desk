interface Env {
  ASSETS: Fetcher;
  TWELVE_DATA_API_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

const SYMBOLS: Record<string, string> = {
  AVALON: "AVALON:NSE",
  CPPLUS: "CPPLUS:NSE",
  SUPRIYA: "SUPRIYA:NSE",
  TRITURBINE: "TRITURBINE:NSE",
};

function securityHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/quotes") {
      if (!env.TWELVE_DATA_API_KEY) return Response.json({ mode: "manual", quotes: {}, message: "Provider secret is not configured." }, { status: 503 });
      const requested = (url.searchParams.get("symbols") || "").split(",").map((s) => s.trim().toUpperCase()).filter((s) => SYMBOLS[s]);
      if (!requested.length || requested.length > 10) return Response.json({ error: "Provide between 1 and 10 supported symbols." }, { status: 400 });
      const providerUrl = new URL("https://api.twelvedata.com/quote");
      providerUrl.searchParams.set("symbol", requested.map((s) => SYMBOLS[s]).join(","));
      providerUrl.searchParams.set("apikey", env.TWELVE_DATA_API_KEY);
      const upstream = await fetch(providerUrl, { cf: { cacheTtl: 60, cacheEverything: true } });
      const data = await upstream.json();
      return securityHeaders(Response.json({ mode: "delayed", fetchedAt: new Date().toISOString(), data }, { headers: { "Cache-Control": "public, max-age=60" } }));
    }
    return securityHeaders(await env.ASSETS.fetch(request));
  },
} satisfies ExportedHandler<Env>;
