import { afterEach, expect, test, vi } from 'vitest';
import fixture from '../fixtures/forecast.json';
import { fetchForecast, searchPlaces } from '../../src/services/weatherApi.js';

afterEach(() => vi.unstubAllGlobals());

const respond = (status, body) => vi.fn(async () => ({ ok: status < 400, status, json: async () => body }));

test('searchPlaces skips short queries without a request', async () => {
  const f = respond(200, []);
  vi.stubGlobal('fetch', f);
  expect(await searchPlaces('a')).toEqual([]);
  expect(f).not.toHaveBeenCalled();
});

test('searchPlaces encodes the query and maps places', async () => {
  const f = respond(200, [{ id: 7, name: 'San José', region: 'SJ', country: 'Costa Rica', lat: 9.9, lon: -84 }]);
  vi.stubGlobal('fetch', f);
  const out = await searchPlaces('san josé & co');
  expect(f.mock.calls[0][0]).toBe('/api/search?q=san+jos%C3%A9+%26+co');
  expect(out).toEqual([{ id: 7, name: 'San José', region: 'SJ', country: 'Costa Rica', lat: 9.9, lon: -84 }]);
});

test('fetchForecast normalizes and caches by query', async () => {
  const f = respond(200, fixture);
  vi.stubGlobal('fetch', f);
  const a = await fetchForecast('cache-test-city');
  const b = await fetchForecast('cache-test-city');
  expect(a.location.name).toBe(fixture.location.name);
  expect(b).toBe(a);
  expect(f).toHaveBeenCalledTimes(1);
});

test('fetchForecast throws the proxy error message', async () => {
  vi.stubGlobal('fetch', respond(400, { error: 'No matching location found.' }));
  await expect(fetchForecast('zzzz-nowhere')).rejects.toThrow('No matching location found.');
});
