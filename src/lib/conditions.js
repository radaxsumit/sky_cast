// Groups WeatherAPI condition codes into the few visual "weather layers" the app draws.
// Codes: https://www.weatherapi.com/docs/weather_conditions.json

const L = 0.35; // light / patchy
const M = 0.7; // moderate
const H = 1; // heavy

const entry = (group, precip = 'none', intensity = 0, lightning = false) => ({
  group,
  precip,
  intensity,
  lightning,
});

const TABLE = {
  1000: entry('clear'),
  1003: entry('partly'),
  1006: entry('cloudy'),
  1009: entry('overcast'),
  1030: entry('fog'),
  1135: entry('fog'),
  1147: entry('fog'),
  1063: entry('rain', 'rain', L),
  1066: entry('snow', 'snow', L),
  1069: entry('sleet', 'sleet', L),
  1072: entry('sleet', 'sleet', L),
  1087: entry('thunder', 'none', 0, true),
  1114: entry('snow', 'snow', M),
  1117: entry('snow', 'snow', H),
  1150: entry('drizzle', 'rain', L),
  1153: entry('drizzle', 'rain', L),
  1168: entry('sleet', 'sleet', L),
  1171: entry('sleet', 'sleet', M),
  1180: entry('rain', 'rain', L),
  1183: entry('rain', 'rain', L),
  1186: entry('rain', 'rain', M),
  1189: entry('rain', 'rain', M),
  1192: entry('rain', 'rain', H),
  1195: entry('rain', 'rain', H),
  1198: entry('sleet', 'sleet', L),
  1201: entry('sleet', 'sleet', M),
  1204: entry('sleet', 'sleet', L),
  1207: entry('sleet', 'sleet', M),
  1210: entry('snow', 'snow', L),
  1213: entry('snow', 'snow', L),
  1216: entry('snow', 'snow', M),
  1219: entry('snow', 'snow', M),
  1222: entry('snow', 'snow', H),
  1225: entry('snow', 'snow', H),
  1237: entry('sleet', 'sleet', M),
  1240: entry('rain', 'rain', L),
  1243: entry('rain', 'rain', M),
  1246: entry('rain', 'rain', H),
  1249: entry('sleet', 'sleet', L),
  1252: entry('sleet', 'sleet', M),
  1255: entry('snow', 'snow', L),
  1258: entry('snow', 'snow', M),
  1261: entry('sleet', 'sleet', L),
  1264: entry('sleet', 'sleet', M),
  1273: entry('thunder', 'rain', L, true),
  1276: entry('thunder', 'rain', H, true),
  1279: entry('thunder', 'snow', L, true),
  1282: entry('thunder', 'snow', H, true),
};

const FALLBACK = entry('cloudy');

export function conditionInfo(code, text = '') {
  const t = String(text).toLowerCase();
  // The API sometimes reports haze or smoke under fog codes or undocumented codes (e.g. 1036 "Smoky haze").
  if (/haze|smoke|dust/.test(t)) return entry('haze');
  if (TABLE[code]) return TABLE[code];
  if (/fog|mist/.test(t)) return entry('fog');
  return FALLBACK;
}
