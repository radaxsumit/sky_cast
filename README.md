# SkyCast

A clean weather dashboard where the weather card is a real photograph matched to the searched city's actual
conditions and local time of day: a sunny morning, a starry clear night, rain on city streets, a storm, fog,
snow or a sunset, all from the city's own clock, not yours.

🔗 **Live:** [sky-cast-topaz.vercel.app](https://sky-cast-topaz.vercel.app/)

> Screenshots in `docs/screenshots/` show the previous design and will be refreshed for the redesign.

## Features

- **Weather photo card:** 13 photographs chosen by WeatherAPI condition code and time of day (dawn, day, golden
  hour, dusk, night). Preview any combination with `?scene=<phase>[,<code>]`, e.g. `?scene=night,1195`.
- **Today:** big current temperature, daylight arc with time left, a 24-hour forecast for today, tomorrow and the
  day after, a 3-day range view, and tiles for air quality (US EPA), UV, wind with compass, humidity and dew point,
  feels-like, visibility, pressure and cloud cover.
- **Search:** suggestions as you type, keyboard navigation, and exact-place selection (San José, Costa Rica stays
  San José, Costa Rica).
- **Saved places:** pin up to 8 cities, each shown with its own weather photo and local time.
- **Clock:** a full-screen standby clock over the current weather photo.
- **Light and dark themes:** follow your device or pick one; the sidebar has a quick sun/moon switch.
- **Settings:** °C/°F, km/h or mph, theme, reduced motion, and a starting city.
- **Accessible:** visible keyboard focus, `prefers-reduced-motion` respected, and search is an ARIA combobox.

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
npm test        # unit tests (data mapping, photo + scene logic, proxy, search, cache)
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

What the proxy (`api/_lib/weatherapi.js`) does:

- Adds the key on the server only. The Network tab shows `/api/weather?q=…`, never the key or WeatherAPI's URL.
- Returns only the fields the app uses (about 13 KB instead of WeatherAPI's 50 KB raw response).
- Accepts `GET` only, validates `q` (letters, digits and place-name punctuation, max 100 characters) and ignores
  every other parameter.
- Refuses requests made by other websites (`Sec-Fetch-Site: cross-site`), so nobody can use your key from their page.
- Rate-limits each visitor to 60 requests a minute.
- Logs upstream key or quota errors on the server and shows users a generic message instead.

The client shares identical requests already in flight and caches forecasts for 10 minutes, so the app never fires
duplicate calls.

## Project structure

```
api/                      Vercel functions + shared proxy logic (api/_lib)
src/
  app/                    App shell, routing (hash), views: Dashboard, Saved, Clock, Settings, Coming soon
  components/             hero, hourly, forecast, tiles, search, nav, ui
  scene/                  resolveScene (local time + weather → phase), photo picker, ?scene= preview
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

## Photo credits

All weather photographs are from [Unsplash](https://unsplash.com/license) (free to use):
[clear day](https://unsplash.com/photos/TSgwbumanuE) ·
[clear night](https://unsplash.com/photos/E0AHdsENmDg) ·
[partly cloudy](https://unsplash.com/photos/MSrUdvVrKEE) ·
[cloudy](https://unsplash.com/photos/9hIJJghBqb0) ·
[rain](https://unsplash.com/photos/jYjuUXgi2NU) ·
[rain at night](https://unsplash.com/photos/FGjR4IGwP7U) ·
[thunderstorm](https://unsplash.com/photos/ESL1rIs9j48) ·
[snow](https://unsplash.com/photos/R5SrmZPoO40) ·
[fog](https://unsplash.com/photos/E0e1NmVclRo) ·
[haze](https://unsplash.com/photos/iOrTzNpeSt8) ·
[dawn](https://unsplash.com/photos/vTitvl4O2kE) ·
[sunset](https://unsplash.com/photos/-IMlv9Jlb24) ·
[cloudy night](https://unsplash.com/photos/Q-NAk1DFYkA)
