import { expect, test } from 'vitest';
import fixture from '../fixtures/forecast.json';
import { normalizeForecast } from '../../src/lib/normalize.js';
import { parseClock } from '../../src/lib/time.js';

const m = normalizeForecast(fixture);

test('location', () => {
  expect(m.location.name).toBe(fixture.location.name);
  expect(m.location.tzId).toBe(fixture.location.tz_id);
  expect(m.location.localtimeEpoch).toBe(fixture.location.localtime_epoch);
});

test('current', () => {
  expect(typeof m.current.isDay).toBe('boolean');
  expect(m.current.code).toBe(fixture.current.condition.code);
  expect(m.current.windDegree).toBe(fixture.current.wind_degree);
  expect(m.current.aqi).toEqual({ epa: fixture.current.air_quality['us-epa-index'], pm25: fixture.current.air_quality.pm2_5 });
  expect(m.current.dewpointC).toBe(fixture.current.dewpoint_c);
});

test('days and hours', () => {
  expect(m.days).toHaveLength(3);
  expect(m.days[0].hours).toHaveLength(24);
  expect(m.days[0].weekday).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
  expect(m.days[0].astro.sunriseMin).toBe(parseClock(fixture.forecast.forecastday[0].astro.sunrise));
  expect(m.days[0].astro.moonPhase).toBe(fixture.forecast.forecastday[0].astro.moon_phase);
  expect(m.days[1].hours[0].time).toBe('00:00');
  expect(typeof m.days[1].hours[0].isDay).toBe('boolean');
});

test('missing air quality → null', () => {
  const raw = structuredClone(fixture);
  delete raw.current.air_quality;
  expect(normalizeForecast(raw).current.aqi).toBeNull();
});
