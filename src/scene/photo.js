// Picks the hero photograph for a resolved scene (phase of day + weather group).
// `shade` darkens day-time photos when they're shown at night or dusk.

const NIGHT = new Set(['night', 'dusk']);
const TWILIGHT = { dawn: 'dawn', golden: 'sunset', dusk: 'sunset' };

export function photoKey({ phase, group }) {
  const night = NIGHT.has(phase);
  const shade = phase === 'night' ? 0.55 : phase === 'dusk' ? 0.35 : 0;

  switch (group) {
    case 'clear':
      return { key: TWILIGHT[phase] ?? (night ? 'clear-night' : 'clear-day'), shade: 0 };
    case 'partly':
      return { key: TWILIGHT[phase] ?? (night ? 'cloudy-night' : 'partly-day'), shade: 0 };
    case 'cloudy':
    case 'overcast':
      return { key: night ? 'cloudy-night' : 'cloudy-day', shade: 0 };
    case 'drizzle':
    case 'rain':
    case 'sleet':
      return { key: night ? 'rain-night' : 'rain-day', shade: 0 };
    case 'thunder':
      return { key: 'thunder', shade: 0 };
    case 'snow':
    case 'fog':
    case 'haze':
      return { key: group, shade };
    default:
      return { key: night ? 'cloudy-night' : 'cloudy-day', shade: 0 };
  }
}
