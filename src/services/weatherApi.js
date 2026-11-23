import { createCache } from '../lib/cache.js';
import { normalizeForecast } from '../lib/normalize.js';

// All calls go through our own /api proxy; the WeatherAPI key never reaches the browser.
const forecastCache = createCache(600_000);

async function getJson(url) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('Network error. Check your connection and try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? 'Something went wrong fetching the weather.');
  return body;
}

export async function fetchForecast(query, { fresh = false } = {}) {
  const key = query.trim().toLowerCase();
  const hit = fresh ? undefined : forecastCache.get(key);
  if (hit) return hit;
  const raw = await getJson(`/api/weather?${new URLSearchParams({ q: query.trim() })}`);
  const model = normalizeForecast(raw);
  forecastCache.set(key, model);
  return model;
}

export async function searchPlaces(q) {
  const text = q.trim();
  if (text.length < 2) return [];
  const list = await getJson(`/api/search?${new URLSearchParams({ q: text })}`);
  return list.map(({ id, name, region, country, lat, lon }) => ({ id, name, region, country, lat, lon }));
}
