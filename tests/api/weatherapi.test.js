import { expect, test } from 'vitest';
import { buildUpstreamUrl, handleProxy } from '../../api/_lib/weatherapi.js';

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

test('extra params ignored, upstream status passed through', async () => {
  const calls = [];
  const fake = async (url) => {
    calls.push(url);
    return { ok: false, status: 400, json: async () => ({ error: { message: 'No matching location found.' } }) };
  };
  const r = await handleProxy('weather', { q: 'zzz', days: '14', key: 'evil' }, 'K', fake);
  expect(calls[0]).toBe(buildUpstreamUrl('weather', 'zzz', 'K'));
  expect(r.status).toBe(400);
  expect(r.body).toEqual({ error: 'No matching location found.' });
});

test('success sets cache header', async () => {
  const fake = async () => ({ ok: true, status: 200, json: async () => ({ ok: 1 }) });
  const r = await handleProxy('search', { q: 'Lon' }, 'K', fake);
  expect(r.status).toBe(200);
  expect(r.body).toEqual({ ok: 1 });
  expect(r.headers['Cache-Control']).toBe('public, s-maxage=300, stale-while-revalidate=600');
});

test('network failure → 502', async () => {
  const fake = async () => { throw new Error('ECONNRESET'); };
  const r = await handleProxy('weather', { q: 'Paris' }, 'K', fake);
  expect(r.status).toBe(502);
  expect(r.body).toEqual({ error: 'Weather service unreachable' });
});
