import { createCache } from '../lib/cache.js';

// All calls go through our own /api proxy. The WeatherAPI key lives only on the server, which also
// trims responses down to the app's model, so nothing secret or unused reaches the browser.
const forecastCache = createCache(600_000);
const inFlight = new Map();

async function getJson(url) {
  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch {
    throw new Error('Network error. Check your connection and try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? 'Something went wrong fetching the weather.');
  return body;
}

export function fetchForecast(query, { fresh = false } = {}) {
  const q = query.trim();
  const key = q.toLowerCase();
  const hit = fresh ? undefined : forecastCache.get(key);
  if (hit) return Promise.resolve(hit);
  // Share an identical request that's already on its way instead of firing a duplicate.
  if (!fresh && inFlight.has(key)) return inFlight.get(key);

  const request = getJson(`/api/weather?${new URLSearchParams({ q })}`)
    .then((model) => {
      forecastCache.set(key, model);
      return model;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}

export async function searchPlaces(q) {
  const text = q.trim();
  if (text.length < 2) return [];
  return getJson(`/api/search?${new URLSearchParams({ q: text })}`);
}
