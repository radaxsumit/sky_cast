// Sky gradients per phase of the day: top of the screen → horizon.
export const PALETTES = {
  night: { top: '#050816', mid: '#0d1736', bottom: '#1f2d5c' },
  dawn: { top: '#27336b', mid: '#b86f95', bottom: '#ffc49c' },
  day: { top: '#1f6fd6', mid: '#5aa6ef', bottom: '#cfe7ff' },
  golden: { top: '#2f62b5', mid: '#e99a63', bottom: '#ffd793' },
  dusk: { top: '#161a45', mid: '#5f3a78', bottom: '#ee8466' },
};

// How strongly each weather group greys out and darkens the sky (0–1).
export const DIM = {
  clear: 0,
  partly: 0,
  cloudy: 0.15,
  overcast: 0.4,
  fog: 0.2,
  haze: 0.15,
  drizzle: 0.3,
  rain: 0.45,
  snow: 0.25,
  sleet: 0.35,
  thunder: 0.6,
};

// Minimum cloud cover drawn for each group, regardless of the reported %.
export const CLOUD_FLOOR = {
  clear: 0,
  partly: 0.4,
  cloudy: 0.7,
  overcast: 0.9,
  fog: 0.5,
  haze: 0.3,
  drizzle: 0.8,
  rain: 0.9,
  snow: 0.9,
  sleet: 0.9,
  thunder: 0.9,
};

export const FOG = { fog: 0.6, haze: 0.4 };
