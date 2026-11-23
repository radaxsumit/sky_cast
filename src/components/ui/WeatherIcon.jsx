import { iconName } from '../../lib/iconMap.js';

// Meteocons animated SVGs (MIT, Bas Milius). Emitted as separate assets; only the ones shown are fetched.
const files = import.meta.glob('/node_modules/@bybas/weather-icons/production/fill/all/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const urls = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, -4), url]),
);

export function MetIcon({ name, size = 48, alt = '', className = '' }) {
  const src = urls[name] ?? urls['not-available'];
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`select-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function WeatherIcon({ code, isDay = true, text = '', size = 48, className = '' }) {
  return <MetIcon name={iconName(code, isDay, text)} size={size} alt={text} className={className} />;
}
