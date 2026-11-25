import { expect, test } from 'vitest';
import { applyScenePreview } from '../../src/scene/preview.js';

const input = { minutesNow: 700, sunriseMin: 411, sunsetMin: 1078, isDay: true, code: 1000, text: 'Sunny', cloud: 0 };

test('no param → unchanged', () => {
  expect(applyScenePreview(input, '')).toBe(input);
  expect(applyScenePreview(input, '?q=1')).toBe(input);
});

test('phase + code override', () => {
  const out = applyScenePreview(input, '?scene=dusk,1195');
  expect(out).toMatchObject({ minutesNow: 1078, isDay: false, code: 1195, text: '' });
});

test('phase only keeps the code', () => {
  expect(applyScenePreview(input, '?scene=night')).toMatchObject({ minutesNow: 0, isDay: false, code: 1000 });
  expect(applyScenePreview(input, '?scene=golden')).toMatchObject({ minutesNow: 1025, isDay: true });
  expect(applyScenePreview(input, '?scene=dawn')).toMatchObject({ minutesNow: 411 });
  expect(applyScenePreview(input, '?scene=day')).toMatchObject({ minutesNow: 744 });
});

test('unknown phase ignored', () => {
  expect(applyScenePreview(input, '?scene=noon')).toBe(input);
});
