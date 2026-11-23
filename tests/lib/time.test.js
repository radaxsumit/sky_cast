import { expect, test } from 'vitest';
import { parseClock, localMinutes, weekdayShort, currentHourIndex, formatLocalTime } from '../../src/lib/time.js';
import { convertTemp, convertWind } from '../../src/lib/units.js';

test('parseClock', () => {
  expect(parseClock('06:51 AM')).toBe(411);
  expect(parseClock('12:05 AM')).toBe(5);
  expect(parseClock('12:30 PM')).toBe(750);
  expect(parseClock('05:58 PM')).toBe(1078);
  expect(parseClock('No sunset')).toBeNull();
  expect(parseClock('No sunrise')).toBeNull();
});

test('localMinutes and currentHourIndex', () => {
  expect(localMinutes('2026-11-23 18:42')).toBe(1122);
  expect(localMinutes('2026-11-23 0:05')).toBe(5);
  expect(currentHourIndex('2026-11-23 23:30')).toBe(23);
  expect(currentHourIndex('2026-11-23 0:59')).toBe(0);
});

test('weekdayShort is timezone-safe', () => {
  expect(weekdayShort('2026-11-23')).toBe('Mon');
  expect(weekdayShort('2026-11-25')).toBe('Wed');
});

test('formatLocalTime uses the city timezone', () => {
  // 2026-11-23 13:00 UTC
  const epoch = Date.UTC(2026, 10, 23, 13, 0) / 1000;
  expect(formatLocalTime(epoch, 'Asia/Kolkata', { hour: '2-digit', minute: '2-digit', hour12: false })).toBe('18:30');
  expect(formatLocalTime(epoch, 'America/Los_Angeles', { hour: '2-digit', minute: '2-digit', hour12: false })).toBe('05:00');
});

test('unit conversion rounds', () => {
  expect(convertTemp(32.6, 90.7, 'C')).toBe(33);
  expect(convertTemp(32.6, 90.7, 'F')).toBe(91);
  expect(convertWind(7.6, 4.7, 'kph')).toBe(8);
  expect(convertWind(7.6, 4.7, 'mph')).toBe(5);
});
