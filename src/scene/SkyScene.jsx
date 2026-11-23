import { arcPosition } from './arc.js';
import { Celestial } from './layers/Celestial.jsx';
import { Clouds } from './layers/Clouds.jsx';
import { FogVeil } from './layers/FogVeil.jsx';
import { Lightning } from './layers/Lightning.jsx';
import { Precipitation } from './layers/Precipitation.jsx';
import { SkyGradient } from './layers/SkyGradient.jsx';
import { Stars } from './layers/Stars.jsx';

const HORIZON_GLOW = { dawn: '#ff9f7a', golden: '#ffb35c', dusk: '#ff7b6b' };

// The living sky behind the whole app. Layers back→front: gradient, stars, sun/moon glow, clouds,
// precipitation, fog/haze, lightning. Purely decorative.
export function SkyScene({ scene, reducedMotion = false }) {
  const glow = HORIZON_GLOW[scene.phase];
  const sun = arcPosition(scene.body.progress);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b1530]">
      <SkyGradient sky={scene.sky} reducedMotion={reducedMotion} />
      {glow && (
        <div
          className="absolute inset-0 transition-opacity duration-[1500ms]"
          style={{
            opacity: 0.55 * (1 - scene.dim),
            background: `radial-gradient(ellipse 70% 45% at ${sun.left}% 100%, ${glow}aa 0%, transparent 70%)`,
          }}
        />
      )}
      <Stars amount={scene.stars} reducedMotion={reducedMotion} />
      <Celestial body={scene.body} phase={scene.phase} clouds={scene.clouds} />
      <Clouds amount={scene.clouds} phase={scene.phase} dim={scene.dim} reducedMotion={reducedMotion} />
      {!reducedMotion && <Precipitation kind={scene.precip} intensity={scene.precipIntensity} />}
      <FogVeil amount={scene.fog} group={scene.group} phase={scene.phase} reducedMotion={reducedMotion} />
      {!reducedMotion && scene.lightning && <Lightning />}
      {/* Soft vignette keeps glass UI readable at the edges. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,10,30,0.28)_100%)]" />
    </div>
  );
}
