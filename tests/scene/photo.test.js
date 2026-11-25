import { expect, test } from 'vitest';
import { photoKey } from '../../src/scene/photo.js';

const s = (phase, group) => ({ phase, group });

test('clear sky follows the time of day', () => {
  expect(photoKey(s('day', 'clear'))).toEqual({ key: 'clear-day', shade: 0 });
  expect(photoKey(s('dawn', 'clear')).key).toBe('dawn');
  expect(photoKey(s('golden', 'clear')).key).toBe('sunset');
  expect(photoKey(s('dusk', 'partly')).key).toBe('sunset');
  expect(photoKey(s('night', 'clear')).key).toBe('clear-night');
});

test('clouds by day and night', () => {
  expect(photoKey(s('day', 'partly')).key).toBe('partly-day');
  expect(photoKey(s('night', 'partly')).key).toBe('cloudy-night');
  expect(photoKey(s('day', 'overcast')).key).toBe('cloudy-day');
  expect(photoKey(s('golden', 'cloudy')).key).toBe('cloudy-day');
  expect(photoKey(s('night', 'cloudy')).key).toBe('cloudy-night');
});

test('precipitation and storms', () => {
  expect(photoKey(s('day', 'rain')).key).toBe('rain-day');
  expect(photoKey(s('day', 'drizzle')).key).toBe('rain-day');
  expect(photoKey(s('night', 'rain')).key).toBe('rain-night');
  expect(photoKey(s('dusk', 'sleet')).key).toBe('rain-night');
  expect(photoKey(s('day', 'thunder')).key).toBe('thunder');
  expect(photoKey(s('day', 'snow')).key).toBe('snow');
});

test('day-only photos get shaded at night', () => {
  expect(photoKey(s('night', 'snow'))).toEqual({ key: 'snow', shade: 0.55 });
  expect(photoKey(s('night', 'fog'))).toEqual({ key: 'fog', shade: 0.55 });
  expect(photoKey(s('dusk', 'haze'))).toEqual({ key: 'haze', shade: 0.35 });
  expect(photoKey(s('day', 'haze')).shade).toBe(0);
});
