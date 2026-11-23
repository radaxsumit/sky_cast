import { memo } from 'react';

// Deterministic pseudo-random so the star field doesn't reshuffle on every render.
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261123);
const STARS = Array.from({ length: 160 }, (_, i) => ({
  x: rand() * 100,
  y: Math.pow(rand(), 1.6) * 72, // denser near the top
  r: rand() < 0.08 ? 1.6 : 0.5 + rand() * 0.8,
  twinkle: i % 5 === 0,
  delay: rand() * 6,
}));

export const Stars = memo(function Stars({ amount, reducedMotion }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full transition-opacity duration-[1500ms]"
      style={{ opacity: amount }}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r * 0.09}
          fill="#fff"
          className={s.twinkle && !reducedMotion ? 'sky-twinkle' : undefined}
          style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
          opacity={s.r > 1.2 ? 0.95 : 0.7}
        />
      ))}
    </svg>
  );
});
