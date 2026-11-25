// Server-side proxy to WeatherAPI, shared by the Vercel functions in /api and the Vite dev middleware.
// The API key never leaves the server: the browser only ever talks to /api/weather and /api/search,
// and only receives the fields the app actually uses.
import { normalizeForecast } from '../../src/lib/normalize.js';

const BASE = 'https://api.weatherapi.com/v1';
const MAX_QUERY_LENGTH = 100;
const CACHE_HEADER = 'public, s-maxage=300, stale-while-revalidate=600';
// Letters (any language), digits, spaces and the punctuation real place names, ids and coordinates use.
const SAFE_QUERY = /^[\p{L}\p{M}\p{N} .,'’:()-]+$/u;

const ENDPOINTS = {
  weather: {
    path: 'forecast.json',
    extra: { days: '3', aqi: 'yes' },
    shape: (raw) => normalizeForecast(raw),
  },
  search: {
    path: 'search.json',
    extra: {},
    shape: (raw) => (Array.isArray(raw) ? raw : []).map(({ id, name, region, country, lat, lon }) => ({ id, name, region, country, lat, lon })),
  },
};

export function buildUpstreamUrl(kind, q, key) {
  const { path, extra } = ENDPOINTS[kind];
  const params = new URLSearchParams({ key, q, ...extra });
  return `${BASE}/${path}?${params}`;
}

/** Fixed-window limiter per client IP. In-memory: per server instance, which is enough to stop casual abuse. */
export function createRateLimiter({ limit = 60, windowMs = 60_000, now = Date.now } = {}) {
  const hits = new Map();
  return {
    check(ip) {
      const t = now();
      const entry = hits.get(ip);
      if (!entry || t - entry.start > windowMs) {
        hits.set(ip, { start: t, count: 1 });
        if (hits.size > 5000) hits.clear(); // keep memory bounded
        return { ok: true };
      }
      entry.count += 1;
      if (entry.count <= limit) return { ok: true };
      return { ok: false, retryAfter: Math.ceil((entry.start + windowMs - t) / 1000) };
    },
  };
}

const json = (status, body, headers = {}) => ({
  status,
  body,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', ...headers },
});

/**
 * @param {'weather'|'search'} kind
 * @param {Record<string, unknown>} params  request query (only `q` is used)
 * @param {string|undefined} key            WEATHER_API_KEY from the server environment
 * @param {{ fetchImpl?: typeof fetch, headers?: Record<string,string>, ip?: string, limiter?: ReturnType<typeof createRateLimiter> }} [opts]
 */
export async function handleProxy(kind, params, key, { fetchImpl = fetch, headers = {}, ip, limiter } = {}) {
  const endpoint = ENDPOINTS[kind];
  if (!endpoint) return json(404, { error: 'Not found' });

  // Browsers mark requests made by other websites; refuse those so nobody can piggyback on our key.
  if (headers['sec-fetch-site'] === 'cross-site') return json(403, { error: 'Forbidden' });

  if (!key) return json(500, { error: 'Weather service not configured' });

  if (limiter && ip) {
    const verdict = limiter.check(ip);
    if (!verdict.ok) {
      return json(429, { error: 'Too many requests. Please wait a moment.' }, { 'Retry-After': String(verdict.retryAfter) });
    }
  }

  const q = typeof params?.q === 'string' ? params.q.trim() : '';
  if (!q || q.length > MAX_QUERY_LENGTH || !SAFE_QUERY.test(q)) {
    return json(400, { error: 'Please enter a valid location' });
  }

  let res;
  try {
    res = await fetchImpl(buildUpstreamUrl(kind, q, key));
  } catch {
    return json(502, { error: 'Weather service unreachable' });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // 401/403 mean a key or quota problem on our side: log it, never show it.
    if (res.status === 401 || res.status === 403 || res.status >= 500) {
      console.error(`[weather-proxy] upstream ${res.status}: ${data?.error?.message ?? 'unknown error'}`);
      return json(502, { error: 'Weather service unavailable. Please try again later.' });
    }
    return json(res.status, { error: data?.error?.message ?? 'Weather service error' });
  }

  try {
    return json(200, endpoint.shape(data), { 'Cache-Control': CACHE_HEADER });
  } catch {
    return json(502, { error: 'Weather service returned an unexpected response' });
  }
}

/** Client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(headers, fallback = 'unknown') {
  const fwd = headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0].trim() || headers['x-real-ip'] || fallback;
}
