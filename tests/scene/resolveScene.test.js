import { describe, expect, test } from 'vitest';
import { resolveScene } from '../../src/scene/resolveScene.js';

// Sunrise 06:51 (411), sunset 17:58 (1078)
const base = { sunriseMin: 411, sunsetMin: 1078, isDay: true, code: 1000, cloud: 0 };
const at = (minutesNow, extra = {}) => resolveScene({ ...base, minutesNow, ...extra });

describe('phase', () => {
  test('dawn window is sunrise ±45 inclusive', () => {
    expect(at(411).phase).toBe('dawn');
    expect(at(366, { isDay: false }).phase).toBe('dawn');
    expect(at(456).phase).toBe('dawn');
    expect(at(457).phase).toBe('day');
  });
  test('golden hour then dusk (dusk wins overlap)', () => {
    expect(at(1017).phase).toBe('day');
    expect(at(1018).phase).toBe('golden');
    expect(at(1032).phase).toBe('golden');
    expect(at(1033).phase).toBe('dusk');
    expect(at(1123, { isDay: false }).phase).toBe('dusk');
  });
  test('night outside the windows', () => {
    expect(at(1124, { isDay: false }).phase).toBe('night');
    expect(at(120, { isDay: false }).phase).toBe('night');
  });
});

describe('celestial body', () => {
  test('sun at solar noon is halfway along the arc', () => {
    const s = at(744.5);
    expect(s.body.kind).toBe('sun');
    expect(s.body.progress).toBeCloseTo(0.5, 2);
  });
  test('moon at night, with phase passed through', () => {
    const s = at(120, { isDay: false, moonPhase: 'Full Moon' });
    expect(s.body.kind).toBe('moon');
    expect(s.body.moonPhase).toBe('Full Moon');
    expect(s.body.progress).toBeGreaterThan(0);
    expect(s.body.progress).toBeLessThan(1);
  });
  test('moon progress is continuous across midnight', () => {
    const before = at(1439, { isDay: false }).body.progress;
    const after = at(0, { isDay: false }).body.progress;
    expect(after).toBeGreaterThan(before);
    expect(after - before).toBeLessThan(0.01);
  });
});

describe('polar days', () => {
  test('no sunrise/sunset falls back to isDay without NaN', () => {
    const night = at(600, { sunriseMin: null, sunsetMin: null, isDay: false });
    expect(night.phase).toBe('night');
    expect(night.body.kind).toBe('moon');
    expect(Number.isFinite(night.body.progress)).toBe(true);
    const day = at(600, { sunriseMin: null, sunsetMin: null, isDay: true });
    expect(day.phase).toBe('day');
    expect(day.body.progress).toBe(0.5);
  });
});

describe('weather layering', () => {
  test('stars only on clear nights', () => {
    expect(at(120, { isDay: false, code: 1000 }).stars).toBeGreaterThan(0.5);
    expect(at(120, { isDay: false, code: 1009 }).stars).toBe(0);
    expect(at(700).stars).toBe(0);
  });
  test('precipitation and lightning', () => {
    expect(at(700, { code: 1195 })).toMatchObject({ precip: 'rain', precipIntensity: 1 });
    expect(at(700, { code: 1225 })).toMatchObject({ precip: 'snow' });
    expect(at(700, { code: 1276 }).lightning).toBe(true);
    expect(at(700).precip).toBe('none');
  });
  test('cloud floors per group', () => {
    expect(at(700, { code: 1003 }).clouds).toBeGreaterThanOrEqual(0.4);
    expect(at(700, { code: 1009 }).clouds).toBeGreaterThanOrEqual(0.9);
    expect(at(700, { code: 1000, cloud: 25 }).clouds).toBeCloseTo(0.25);
  });
  test('overcast dims, fog/haze veil', () => {
    expect(at(700, { code: 1009 }).dim).toBeGreaterThan(0.3);
    expect(at(700).dim).toBe(0);
    expect(at(700, { code: 1135 }).fog).toBe(0.6);
    expect(at(700, { code: 1036, text: 'Smoky haze' }).fog).toBe(0.4);
  });
});

describe('glass and colours', () => {
  test('glass tint follows phase', () => {
    expect(at(700).glass).toBe('light');
    expect(at(1025).glass).toBe('light'); // golden
    expect(at(1078).glass).toBe('dark'); // dusk
    expect(at(120, { isDay: false }).glass).toBe('dark');
  });
  test('sky colours are hex and differ between noon and midnight', () => {
    const noon = at(744).sky;
    const night = at(0, { isDay: false }).sky;
    for (const c of Object.values(noon)) expect(c).toMatch(/^#[0-9a-f]{6}$/);
    expect(noon.top).not.toBe(night.top);
  });
  test('colours blend near a phase boundary', () => {
    const mid = at(800).sky.top;
    const nearGolden = at(1010).sky.top; // within 20 min of golden
    expect(nearGolden).not.toBe(mid);
  });
  test('key combines phase and group for cross-fades', () => {
    expect(at(700, { code: 1195 }).key).toBe('day-rain');
  });
});
