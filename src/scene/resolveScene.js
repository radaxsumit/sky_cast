import { conditionInfo } from '../lib/conditions.js';
import { CLOUD_FLOOR, DIM, FOG, PALETTES } from './palettes.js';

const DAY = 1440;
const TWILIGHT = 45; // dawn/dusk half-window, minutes
const GOLDEN = 60; // golden hour starts this long before sunset
const BLEND = 20; // colours blend within this many minutes of a phase boundary

const clamp01 = (n) => Math.min(1, Math.max(0, n));

function phaseAt(now, sunrise, sunset, isDay) {
  if (sunrise == null || sunset == null) return isDay ? 'day' : 'night';
  if (Math.abs(now - sunset) <= TWILIGHT) return 'dusk';
  if (Math.abs(now - sunrise) <= TWILIGHT) return 'dawn';
  if (now >= sunset - GOLDEN && now < sunset - TWILIGHT) return 'golden';
  if (now > sunrise + TWILIGHT && now < sunset - GOLDEN) return 'day';
  return 'night';
}

function bodyAt(now, sunrise, sunset, isDay, moonPhase) {
  if (sunrise == null || sunset == null) {
    return isDay ? { kind: 'sun', progress: 0.5 } : { kind: 'moon', progress: 0.5, moonPhase };
  }
  if (now >= sunrise && now <= sunset) {
    return { kind: 'sun', progress: clamp01((now - sunrise) / (sunset - sunrise)) };
  }
  const nightLength = DAY - (sunset - sunrise);
  return { kind: 'moon', progress: clamp01(((now - sunset + DAY) % DAY) / nightLength), moonPhase };
}

// --- colour maths -------------------------------------------------------------
const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
const mix = (a, b, t) => toHex(toRgb(a).map((v, i) => v + (toRgb(b)[i] - v) * t));
const mixPalette = (a, b, t) => ({ top: mix(a.top, b.top, t), mid: mix(a.mid, b.mid, t), bottom: mix(a.bottom, b.bottom, t) });

function dimColour(hex, dim) {
  if (!dim) return hex;
  const [r, g, b] = toRgb(hex);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  const desat = [r, g, b].map((v) => v + (luma - v) * dim * 0.75);
  return toHex(desat.map((v) => v * (1 - dim * 0.35)));
}

function skyAt(now, sunrise, sunset, phase) {
  const own = PALETTES[phase];
  if (sunrise == null || sunset == null) return own;
  const boundaries = [
    [sunrise - TWILIGHT, 'night', 'dawn'],
    [sunrise + TWILIGHT, 'dawn', 'day'],
    [sunset - GOLDEN, 'day', 'golden'],
    [sunset - TWILIGHT, 'golden', 'dusk'],
    [sunset + TWILIGHT, 'dusk', 'night'],
  ];
  let nearest = null;
  for (const b of boundaries) {
    const dist = Math.abs(now - b[0]);
    if (dist < BLEND && (!nearest || dist < nearest.dist)) nearest = { dist, at: b[0], before: b[1], after: b[2] };
  }
  if (!nearest) return own;
  const other = now < nearest.at ? nearest.after : nearest.before;
  if (other === phase) return own;
  return mixPalette(own, PALETTES[other], 0.5 - (nearest.dist / BLEND) * 0.5);
}

/**
 * Turns local time + current weather into everything the sky needs to draw.
 * @returns {{phase, sky, body, stars, clouds, dim, fog, precip, precipIntensity, lightning, glass, key}}
 */
export function resolveScene({ minutesNow, sunriseMin: rise, sunsetMin: set, isDay, code, text = '', cloud = 0, moonPhase }) {
  // Near the poles the sun can set after midnight (sunset < sunrise) or the times can coincide.
  // Those days have no usable arc, so treat them like polar day/night and trust the API's isDay.
  const usable = rise != null && set != null && set > rise;
  const sunriseMin = usable ? rise : null;
  const sunsetMin = usable ? set : null;
  const info = conditionInfo(code, text);
  const phase = phaseAt(minutesNow, sunriseMin, sunsetMin, isDay);
  const dim = DIM[info.group];
  const clouds = Math.max(clamp01(cloud / 100), CLOUD_FLOOR[info.group]);
  const base = skyAt(minutesNow, sunriseMin, sunsetMin, phase);
  const clearness = clouds > 0.6 ? 0 : 1 - clouds * 0.8;

  return {
    phase,
    sky: { top: dimColour(base.top, dim), mid: dimColour(base.mid, dim), bottom: dimColour(base.bottom, dim) },
    body: bodyAt(minutesNow, sunriseMin, sunsetMin, isDay, moonPhase),
    stars: phase === 'night' ? clearness : phase === 'dusk' || phase === 'dawn' ? clearness * 0.35 : 0,
    clouds,
    dim,
    fog: FOG[info.group] ?? 0,
    precip: info.precip,
    precipIntensity: info.intensity,
    lightning: info.lightning,
    glass: phase === 'night' || phase === 'dusk' ? 'dark' : 'light',
    group: info.group,
    key: `${phase}-${info.group}`,
  };
}
