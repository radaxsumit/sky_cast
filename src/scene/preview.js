// `?scene=<phase>[,<conditionCode>]` overrides the live scene so every look can be checked on demand,
// e.g. ?scene=dusk,1195 (heavy rain at dusk) or ?scene=night (tonight's weather, at midnight).
const PHASE_TIME = {
  dawn: (s) => s.sunriseMin ?? 400,
  day: (s) => Math.floor(((s.sunriseMin ?? 400) + (s.sunsetMin ?? 1080)) / 2),
  golden: (s) => (s.sunsetMin ?? 1080) - 53,
  dusk: (s) => s.sunsetMin ?? 1080,
  night: () => 0,
};

export function applyScenePreview(input, search) {
  const raw = new URLSearchParams(search).get('scene');
  if (!raw) return input;
  const [phase, code] = raw.split(',');
  if (!PHASE_TIME[phase]) return input;
  const next = { ...input, minutesNow: PHASE_TIME[phase](input), isDay: phase !== 'night' && phase !== 'dusk' };
  if (code && Number.isFinite(Number(code))) Object.assign(next, { code: Number(code), text: '' });
  return next;
}
