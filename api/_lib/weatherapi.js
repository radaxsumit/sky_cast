// Shared by the Vercel functions in /api and the Vite dev middleware.
// The WeatherAPI key only ever lives on the server.

const BASE = 'https://api.weatherapi.com/v1';
const MAX_QUERY_LENGTH = 100;
const CACHE_HEADER = 'public, s-maxage=300, stale-while-revalidate=600';

const ENDPOINTS = {
  weather: { path: 'forecast.json', extra: { days: '3', aqi: 'yes' } },
  search: { path: 'search.json', extra: {} },
};

export function buildUpstreamUrl(kind, q, key) {
  const { path, extra } = ENDPOINTS[kind];
  const params = new URLSearchParams({ key, q, ...extra });
  return `${BASE}/${path}?${params}`;
}

const json = (status, body, headers = {}) => ({
  status,
  body,
  headers: { 'Content-Type': 'application/json', ...headers },
});

export async function handleProxy(kind, params, key, fetchImpl = fetch) {
  if (!ENDPOINTS[kind]) return json(404, { error: 'Not found' });
  if (!key) return json(500, { error: 'Weather service not configured' });

  const q = typeof params?.q === 'string' ? params.q.trim() : '';
  if (!q || q.length > MAX_QUERY_LENGTH) {
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
    const message = data?.error?.message ?? 'Weather service error';
    return json(res.status, { error: message });
  }
  return json(200, data, { 'Cache-Control': CACHE_HEADER });
}
