import { expect, test } from 'vitest';
import { smoothPath, scaleTemps } from '../../src/lib/chart.js';

test('smoothPath passes through every point', () => {
  const d = smoothPath([[0, 10], [10, 0], [20, 10]]);
  expect(d.startsWith('M0,10')).toBe(true);
  expect(d).toContain(' 10,0');
  expect(d.endsWith(' 20,10')).toBe(true);
});

test('smoothPath handles 0 and 1 points', () => {
  expect(smoothPath([])).toBe('');
  expect(smoothPath([[5, 5]])).toBe('M5,5');
});

test('scaleTemps maps hottest to top padding and coldest to bottom', () => {
  expect(scaleTemps([10, 20, 15], 60, 8)).toEqual([52, 8, 30]);
  expect(scaleTemps([12, 12], 60, 8)).toEqual([30, 30]); // flat line centred
});
