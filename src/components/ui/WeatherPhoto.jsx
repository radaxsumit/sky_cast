import { AnimatePresence, motion } from 'motion/react';
import { photoKey } from '../../scene/photo.js';

// Free-licence photographs from Unsplash (credits in README), one per weather/time-of-day combination.
const files = import.meta.glob('../../assets/photos/*.webp', { eager: true, query: '?url', import: 'default' });
const PHOTOS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, -5), url]),
);

/** Cross-fading weather photograph that fills its (relatively positioned) parent. */
export function WeatherPhoto({ scene, className = '' }) {
  const { key, shade } = photoKey(scene);
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.img
          key={key}
          src={PHOTOS[key]}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
      {shade > 0 && <div className="absolute inset-0 bg-[#060b1c]" style={{ opacity: shade }} />}
    </div>
  );
}
