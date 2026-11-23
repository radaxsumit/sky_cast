// Procedural cloud textures: SVG fractal noise rasterised once by the browser (as an <img>/background),
// then only moved with transforms, which keeps the animation on the compositor.

const cache = new Map();

/**
 * @param {object} o
 * @param {string} o.tint   rgb triplet "r,g,b" (0–255)
 * @param {number} o.cover  0–1, how much of the texture is cloud
 * @param {number} o.seed
 * @param {number} o.freq   base frequency (lower = bigger clouds)
 * @param {number} [o.softness] alpha ramp multiplier (lower = softer edges)
 */
export function cloudTexture({ tint, cover, seed, freq, softness = 2.4 }) {
  const key = `${tint}|${cover.toFixed(2)}|${seed}|${freq}|${softness}`;
  if (cache.has(key)) return cache.get(key);

  const [r, g, b] = tint.split(',').map((v) => (Number(v) / 255).toFixed(3));
  // alpha = softness * noise - offset; more cover → smaller offset → more cloud.
  const offset = (softness * (0.62 - cover * 0.3)).toFixed(3);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'>
<filter id='c' x='0' y='0' width='100%' height='100%'>
<feTurbulence type='fractalNoise' baseFrequency='${freq} ${freq * 2.2}' numOctaves='5' seed='${seed}' stitchTiles='stitch'/>
<feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} ${softness} 0 0 0 -${offset}'/>
<feGaussianBlur stdDeviation='1.2'/>
</filter>
<rect width='100%' height='100%' filter='url(#c)'/>
</svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  cache.set(key, url);
  return url;
}

export const CLOUD_TINTS = {
  day: '255,255,255',
  golden: '255,236,214',
  dawn: '255,214,222',
  dusk: '214,170,196',
  night: '120,132,170',
};
