import { expect, test } from 'vitest';
import { createCache } from '../../src/lib/cache.js';
import { addCity, removeCity, MAX_SAVED } from '../../src/lib/savedCities.js';
import { createLatest } from '../../src/lib/latest.js';
import { locationQuery } from '../../src/lib/locationQuery.js';

test('cache hits within TTL and misses after', () => {
  let now = 1000;
  const cache = createCache(600_000, () => now);
  cache.set('pune', { t: 1 });
  now += 600_000;
  expect(cache.get('pune')).toEqual({ t: 1 });
  now += 1;
  expect(cache.get('pune')).toBeUndefined();
  expect(cache.get('nope')).toBeUndefined();
});

const city = (id) => ({ id, name: `C${id}`, region: '', country: 'X', lat: 0, lon: 0 });

test('addCity dedupes by id, newest first', () => {
  const list = addCity(addCity([], city(1)), city(2));
  expect(list.map((c) => c.id)).toEqual([2, 1]);
  expect(addCity(list, city(1)).map((c) => c.id)).toEqual([1, 2]);
});

test('addCity caps at 8, dropping the oldest', () => {
  expect(MAX_SAVED).toBe(8);
  let list = [];
  for (let i = 1; i <= 9; i++) list = addCity(list, city(i));
  expect(list).toHaveLength(8);
  expect(list.map((c) => c.id)).not.toContain(1);
  expect(list[0].id).toBe(9);
});

test('removeCity', () => {
  expect(removeCity([city(1), city(2)], 1).map((c) => c.id)).toEqual([2]);
});

test('createLatest only honours the newest token', () => {
  const latest = createLatest();
  const a = latest.next();
  const b = latest.next();
  expect(latest.isLatest(a)).toBe(false);
  expect(latest.isLatest(b)).toBe(true);
});

test('locationQuery', () => {
  expect(locationQuery({ id: 5, lat: 1, lon: 2 })).toBe('id:5');
  expect(locationQuery({ lat: 1, lon: 2 })).toBe('1,2');
  expect(locationQuery('Pune')).toBe('Pune');
  expect(locationQuery('  Pune ')).toBe('Pune');
});

test('locationQuery uses coordinates when the id is not a WeatherAPI id', () => {
  expect(locationQuery({ id: '19.07,72.88', lat: 19.07, lon: 72.88 })).toBe('19.07,72.88');
});

test('findSaved matches by nearby coordinates', async () => {
  const { findSaved } = await import('../../src/lib/savedCities.js');
  const list = [{ id: 1, name: 'Mumbai', lat: 19.07, lon: 72.88 }];
  expect(findSaved(list, 19.08, 72.87)?.id).toBe(1);
  expect(findSaved(list, 18.5, 73.85)).toBeUndefined();
});
