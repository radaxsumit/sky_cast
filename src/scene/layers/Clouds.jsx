import { CLOUD_TINTS, cloudTexture } from '../textures.js';

// Two procedural cloud decks drifting at different speeds for parallax depth.
const DECKS = [
  { seed: 7, freq: 0.0016, speed: 260, opacity: 0.75, top: '-8%', height: '78%', softness: 2.2 },
  { seed: 23, freq: 0.0026, speed: 150, opacity: 0.9, top: '18%', height: '70%', softness: 2.8 },
];

export function Clouds({ amount, phase, dim, reducedMotion }) {
  if (amount <= 0.02) return null;
  const tint = CLOUD_TINTS[phase] ?? CLOUD_TINTS.day;
  // Heavier weather greys the clouds themselves, not just the sky.
  const grey = dim > 0.25 ? blendTint(tint, '150,158,176', Math.min(1, dim * 1.2)) : tint;

  return (
    <>
      {DECKS.map((d, i) => (
        <div
          key={d.seed}
          className="absolute inset-x-0 overflow-hidden transition-opacity duration-[1500ms]"
          style={{
            top: d.top,
            height: d.height,
            opacity: d.opacity * Math.min(1, amount * (i === 0 ? 1.1 : 1)),
            maskImage: 'linear-gradient(180deg, transparent 0%, #000 22%, #000 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 22%, #000 70%, transparent 100%)',
          }}
        >
          <div
            className={reducedMotion ? 'h-full w-[200%]' : 'sky-drift h-full w-[200%]'}
            style={{
              backgroundImage: cloudTexture({ tint: grey, cover: amount, seed: d.seed, freq: d.freq, softness: d.softness }),
              backgroundSize: '50% 100%',
              backgroundRepeat: 'repeat-x',
              animationDuration: `${d.speed}s`,
            }}
          />
        </div>
      ))}
    </>
  );
}

function blendTint(a, b, t) {
  const pa = a.split(',').map(Number);
  const pb = b.split(',').map(Number);
  return pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',');
}
