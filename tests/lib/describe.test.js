import { expect, test } from 'vitest';
import { cloudLabel, feelsLikeNote, pressureLabel, tempColor, uvLabel } from '../../src/lib/describe.js';

test('uvLabel bands', () => {
  expect(uvLabel(0)).toBe('Low');
  expect(uvLabel(2.9)).toBe('Low');
  expect(uvLabel(3)).toBe('Moderate');
  expect(uvLabel(6)).toBe('High');
  expect(uvLabel(8)).toBe('Very high');
  expect(uvLabel(11)).toBe('Extreme');
});

test('pressureLabel', () => {
  expect(pressureLabel(1004)).toBe('Low');
  expect(pressureLabel(1013)).toBe('Normal');
  expect(pressureLabel(1025)).toBe('High');
});

test('cloudLabel', () => {
  expect(cloudLabel(5)).toBe('Clear');
  expect(cloudLabel(30)).toBe('Partly cloudy');
  expect(cloudLabel(70)).toBe('Mostly cloudy');
  expect(cloudLabel(95)).toBe('Overcast');
});

test('feelsLikeNote explains the difference', () => {
  expect(feelsLikeNote({ tempC: 30, feelsC: 30.8, humidity: 70, windKph: 5 })).toBe('Similar to the actual temperature');
  expect(feelsLikeNote({ tempC: 30, feelsC: 36, humidity: 70, windKph: 5 })).toBe('Humidity makes it feel warmer');
  expect(feelsLikeNote({ tempC: 30, feelsC: 33, humidity: 30, windKph: 5 })).toBe('Feels warmer than it is');
  expect(feelsLikeNote({ tempC: 5, feelsC: 1, humidity: 50, windKph: 25 })).toBe('Wind makes it feel colder');
  expect(feelsLikeNote({ tempC: 5, feelsC: 2, humidity: 50, windKph: 5 })).toBe('Feels cooler than it is');
});

test('tempColor runs cold blue → hot red, clamped', () => {
  expect(tempColor(-30)).toBe(tempColor(-10));
  expect(tempColor(50)).toBe(tempColor(40));
  expect(tempColor(-10)).not.toBe(tempColor(40));
  expect(tempColor(20)).toMatch(/^#[0-9a-f]{6}$/);
});
