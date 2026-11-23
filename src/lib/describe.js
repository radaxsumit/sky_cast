// Plain-language descriptions for the detail tiles.

export function uvLabel(uv) {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very high';
  return 'Extreme';
}

export function pressureLabel(mb) {
  if (mb < 1009) return 'Low';
  if (mb > 1022) return 'High';
  return 'Normal';
}

export function cloudLabel(pct) {
  if (pct < 10) return 'Clear';
  if (pct < 50) return 'Partly cloudy';
  if (pct < 85) return 'Mostly cloudy';
  return 'Overcast';
}

export function feelsLikeNote({ tempC, feelsC, humidity, windKph }) {
  const diff = feelsC - tempC;
  if (Math.abs(diff) < 1.5) return 'Similar to the actual temperature';
  if (diff > 0) return humidity >= 60 ? 'Humidity makes it feel warmer' : 'Feels warmer than it is';
  return windKph >= 15 ? 'Wind makes it feel colder' : 'Feels cooler than it is';
}

// Temperature → colour, for range bars. Stops in °C.
const STOPS = [
  [-10, '#7c9cff'],
  [0, '#60c3ff'],
  [10, '#5fe0c0'],
  [20, '#ffd25e'],
  [30, '#ff9a4d'],
  [40, '#ff5a5f'],
];

export function tempColor(c) {
  const t = Math.min(40, Math.max(-10, c));
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    const [t0, c0] = STOPS[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      const a = [1, 3, 5].map((j) => parseInt(c0.slice(j, j + 2), 16));
      const b = [1, 3, 5].map((j) => parseInt(c1.slice(j, j + 2), 16));
      return `#${a.map((v, j) => Math.round(v + (b[j] - v) * k).toString(16).padStart(2, '0')).join('')}`;
    }
  }
  return STOPS.at(-1)[1];
}
