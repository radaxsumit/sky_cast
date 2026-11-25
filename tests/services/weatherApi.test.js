import { afterEach, expect, test, vi } from 'vitest';
import fixture from '../fixtures/forecast.json';
import { normalizeForecast } from '../../src/lib/normalize.js';
import { fetchForecast, searchPlaces } from '../../src/services/weatherApi.js';

afterEach(() => vi.unstubAllGlobals());

const model = normalizeForecast(fixture);
const respond = (status, body) => vi.fn(async () => ({ ok: status < 400, status, json: async () => body }));

test('searchPlaces skips short queries without a request', async () => {
  const f = respond(200, []);
  vi.stubGlobal('fetch', f);
  expect(await searchPlaces('a')).toEqual([]);
  expect(f).not.toHaveBeenCalled();
});

test('searchPlaces encodes the query and returns the places', async () => {
  const places = [{ id: 7, name: 'San José', region: 'SJ', country: 'Costa Rica', lat: 9.9, lon: -84 }];
  const f = respond(200, places);
  vi.stubGlobal('fetch', f);
  const out = await searchPlaces('san josé & co');
  expect(f.mock.calls[0][0]).toBe('/api/search?q=san+jos%C3%A9+%26+co');
  expect(out).toEqual(places);
});

test('fetchForecast returns the server model and caches by query', async () => {
  const f = respond(200, model);
  vi.stubGlobal('fetch', f);
  const a = await fetchForecast('cache-test-city');
  const b = await fetchForecast('cache-test-city');
  expect(a.location.name).toBe(fixture.location.name);
  expect(b).toBe(a);
  expect(f).toHaveBeenCalledTimes(1);
});

test('identical requests in flight share one network call', async () => {
  let release;
  const f = vi.fn(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ ok: true, status: 200, json: async () => model });
      }),
  );
  vi.stubGlobal('fetch', f);
  const p1 = fetchForecast('dedupe-city');
  const p2 = fetchForecast('Dedupe-City ');
  release();
  const [a, b] = await Promise.all([p1, p2]);
  expect(f).toHaveBeenCalledTimes(1);
  expect(a).toBe(b);
});

test('a failed request is not cached', async () => {
  vi.stubGlobal('fetch', respond(502, { error: 'Weather service unavailable. Please try again later.' }));
  await expect(fetchForecast('flaky-city')).rejects.toThrow('Weather service unavailable');
  const f = respond(200, model);
  vi.stubGlobal('fetch', f);
  await fetchForecast('flaky-city');
  expect(f).toHaveBeenCalledTimes(1);
});

test('fetchForecast throws the proxy error message', async () => {
  vi.stubGlobal('fetch', respond(400, { error: 'No matching location found.' }));
  await expect(fetchForecast('zzzz-nowhere')).rejects.toThrow('No matching location found.');
});

test('fetchForecast with fresh skips the cache', async () => {
  const f = respond(200, model);
  vi.stubGlobal('fetch', f);
  await fetchForecast('fresh-test-city');
  await fetchForecast('fresh-test-city', { fresh: true });
  expect(f).toHaveBeenCalledTimes(2);
});
