import { currentHourIndex, parseClock, weekdayShort } from './time.js';

const hourOf = (h) => ({
  time: h.time.split(' ')[1].padStart(5, '0'),
  epoch: h.time_epoch,
  tempC: h.temp_c,
  tempF: h.temp_f,
  code: h.condition.code,
  text: h.condition.text.trim(),
  isDay: h.is_day === 1,
  chanceOfRain: Math.max(h.chance_of_rain ?? 0, h.chance_of_snow ?? 0),
  dewpointC: h.dewpoint_c,
  dewpointF: h.dewpoint_f,
});

const dayOf = (d) => ({
  date: d.date,
  weekday: weekdayShort(d.date),
  maxC: d.day.maxtemp_c,
  maxF: d.day.maxtemp_f,
  minC: d.day.mintemp_c,
  minF: d.day.mintemp_f,
  code: d.day.condition.code,
  text: d.day.condition.text.trim(),
  chanceOfRain: Math.max(d.day.daily_chance_of_rain ?? 0, d.day.daily_chance_of_snow ?? 0),
  uv: d.day.uv,
  astro: {
    sunrise: d.astro.sunrise,
    sunset: d.astro.sunset,
    sunriseMin: parseClock(d.astro.sunrise),
    sunsetMin: parseClock(d.astro.sunset),
    moonPhase: d.astro.moon_phase,
  },
  hours: d.hour.map(hourOf),
});

export function normalizeForecast(raw) {
  const { location: l, current: c } = raw;
  const days = raw.forecast.forecastday.map(dayOf);
  const nowHour = days[0]?.hours[currentHourIndex(l.localtime)];
  const aq = c.air_quality;

  return {
    location: {
      name: l.name,
      region: l.region,
      country: l.country,
      lat: l.lat,
      lon: l.lon,
      tzId: l.tz_id,
      localtimeEpoch: l.localtime_epoch,
      localtime: l.localtime,
    },
    current: {
      tempC: c.temp_c,
      tempF: c.temp_f,
      feelsC: c.feelslike_c,
      feelsF: c.feelslike_f,
      code: c.condition.code,
      text: c.condition.text.trim(),
      isDay: c.is_day === 1,
      humidity: c.humidity,
      windKph: c.wind_kph,
      windMph: c.wind_mph,
      gustKph: c.gust_kph,
      gustMph: c.gust_mph,
      windDegree: c.wind_degree,
      windDir: c.wind_dir,
      pressureMb: c.pressure_mb,
      visKm: c.vis_km,
      visMiles: c.vis_miles,
      uv: c.uv,
      cloud: c.cloud,
      dewpointC: c.dewpoint_c ?? nowHour?.dewpointC,
      dewpointF: c.dewpoint_f ?? nowHour?.dewpointF,
      aqi: aq ? { epa: aq['us-epa-index'], pm25: aq.pm2_5 } : null,
    },
    days,
  };
}
