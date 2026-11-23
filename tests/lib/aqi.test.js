import { expect, test } from 'vitest';
import { aqiInfo } from '../../src/lib/aqi.js';

test('US EPA labels', () => {
  expect(aqiInfo(1).label).toBe('Good');
  expect(aqiInfo(2).label).toBe('Moderate');
  expect(aqiInfo(3).label).toBe('Unhealthy for sensitive groups');
  expect(aqiInfo(4).label).toBe('Unhealthy');
  expect(aqiInfo(5).label).toBe('Very unhealthy');
  expect(aqiInfo(6).label).toBe('Hazardous');
  expect(aqiInfo(4).level).toBe(4);
  expect(typeof aqiInfo(4).color).toBe('string');
});
