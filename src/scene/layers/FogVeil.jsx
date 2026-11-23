import { cloudTexture } from '../textures.js';

// Low, slow-drifting veil. Haze is warm and dusty, fog is cool and white.
export function FogVeil({ amount, group, phase, reducedMotion }) {
  if (amount <= 0) return null;
  const night = phase === 'night' || phase === 'dusk';
  const tint = group === 'haze' ? (night ? '120,104,92' : '226,206,170') : night ? '150,160,185' : '235,240,246';
  return (
    <div className="absolute inset-0 transition-opacity duration-[1500ms]" style={{ opacity: amount }}>
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, rgba(${tint},0.05) 0%, rgba(${tint},0.45) 55%, rgba(${tint},0.8) 100%)` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-3/4 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 45%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 45%)',
        }}
      >
        <div
          className={reducedMotion ? 'h-full w-[200%]' : 'sky-drift h-full w-[200%]'}
          style={{
            backgroundImage: cloudTexture({ tint, cover: 0.85, seed: 41, freq: 0.0012, softness: 1.4 }),
            backgroundSize: '50% 100%',
            backgroundRepeat: 'repeat-x',
            animationDuration: '320s',
            opacity: 0.7,
          }}
        />
      </div>
    </div>
  );
}
