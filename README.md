# SkyCast

A weather app with a living sky. The background is drawn live from the searched city's local time and current
conditions: the sun travels its arc between sunrise and sunset, the moon shows its real phase, and clouds drift,
rain and snow fall, fog settles and lightning flashes to match the forecast. Frosted-glass panels on top switch
between light and dark with the sky.

🔗 **Live:** [sky-cast-topaz.vercel.app](https://sky-cast-topaz.vercel.app/)

> Screenshots in `docs/screenshots/` show the previous design and will be refreshed for the redesign.

## Features

- **Living sky:** dawn, day, golden hour, dusk and night palettes that blend minute by minute, plus clouds,
  rain, snow, sleet, fog/haze and thunderstorms driven by WeatherAPI condition codes. Try any scene with
  `?scene=<phase>[,<code>]`, e.g. `?scene=dusk,1195` (heavy rain at dusk) or `?scene=night,1000`.
- **Today:** big current temperature, daylight arc with time left, a 24-hour forecast for today, tomorrow and the
  day after, a 3-day range view, and tiles for air quality (US EPA), UV, wind with compass, humidity and dew point,
  feels-like, visibility, pressure and cloud cover.
- **Search:** suggestions as you type, keyboard navigation, and exact-place selection (San José, Costa Rica stays
  San José, Costa Rica).
- **Saved places:** pin up to 8 cities. Each card shows a mini version of that city's sky right now.
- **Clock:** a full-screen standby clock over the live sky.
- **Settings:** °C/°F, km/h or mph, auto or manual light/dark panels, reduced motion, and a starting city.
- **Accessible:** text passes WCAG AA over every sky, motion respects `prefers-reduced-motion`, and search is
  a proper ARIA combobox.

## Tech stack

React 19, Vite 7, Tailwind CSS 4, Motion, Lucide icons, [Meteocons](https://meteocons.com/) animated weather
icons (MIT, Bas Milius), Bricolage Grotesque and Onest (self-hosted via Fontsource), Vitest.
Weather data from [WeatherAPI.com](https://www.weatherapi.com/) (free plan, 3-day forecast).

## Getting started

```bash
npm install
cp .env.example .env   # then put your WeatherAPI key in .env
npm run dev
```

```bash
npm test        # unit tests (data mapping, scene logic, proxy, search, cache)
npm run lint
npm run build
```

### API key

The key is **server-side only**. The browser calls `/api/weather` and `/api/search`. In production these are
Vercel functions in `api/`; in development a small Vite middleware (`vite-plugin-weather-proxy.js`) serves the same
routes, so `npm run dev` works without the Vercel CLI.

| Variable          | Where                                                   |
| ----------------- | ------------------------------------------------------- |
| `WEATHER_API_KEY` | `.env` locally; Vercel → Project → Settings → Environment Variables |

## Project structure

```
api/                      Vercel functions + shared proxy logic (api/_lib)
src/
  app/                    App shell, routing (hash), views: Dashboard, Saved, Clock, Settings, Coming soon
  components/             hero, hourly, forecast, tiles, search, nav, ui
  scene/                  resolveScene (time + weather → sky), palettes, SkyScene and its layers
  hooks/                  weather loading, settings, saved cities, local clock, routing, reduced motion
  lib/                    condition codes, icon mapping, time, units, AQI, descriptions, cache, chart maths
  services/weatherApi.js  calls the proxy, normalises and caches responses
tests/                    Vitest suites mirroring src/ and api/
docs/                     design spec, implementation plan, screenshots
```

## Author

**Sumit Prajapati** · [GitHub](https://github.com/radaxsumit) · [LinkedIn](https://www.linkedin.com/in/sumit-prajapati03/)

## License

MIT
