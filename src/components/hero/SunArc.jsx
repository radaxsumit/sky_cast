import { motion } from 'motion/react';

// Daylight arc (FigJam "Calicut" card): dashed path sunrise→sunset, a dot at "now", time left beneath.
const W = 260;
const H = 120;
const R = 112;
const CX = W / 2;
const CY = H - 6;

const pointAt = (p) => {
  const a = Math.PI - p * Math.PI;
  return [CX + R * Math.cos(a), CY - R * Math.sin(a)];
};

function remaining(minutesNow, sunsetMin, sunriseMin) {
  if (sunriseMin == null || sunsetMin == null || sunsetMin <= sunriseMin) return null;
  const fmt = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
  if (minutesNow < sunriseMin) return `Sunrise in ${fmt(sunriseMin - minutesNow)}`;
  if (minutesNow < sunsetMin) return `${fmt(sunsetMin - minutesNow)} of daylight left`;
  return `Sunrise in ${fmt(1440 - minutesNow + sunriseMin)}`;
}

export function SunArc({ body, sunrise, sunset, sunriseMin, sunsetMin, minutesNow }) {
  const isSun = body.kind === 'sun';
  const [x, y] = pointAt(isSun ? body.progress : body.progress < 0.5 ? 1 : 0);
  const path = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
  const note = remaining(minutesNow, sunsetMin, sunriseMin);

  return (
    <figure className="photo-ink w-full max-w-[220px] sm:max-w-[260px]" aria-label={`Sunrise ${sunrise}, sunset ${sunset}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" aria-hidden="true">
        <line x1={6} x2={W - 6} y1={CY} y2={CY} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        <path d={path} fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="3 6" />
        {isSun && (
          <motion.path
            d={path}
            fill="none"
            stroke="url(#arc-lit)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: body.progress }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        )}
        <defs>
          <linearGradient id="arc-lit" x1="0" x2="1">
            <stop offset="0" stopColor="#ffd28a" stopOpacity="0.4" />
            <stop offset="1" stopColor="#ffd28a" />
          </linearGradient>
          <radialGradient id="arc-dot">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor={isSun ? '#ffc04d' : '#c9d2ea'} />
          </radialGradient>
        </defs>
        <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}>
          <circle cx={x} cy={y} r={14} fill={isSun ? '#ffc04d' : '#dfe7ff'} opacity="0.25" />
          <circle cx={x} cy={y} r={7} fill="url(#arc-dot)" />
        </motion.g>
      </svg>
      <figcaption className="mt-2 flex justify-between text-sm">
        <span>
          <span className="block text-xs opacity-80">Sunrise</span>
          <span className="tabular font-semibold">{sunrise}</span>
        </span>
        <span className="text-right">
          <span className="block text-xs opacity-80">Sunset</span>
          <span className="tabular font-semibold">{sunset}</span>
        </span>
      </figcaption>
      {note && <p className="mt-1 text-center text-xs opacity-85">{note}</p>}
    </figure>
  );
}
