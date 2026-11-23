import { expect, test } from 'vitest';
import { iconName } from '../../src/lib/iconMap.js';

test.each([
  [1000, true, undefined, 'clear-day'],
  [1000, false, undefined, 'clear-night'],
  [1003, false, undefined, 'partly-cloudy-night'],
  [1006, true, undefined, 'cloudy'],
  [1009, true, undefined, 'overcast-day'],
  [1030, true, 'Smoky Haze', 'haze-day'],
  [1036, false, 'Smoky haze', 'haze-night'],
  [1135, false, undefined, 'fog-night'],
  [1183, true, undefined, 'partly-cloudy-day-rain'],
  [1195, true, undefined, 'rain'],
  [1153, true, undefined, 'drizzle'],
  [1225, true, undefined, 'snow'],
  [1213, false, undefined, 'partly-cloudy-night-snow'],
  [1207, true, undefined, 'sleet'],
  [1087, true, undefined, 'thunderstorms-day'],
  [1276, false, undefined, 'thunderstorms-night-rain'],
  [1282, true, undefined, 'thunderstorms-day-snow'],
  [9999, true, undefined, 'cloudy'],
])('iconName(%i, %s, %s) → %s', (code, isDay, text, expected) => {
  expect(iconName(code, isDay, text)).toBe(expected);
});

test('every mapped icon exists in the package', async () => {
  const { readdirSync } = await import('node:fs');
  const files = new Set(readdirSync('node_modules/@bybas/weather-icons/production/fill/all'));
  for (let code = 1000; code <= 1300; code++) {
    for (const isDay of [true, false]) {
      expect(files.has(`${iconName(code, isDay)}.svg`), `${code}/${isDay}`).toBe(true);
    }
  }
});
