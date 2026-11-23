// US EPA index as reported by WeatherAPI (1–6).
export const AQI_LEVELS = [
  { label: 'Good', color: '#34d399' },
  { label: 'Moderate', color: '#facc15' },
  { label: 'Unhealthy for sensitive groups', color: '#fb923c' },
  { label: 'Unhealthy', color: '#f43f5e' },
  { label: 'Very unhealthy', color: '#a855f7' },
  { label: 'Hazardous', color: '#7f1d1d' },
];

export function aqiInfo(epa) {
  const level = Math.min(6, Math.max(1, Math.round(epa) || 1));
  return { level, ...AQI_LEVELS[level - 1] };
}
