import { conditionInfo } from './conditions.js';

// Maps a WeatherAPI condition to a Meteocons (animated "fill") icon basename.
export function iconName(code, isDay, text) {
  const tod = isDay ? 'day' : 'night';
  const { group, precip, intensity } = conditionInfo(code, text);
  const light = intensity > 0 && intensity < 0.5;

  switch (group) {
    case 'clear':
      return `clear-${tod}`;
    case 'partly':
      return `partly-cloudy-${tod}`;
    case 'cloudy':
      return 'cloudy';
    case 'overcast':
      return `overcast-${tod}`;
    case 'fog':
      return `fog-${tod}`;
    case 'haze':
      return `haze-${tod}`;
    case 'drizzle':
      return 'drizzle';
    case 'rain':
      return light ? `partly-cloudy-${tod}-rain` : 'rain';
    case 'snow':
      return light ? `partly-cloudy-${tod}-snow` : 'snow';
    case 'sleet':
      return light ? `partly-cloudy-${tod}-sleet` : 'sleet';
    case 'thunder':
      return precip === 'none' ? `thunderstorms-${tod}` : `thunderstorms-${tod}-${precip}`;
    default:
      return 'cloudy';
  }
}
