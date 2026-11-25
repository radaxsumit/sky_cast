import { expect, test } from 'vitest';
import fixture from '../fixtures/forecast.json';
import { buildUpstreamUrl, createRateLimiter, handleProxy } from '../../api/_lib/weatherapi.js';

const ok = (body) => async () => ({ ok: true, status: 200, json: async () => body });

test('weather url', () => {
  expect(buildUpstreamUrl('weather', 'New York', 'K'))
    .toBe('https://api.weatherapi.com/v1/forecast.json?key=K&q=New+York&days=3&aqi=yes');
});

test('search url', () => {
  expect(buildUpstreamUrl('search', 'id:2801268', 'K'))
    .toBe('https://api.weatherapi.com/v1/search.json?key=K&q=id%3A2801268');
});

test('missing key → 500', async () => {
  const r = await handleProxy('weather', { q: 'Paris' }, undefined);
  expect(r.status).toBe(500);
  expect(r.body).toEqual({ error: 'Weather service not configured' });
});

test('missing or long q → 400', async () => {
  expect((await handleProxy('weather', {}, 'K')).status).toBe(400);
  expect((await handleProxy('weather', { q: 'x'.repeat(101) }, 'K')).status).toBe(400);
});

test('q with markup or odd characters → 400, upstream never called', async () => {
  let called = false;
  const spy = async () => {
    called = true;
    return { ok: true, status: 200, json: async () => ({}) };
  };
  expect((await handleProxy('weather', { q: '<script>' }, 'K', { fetchImpl: spy })).status).toBe(400);
  expect((await handleProxy('weather', { q: 'a&key=x' }, 'K', { fetchImpl: spy })).status).toBe(400);
  expect(called).toBe(false);
});

test('real place names, ids and coordinates are allowed', async () => {
  for (const q of ['São Paulo', "Côte d'Ivoire", 'id:2801268', '19.0761,72.8775', '-33.86,151.21', 'Saint-Étienne']) {
    expect((await handleProxy('search', { q }, 'K', { fetchImpl: ok([]) })).status, q).toBe(200);
  }
});

test('requests from other websites are refused', async () => {
  const r = await handleProxy('weather', { q: 'Paris' }, 'K', {
    fetchImpl: ok(fixture),
    headers: { 'sec-fetch-site': 'cross-site' },
  });
  expect(r.status).toBe(403);
  expect(r.body).toEqual({ error: 'Forbidden' });
});

test('same-origin browser requests and server tools are allowed', async () => {
  for (const headers of [{ 'sec-fetch-site': 'same-origin' }, {}]) {
    expect((await handleProxy('weather', { q: 'Paris' }, 'K', { fetchImpl: ok(fixture), headers })).status).toBe(200);
  }
});

test('extra params ignored, upstream 4xx message passed through', async () => {
  const calls = [];
  const fake = async (url) => {
    calls.push(url);
    return { ok: false, status: 400, json: async () => ({ error: { message: 'No matching location found.' } }) };
  };
  const r = await handleProxy('weather', { q: 'zzz', days: '14', key: 'evil' }, 'K', { fetchImpl: fake });
  expect(calls[0]).toBe(buildUpstreamUrl('weather', 'zzz', 'K'));
  expect(r.status).toBe(400);
  expect(r.body).toEqual({ error: 'No matching location found.' });
});

test('upstream key/quota problems are never shown to users', async () => {
  for (const status of [401, 403]) {
    const fake = async () => ({ ok: false, status, json: async () => ({ error: { message: 'API key is invalid.' } }) });
    const r = await handleProxy('weather', { q: 'Paris' }, 'K', { fetchImpl: fake });
    expect(r.status).toBe(502);
    expect(r.body).toEqual({ error: 'Weather service unavailable. Please try again later.' });
  }
});

test('weather responses are trimmed to the app model', async () => {
  const r = await handleProxy('weather', { q: 'Mumbai' }, 'K', { fetchImpl: ok(fixture) });
  expect(r.status).toBe(200);
  expect(r.body.location.tzId).toBe(fixture.location.tz_id);
  expect(r.body.days).toHaveLength(3);
  expect(r.body.forecast).toBeUndefined();
  expect(r.headers['Cache-Control']).toBe('public, s-maxage=300, stale-while-revalidate=600');
});

test('search responses are trimmed to place fields', async () => {
  const raw = [{ id: 7, name: 'Pune', region: 'MH', country: 'India', lat: 18.5, lon: 73.9, url: 'pune-x' }];
  const r = await handleProxy('search', { q: 'Pune' }, 'K', { fetchImpl: ok(raw) });
  expect(r.body).toEqual([{ id: 7, name: 'Pune', region: 'MH', country: 'India', lat: 18.5, lon: 73.9 }]);
});

test('network failure → 502', async () => {
  const fake = async () => {
    throw new Error('ECONNRESET');
  };
  const r = await handleProxy('weather', { q: 'Paris' }, 'K', { fetchImpl: fake });
  expect(r.status).toBe(502);
  expect(r.body).toEqual({ error: 'Weather service unreachable' });
});

test('rate limiter allows a burst, then answers 429 until the window passes', async () => {
  let now = 0;
  const limiter = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => now });
  const call = () => handleProxy('search', { q: 'Pune' }, 'K', { fetchImpl: ok([]), ip: '1.2.3.4', limiter });
  for (let i = 0; i < 3; i++) expect((await call()).status).toBe(200);
  const blocked = await call();
  expect(blocked.status).toBe(429);
  expect(blocked.headers['Retry-After']).toBe('60');
  // another visitor is unaffected
  expect((await handleProxy('search', { q: 'Pune' }, 'K', { fetchImpl: ok([]), ip: '5.6.7.8', limiter })).status).toBe(200);
  now = 60_001;
  expect((await call()).status).toBe(200);
});
