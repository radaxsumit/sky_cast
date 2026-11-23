import { arcPosition } from '../arc.js';

// Sun or moon placed along a wide arc across the upper sky, from scene.body.progress (0 = rising, 1 = setting).

const MOON_ILLUMINATION = {
  'New Moon': [0, true],
  'Waxing Crescent': [0.25, true],
  'First Quarter': [0.5, true],
  'Waxing Gibbous': [0.75, true],
  'Full Moon': [1, true],
  'Waning Gibbous': [0.75, false],
  'Last Quarter': [0.5, false],
  'Waning Crescent': [0.25, false],
};

const SUN_COLOURS = {
  dawn: ['#ffe2b8', '#ff9a5c'],
  golden: ['#fff0c2', '#ffb347'],
  dusk: ['#ffd2a8', '#ff7a59'],
  day: ['#fffbe8', '#ffd76a'],
  night: ['#fffbe8', '#ffd76a'],
};

function Sun({ phase, size }) {
  const [core, glow] = SUN_COLOURS[phase] ?? SUN_COLOURS.day;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute rounded-full"
        style={{
          inset: -size * 2.2,
          background: `radial-gradient(circle, ${glow}66 0%, ${glow}22 30%, transparent 62%)`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 40% 38%, #ffffff 0%, ${core} 45%, ${glow} 100%)`,
          boxShadow: `0 0 ${size * 0.6}px ${size * 0.15}px ${glow}aa`,
        }}
      />
    </div>
  );
}

function moonPath(r, fraction, waxing) {
  // Lit limb is a half circle; the terminator is a half ellipse whose width depends on illumination.
  const rx = Math.abs(1 - 2 * fraction) * r;
  const limbSweep = waxing ? 1 : 0;
  const termSweep = fraction > 0.5 ? limbSweep : 1 - limbSweep;
  return `M ${r} 0 A ${r} ${r} 0 0 ${limbSweep} ${r} ${2 * r} A ${rx} ${r} 0 0 ${termSweep} ${r} 0 Z`;
}

function Moon({ moonPhase, size }) {
  const [fraction, waxing] = MOON_ILLUMINATION[moonPhase] ?? [1, true];
  const r = size / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute rounded-full"
        style={{ inset: -size * 1.6, background: 'radial-gradient(circle, #dfe7ff33 0%, transparent 60%)' }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative">
        <defs>
          <radialGradient id="moon-lit" cx="40%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#fbfcff" />
            <stop offset="100%" stopColor="#c9d2ea" />
          </radialGradient>
        </defs>
        <circle cx={r} cy={r} r={r} fill="#ffffff" opacity="0.06" />
        {fraction > 0 && <path d={moonPath(r, fraction, waxing)} fill="url(#moon-lit)" />}
        <circle cx={r * 0.7} cy={r * 0.8} r={r * 0.14} fill="#aeb8d6" opacity="0.35" />
        <circle cx={r * 1.25} cy={r * 1.3} r={r * 0.1} fill="#aeb8d6" opacity="0.3" />
      </svg>
    </div>
  );
}

export function Celestial({ body, phase, clouds }) {
  const { left, top } = arcPosition(body.progress);
  const veiled = Math.max(0.18, 1 - Math.max(0, clouds - 0.45) * 1.5);
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-[left,top,opacity] duration-[2000ms] ease-out"
      style={{ left: `${left}%`, top: `${top}%`, opacity: veiled }}
    >
      <div className="scale-[0.65] md:scale-90 xl:scale-100">
        {body.kind === 'sun' ? <Sun phase={phase} size={88} /> : <Moon moonPhase={body.moonPhase} size={68} />}
      </div>
    </div>
  );
}
