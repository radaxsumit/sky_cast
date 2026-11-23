# SkyCast Living Sky Redesign: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild SkyCast as a "living sky" weather app. A full-viewport animated sky driven by the
searched city's local time and weather sits behind glass UI, with working navigation
(Dashboard, Saved Cities, Clock, Settings, Map coming-soon), fixed search and data, and the API key
moved behind a Vercel proxy.

**Architecture:** Pure logic (data normalization, condition grouping, time maths, scene resolution,
icon mapping, caching, saved-city helpers) lives in `src/lib/` and `src/scene/resolveScene.js` and is
unit-tested with Vitest. React layers on top: hooks own state and persistence, `SkyScene` renders the
resolved scene as stacked CSS/SVG/Canvas layers, and views compose glass components. The WeatherAPI
key is only used server-side, in `api/` Vercel functions and a Vite dev middleware that share
`api/_lib/weatherapi.js`.

**Tech Stack:** React 19, Vite 7, Tailwind 4, `motion` (`motion/react`), `recharts`, `lucide-react`,
`@bybas/weather-icons` 2.0.0 (Meteocons, MIT), `@fontsource-variable/*`, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-11-23-living-sky-redesign-design.md`. Read it before any task.
The FigJam references in its "Visual references" table are the visual target for Tasks 8–12.

## Global Constraints

- Data source: WeatherAPI.com `forecast.json?days=3&aqi=yes` and `search.json`. No other weather API.
- The API key env var is `WEATHER_API_KEY`, server-side only. No `VITE_`-prefixed key may exist anywhere in `src/` or the bundle.
- The local dev command remains `npm run dev`, which must work without `vercel dev`.
- Saved cities: `localStorage`, max **8**.
- Response cache TTL: **10 minutes** per location query.
- Suggestion debounce **300 ms**, min **2** characters, queries URL-encoded.
- Scene cross-fade **~1.2 s**. Scene re-resolves every **60 s**.
- Phase windows: dawn = sunrise ±45 min, dusk = sunset ±45 min, golden = last 60 min before sunset (dusk wins on overlap).
- `prefers-reduced-motion` (or Settings "reduce motion: on") ⇒ static scene: no particles, drift or lightning.
- Appearance setting (Auto/Light/Dark) changes UI glass and text only, never the sky.
- Text on glass must meet WCAG AA contrast in all four combinations: light or dark glass over a day or night sky.
- Photo/texture overlays: ≤ 6 files, WebP, ≤ 200 KB each, free licence, credited in README.
- Imports use `motion/react`, never `framer-motion`.
- Removed nav items: Calendar, Profile.

## Review Focus

1. **Polar cities** (API returns "No sunrise"/"No sunset"): the scene must fall back to `isDay` and must not produce NaN positions. Tested in Task 4.
2. **Day boundary in hourly data**: at 23:30 local, "now" is hour 23 of day 0. Tomorrow's tab must use day 1, not wrap incorrectly. Tested in Task 3 (`currentHourIndex`).
3. **Condition text the code table doesn't name** (e.g. "Smoky Haze" on code 1030/1135): this must group to `haze`, not `drizzle`. Tested in Task 3.
4. **Fast city switching**: a slow response for city A arriving after city B must not overwrite B. Tested in Task 6 (request token).
5. **Proxy with a missing key or a hostile `q`**: missing key returns 500 JSON `{error:"Weather service not configured"}`. `q` over 100 chars returns 400. Params other than `q` are ignored. Tested in Task 2.

---

## File Structure

```
api/
  _lib/weatherapi.js        upstream URL building + proxy handler (shared by Vercel + Vite dev)
  weather.js                Vercel function → forecast
  search.js                 Vercel function → search
vite-plugin-weather-proxy.js  dev middleware mounting the same handler at /api/*
src/
  main.jsx                  (modify) fonts + css import
  index.css                 (rewrite) tokens, glass utilities, theme variables
  app/App.jsx               shell: SkyScene + nav + routed view + toasts
  app/views/Dashboard.jsx, SavedCities.jsx, ClockView.jsx, SettingsView.jsx, ComingSoon.jsx
  components/nav/NavRail.jsx, BottomNav.jsx, navItems.js
  components/search/SearchBox.jsx
  components/hero/Hero.jsx, SunArc.jsx
  components/hourly/HourlyPanel.jsx
  components/forecast/ForecastPanel.jsx, TempRangeBar.jsx
  components/tiles/AqiTile.jsx, UvTile.jsx, WindTile.jsx, HumidityTile.jsx,
                   VisibilityTile.jsx, PressureTile.jsx, CloudTile.jsx, FeelsLikeTile.jsx
  components/ui/GlassCard.jsx, WeatherIcon.jsx, Toast.jsx, TopProgress.jsx, Skeleton.jsx
  scene/resolveScene.js, palettes.js, SkyScene.jsx
  scene/layers/SkyGradient.jsx, Stars.jsx, Celestial.jsx, Clouds.jsx,
               Precipitation.jsx, Lightning.jsx, FogVeil.jsx, PhotoOverlay.jsx
  services/weatherApi.js    (rewrite) calls /api/weather, /api/search
  lib/conditions.js, time.js, normalize.js, aqi.js, units.js, iconMap.js, cache.js, savedCities.js
  hooks/useWeather.js (rewrite), useSettings.js, useSavedCities.js, useLocalClock.js,
        useHashRoute.js, useReducedMotion.js
  assets/textures/*.webp, assets/photos/*.webp
tests/ (Vitest, node env)  mirrors src/lib, src/scene, api/_lib
docs/screenshots/           (moved from src/screenshots)
```

Deleted at the end: `src/components/{ForecastList,Header,MainWeatherCard,SideNav,TempChart,WeatherStatsGrid}.jsx`,
`src/utils/`, `src/assets/cloudsbeautiful.jpg`, `src/.env.example`, `src/screenshots/`.

---

### Task 1: Tooling, dependencies and housekeeping

**Files:**
- Modify: `package.json`, `index.html`, `README.md`, `.gitignore`
- Create: `.env.example`, `vitest.config.js`, `tests/smoke.test.js`
- Move: `src/screenshots/*` → `docs/screenshots/` (drop `desktop.ini`)
- Delete: `src/.env.example`

**Interfaces:**
- Produces: `npm test` (runs `vitest run`), installed `@bybas/weather-icons`, two fontsource variable fonts.

- [ ] **Step 1:** Create the feature branch `git switch -c feat/living-sky`.
- [ ] **Step 2:** `npm i @bybas/weather-icons@2.0.0 @fontsource-variable/<display> @fontsource-variable/<ui>` (font choice is the builder's, per the spec's anti-goal: not Inter). `npm i -D vitest`. `npm un prop-types framer-motion` (if framer-motion is listed; `motion` stays).
- [ ] **Step 3:** Add `"test": "vitest run"` to scripts. Add `vitest.config.js` with `environment: 'node'`, `include: ['tests/**/*.test.js']`.
- [ ] **Step 4:** Write `tests/smoke.test.js` (`expect(1+1).toBe(2)`), run `npm test`, and expect 1 passed.
- [ ] **Step 5:** `git mv src/screenshots docs/screenshots`, `git rm docs/screenshots/desktop.ini`, update the README image paths, and add `desktop.ini` to `.gitignore`.
- [ ] **Step 6:** Create the root `.env.example` with `WEATHER_API_KEY=your_weatherapi_key` and `git rm src/.env.example`. Rename the key in the local `.env` from `VITE_API_KEY` to `WEATHER_API_KEY` (this file is untracked).
- [ ] **Step 7:** In `index.html`, set `<title>SkyCast — Live Weather</title>` and `<meta name="description" content="SkyCast: a living-sky weather dashboard with hourly and 3-day forecasts, air quality and more.">`. Remove the inline dark-class script; theme becomes JS-driven in Task 8.
- [ ] **Step 8:** Commit `chore: tooling, deps, move screenshots, env example`.

---

### Task 2: Server-side API proxy

**Files:**
- Create: `api/_lib/weatherapi.js`, `api/weather.js`, `api/search.js`, `vite-plugin-weather-proxy.js`
- Modify: `vite.config.js`
- Test: `tests/api/weatherapi.test.js`

**Interfaces:**
- Produces:
  - `buildUpstreamUrl(kind: 'weather'|'search', q: string, key: string) → string`
  - `handleProxy(kind, params: Record<string,string>, key: string|undefined, fetchImpl = fetch) → Promise<{ status: number, body: object, headers: Record<string,string> }>`
  - HTTP: `GET /api/weather?q=…` and `GET /api/search?q=…` return the upstream JSON unchanged on success.

- [ ] **Step 1: Write failing tests**

```js
test('weather url', () => {
  expect(buildUpstreamUrl('weather', 'New York', 'K'))
    .toBe('https://api.weatherapi.com/v1/forecast.json?key=K&q=New+York&days=3&aqi=yes');
});
test('search url', () => {
  expect(buildUpstreamUrl('search', 'id:2801268', 'K'))
    .toBe('https://api.weatherapi.com/v1/search.json?key=K&q=id%3A2801268');
});
test('missing key → 500', async () => {
  const r = await handleProxy('weather', { q: 'Paris' }, undefined);
  expect(r.status).toBe(500);
  expect(r.body).toEqual({ error: 'Weather service not configured' });
});
test('missing or long q → 400', async () => {
  expect((await handleProxy('weather', {}, 'K')).status).toBe(400);
  expect((await handleProxy('weather', { q: 'x'.repeat(101) }, 'K')).status).toBe(400);
});
test('extra params ignored, upstream status passed through', async () => {
  const calls = [];
  const fake = async (url) => { calls.push(url); return { ok: false, status: 400, json: async () => ({ error: { message: 'No matching location found.' } }) }; };
  const r = await handleProxy('weather', { q: 'zzz', days: '14', key: 'evil' }, 'K', fake);
  expect(calls[0]).toBe(buildUpstreamUrl('weather', 'zzz', 'K'));
  expect(r.status).toBe(400);
  expect(r.body).toEqual({ error: 'No matching location found.' });
});
test('success sets cache header', async () => {
  const fake = async () => ({ ok: true, status: 200, json: async () => ({ ok: 1 }) });
  const r = await handleProxy('search', { q: 'Lon' }, 'K', fake);
  expect(r.headers['Cache-Control']).toBe('public, s-maxage=300, stale-while-revalidate=600');
});
```

- [ ] **Step 2:** Run `npm test`. Expect FAIL (module not found).
- [ ] **Step 3:** Implement both functions in `api/_lib/weatherapi.js` using `URLSearchParams`. Network errors return 502 `{error:'Weather service unreachable'}`.
- [ ] **Step 4:** `api/weather.js` and `api/search.js`: `export default async function handler(req, res)` → `handleProxy(kind, req.query, process.env.WEATHER_API_KEY)` → `res.status(..).setHeader(..).json(..)`.
- [ ] **Step 5:** `vite-plugin-weather-proxy.js`: `export default function weatherProxy(env)` returns a Vite plugin whose `configureServer` mounts middleware on `/api/weather` and `/api/search`, parses the query with `URL`, calls `handleProxy` with `env.WEATHER_API_KEY`, and writes JSON. In `vite.config.js`, switch to `defineConfig(({ mode }) => …)` with `loadEnv(mode, process.cwd(), '')` and add the plugin.
- [ ] **Step 6:** Run `npm test` and expect PASS. Run `npm run dev`, then `curl "http://localhost:5173/api/weather?q=London"` and expect JSON containing `"location"`.
- [ ] **Step 7:** Commit `feat: serverless weather proxy (key no longer in client)`.

---

### Task 3: Data layer: conditions, time, units, AQI, normalize

**Files:**
- Create: `src/lib/conditions.js`, `src/lib/time.js`, `src/lib/units.js`, `src/lib/aqi.js`, `src/lib/normalize.js`
- Test: `tests/lib/conditions.test.js`, `time.test.js`, `aqi.test.js`, `normalize.test.js`, fixture `tests/fixtures/forecast.json` (a trimmed real response: 3 days × 24 hours, captured via the Task 2 dev proxy, with the key absent)

**Interfaces:**
- Produces:
  - `conditionInfo(code: number, text?: string) → { group, precip: 'none'|'rain'|'snow'|'sleet', intensity: 0|0.35|0.7|1, lightning: boolean }`, where `group ∈ 'clear'|'partly'|'cloudy'|'overcast'|'fog'|'haze'|'drizzle'|'rain'|'snow'|'sleet'|'thunder'`
  - `parseClock(s: string) → number|null` ("06:51 AM" → 411; "No sunrise" → null)
  - `localMinutes(localtime: 'YYYY-MM-DD HH:mm') → number`
  - `weekdayShort(date: 'YYYY-MM-DD') → 'Mon'…` (UTC-safe)
  - `formatLocalTime(epochSec: number, tzId: string, opts?) → string` (Intl, `timeZone: tzId`)
  - `currentHourIndex(localtime) → number` (0–23)
  - `convertTemp(c, f, unit:'C'|'F')`, `convertWind(kph, mph, unit:'kph'|'mph')`, both rounding to an integer
  - `aqiInfo(epa: 1..6) → { label, level: 1..6, color }`: 1 Good, 2 Moderate, 3 Unhealthy for sensitive groups, 4 Unhealthy, 5 Very unhealthy, 6 Hazardous
  - `normalizeForecast(raw) → WeatherModel`:

```
WeatherModel = {
  location: { name, region, country, lat, lon, tzId, localtimeEpoch, localtime },
  current: { tempC, tempF, feelsC, feelsF, code, text, isDay: boolean, humidity, windKph, windMph,
             gustKph, gustMph, windDegree, windDir, pressureMb, visKm, visMiles, uv, cloud,
             dewpointC, dewpointF, aqi: { epa, pm25 } | null },
  days: [{ date, weekday, maxC, maxF, minC, minF, code, text, chanceOfRain,
           astro: { sunrise, sunset, sunriseMin, sunsetMin, moonPhase },
           hours: [{ time: 'HH:mm', epoch, tempC, tempF, code, text, isDay, chanceOfRain }] }]
}
```

- [ ] **Step 1: Write failing tests** (key assertions):

```js
expect(conditionInfo(1000).group).toBe('clear');
expect(conditionInfo(1003).group).toBe('partly');
expect(conditionInfo(1009).group).toBe('overcast');
expect(conditionInfo(1135).group).toBe('fog');
expect(conditionInfo(1030, 'Smoky Haze').group).toBe('haze');
expect(conditionInfo(1153)).toMatchObject({ group: 'drizzle', precip: 'rain' });
expect(conditionInfo(1195)).toMatchObject({ group: 'rain', precip: 'rain', intensity: 1 });
expect(conditionInfo(1183).intensity).toBe(0.35);
expect(conditionInfo(1225)).toMatchObject({ group: 'snow', precip: 'snow', intensity: 1 });
expect(conditionInfo(1207).precip).toBe('sleet');
expect(conditionInfo(1276)).toMatchObject({ group: 'thunder', lightning: true, precip: 'rain' });
expect(conditionInfo(9999).group).toBe('cloudy'); // unknown fallback

expect(parseClock('06:51 AM')).toBe(411);
expect(parseClock('12:05 AM')).toBe(5);
expect(parseClock('05:58 PM')).toBe(1078);
expect(parseClock('No sunset')).toBeNull();
expect(localMinutes('2026-11-23 18:42')).toBe(1122);
expect(weekdayShort('2026-11-23')).toBe('Mon');
expect(currentHourIndex('2026-11-23 23:30')).toBe(23);

expect(aqiInfo(1).label).toBe('Good');
expect(aqiInfo(2).label).toBe('Moderate');
expect(aqiInfo(6).label).toBe('Hazardous');

const m = normalizeForecast(fixture);
expect(m.days).toHaveLength(3);
expect(m.days[0].hours).toHaveLength(24);
expect(typeof m.current.isDay).toBe('boolean');
expect(m.days[0].astro.sunriseMin).toBe(parseClock(fixture.forecast.forecastday[0].astro.sunrise));
```

- [ ] **Step 2:** Run `npm test` and expect FAIL.
- [ ] **Step 3:** Implement. `conditionInfo`: a code table per the WeatherAPI condition list (1000–1282). Drizzle, rain and shower codes map to rain with intensity light 0.35 / moderate 0.7 / heavy-torrential 1. Freezing drizzle/rain and sleet/ice pellets map to `sleet`. 1087 and 1273–1282 map to `thunder`. Then a text override: if the text contains `haze`, `smoke` or `dust`, the group is `haze`. `current.dewpoint_c` falls back to the current hour's `dewpoint_c`.
- [ ] **Step 4:** Run `npm test` and expect PASS.
- [ ] **Step 5:** Commit `feat: normalized weather model, condition groups, time utils`.

---

### Task 4: Scene resolver

**Files:**
- Create: `src/scene/resolveScene.js`, `src/scene/palettes.js`
- Test: `tests/scene/resolveScene.test.js`

**Interfaces:**
- Consumes: `conditionInfo` (Task 3).
- Produces: `resolveScene({ minutesNow, sunriseMin, sunsetMin, isDay, code, text, cloud, moonPhase }) → Scene`

```
Scene = { phase: 'night'|'dawn'|'day'|'golden'|'dusk',
          sky: { top: string, mid: string, bottom: string },   // hex
          body: { kind: 'sun'|'moon', progress: number /*0..1*/, moonPhase?: string },
          stars: number, clouds: number, dim: number, fog: number,   // 0..1
          precip: 'none'|'rain'|'snow'|'sleet', precipIntensity: number,
          lightning: boolean, glass: 'light'|'dark', key: string }  // key = phase+group, for cross-fade
```

- [ ] **Step 1: Write failing tests** (S = 411, T = 1078):

```js
const base = { sunriseMin: 411, sunsetMin: 1078, isDay: true, code: 1000, cloud: 0 };
expect(resolveScene({ ...base, minutesNow: 411 }).phase).toBe('dawn');
expect(resolveScene({ ...base, minutesNow: 456 }).phase).toBe('dawn');      // +45 inclusive
expect(resolveScene({ ...base, minutesNow: 457 }).phase).toBe('day');
expect(resolveScene({ ...base, minutesNow: 1018 }).phase).toBe('golden');   // T-60
expect(resolveScene({ ...base, minutesNow: 1033 }).phase).toBe('dusk');     // T-45, dusk wins
expect(resolveScene({ ...base, minutesNow: 1123 }).phase).toBe('dusk');
expect(resolveScene({ ...base, minutesNow: 1124, isDay: false }).phase).toBe('night');
expect(resolveScene({ ...base, minutesNow: 744 }).body).toMatchObject({ kind: 'sun' });
expect(resolveScene({ ...base, minutesNow: 744 }).body.progress).toBeCloseTo(0.5, 2);
expect(resolveScene({ ...base, minutesNow: 120, isDay: false }).body.kind).toBe('moon');
// polar
const polar = resolveScene({ ...base, sunriseMin: null, sunsetMin: null, minutesNow: 600, isDay: false });
expect(polar.phase).toBe('night');
expect(Number.isFinite(polar.body.progress)).toBe(true);
// weather layering
expect(resolveScene({ ...base, minutesNow: 120, isDay: false, code: 1000 }).stars).toBeGreaterThan(0.5);
expect(resolveScene({ ...base, minutesNow: 120, isDay: false, code: 1009 }).stars).toBe(0);
expect(resolveScene({ ...base, minutesNow: 700, code: 1195 })).toMatchObject({ precip: 'rain', precipIntensity: 1 });
expect(resolveScene({ ...base, minutesNow: 700, code: 1276 }).lightning).toBe(true);
expect(resolveScene({ ...base, minutesNow: 700, code: 1009 }).dim).toBeGreaterThan(0.3);
expect(resolveScene({ ...base, minutesNow: 700 }).glass).toBe('light');
expect(resolveScene({ ...base, minutesNow: 120, isDay: false }).glass).toBe('dark');
```

- [ ] **Step 2:** Run and expect FAIL.
- [ ] **Step 3:** Implement. The night arc is `((now − T + 1440) % 1440) / (1440 − (T − S))`, clamped to 0..1. Polar falls back to `isDay ? 'day' : 'night'` with progress 0.5. `palettes.js` holds one `{top, mid, bottom}` per phase. Within 20 min of a phase boundary, `sky` is the linear RGB blend toward the neighbouring phase. Overcast/rain/thunder desaturate and darken the colours by `dim`. `clouds` = max(cloud/100, group floor) with floors: partly 0.4, cloudy 0.7, overcast/rain/thunder/snow 0.9. Stars = 0 by day, or when clouds > 0.6. Fog 0.6 for fog, 0.4 for haze. `glass` = dark for night/dusk, light otherwise.
- [ ] **Step 4:** Run and expect PASS.
- [ ] **Step 5:** Commit `feat: scene resolver for time-of-day and weather`.

---

### Task 5: Icon mapping and WeatherIcon

**Files:**
- Create: `src/lib/iconMap.js`, `src/components/ui/WeatherIcon.jsx`
- Test: `tests/lib/iconMap.test.js`

**Interfaces:**
- Consumes: `conditionInfo`.
- Produces: `iconName(code, isDay, text?) → string` (a Meteocons file basename); `<WeatherIcon code isDay text size className />`; `<MetIcon name size />` for detail icons (`uv-index-6`, `humidity`, `barometer`, `compass`, `sunrise`, `moon-full`, …).

- [ ] **Step 1: Failing tests:** `iconName(1000,true)` → `'clear-day'`; `iconName(1000,false)` → `'clear-night'`; `(1003,false)` → `'partly-cloudy-night'`; `(1009,true)` → `'overcast-day'`; `(1030,true,'Smoky Haze')` → `'haze-day'`; `(1135,false)` → `'fog-night'`; `(1183,true)` → `'partly-cloudy-day-rain'`; `(1195,true)` → `'rain'`; `(1225,true)` → `'snow'`; `(1207,true)` → `'sleet'`; `(1276,false)` → `'thunderstorms-night-rain'`; `(1153,true)` → `'drizzle'`.
- [ ] **Step 2:** Run and expect FAIL. **Step 3:** Implement (patchy/light variants use the `partly-cloudy-{day|night}-*` icons). **Step 4:** Run and expect PASS.
- [ ] **Step 5:** `WeatherIcon`/`MetIcon` resolve URLs via `import.meta.glob('/node_modules/@bybas/weather-icons/production/fill/all/*.svg', { eager: true, query: '?url', import: 'default' })` and render an `<img>` with `alt` = condition text (decorative detail icons use `alt=""`). Verify with `npm run build`: it succeeds, and `dist/assets` contains SVGs.
- [ ] **Step 6:** Commit `feat: animated Meteocons mapped from condition codes`.

---

### Task 6: State: cache, weather, settings, saved cities, clock, route

**Files:**
- Create: `src/lib/cache.js`, `src/lib/savedCities.js`, `src/services/weatherApi.js` (rewrite), `src/hooks/useWeather.js` (rewrite), `useSettings.js`, `useSavedCities.js`, `useLocalClock.js`, `useHashRoute.js`, `useReducedMotion.js`
- Test: `tests/lib/cache.test.js`, `tests/lib/savedCities.test.js`, `tests/lib/latest.test.js`

**Interfaces:**
- Produces:
  - `createCache(ttlMs = 600_000, now = Date.now) → { get(key), set(key, value) }`
  - `addCity(list, city) → list` (dedupe by `id`, newest first, max 8); `removeCity(list, id) → list`. `SavedCity = { id, name, region, country, lat, lon }`
  - `createLatest() → { next(): number, isLatest(token): boolean }`, which guards stale responses
  - `fetchForecast(query: string) → Promise<WeatherModel>` (uses the cache, throws `Error(message)` from the proxy's `{error}`); `searchPlaces(q) → Promise<SavedCity[]>` (returns `[]` when q is under 2 chars, encodes `q`)
  - `locationQuery(place) → string`: `id:<id>` if there's an id, else `"lat,lon"`, else the raw text
  - `useWeather() → { data: WeatherModel|null, status: 'idle'|'initial'|'refreshing'|'ready'|'error', error: string|null, load(query), clearError() }`. On error, `data` keeps the last good value.
  - `useSettings() → [settings, update(patch)]`, defaults `{ unit:'C', wind:'kph', appearance:'auto', motion:'system', defaultCity:null }`, key `skycast.settings`
  - `useSavedCities() → { cities, add(city), remove(id), has(id) }`, key `skycast.saved`
  - `useLocalClock(epochSec, tzId) → { minutes: number, label: string, date: Date }`, ticking every 30 s from `localtimeEpoch` + elapsed
  - `useHashRoute() → [route: 'dashboard'|'saved'|'clock'|'map'|'settings', navigate(route)]` (`#/`, `#/saved`, …)
  - `useReducedMotion(setting) → boolean` (setting `'on'|'off'|'system'`)

- [ ] **Step 1: Failing tests:** cache hits within TTL and misses at `ttl+1` (injected `now`). `addCity` dedupes and caps at 8 (the 9th add drops the oldest). `removeCity` works. `createLatest`: after `a=next(); b=next()`, `isLatest(a)` is false and `isLatest(b)` is true. `locationQuery({id: 5})` → `'id:5'`; `locationQuery({lat:1,lon:2})` → `'1,2'`; `locationQuery('Pune')` → `'Pune'`.
- [ ] **Step 2:** Run and expect FAIL. **Step 3:** Implement the libs. **Step 4:** Run and expect PASS.
- [ ] **Step 5:** Implement the hooks. First load in `App` (Task 8) calls a `useInitialLocation(settings, load)` helper inside `useWeather.js`, guarded by a ref so StrictMode doesn't double-fire: if `defaultCity` is set, load it; else use geolocation (timeout 8 s), falling back to `'Mumbai'` with a dismissible notice "Location unavailable, showing Mumbai".
- [ ] **Step 6:** Commit `feat: weather/settings/saved-city state with cache and stale-response guard`.

---

### Task 7: SkyScene

**Files:**
- Create: `src/scene/SkyScene.jsx`, `src/scene/layers/{SkyGradient,Stars,Celestial,Clouds,Precipitation,Lightning,FogVeil,PhotoOverlay}.jsx`, `src/assets/textures/*.webp`, `src/assets/photos/*.webp`
- Modify: `README.md` (image credits)

**Interfaces:**
- Consumes: `Scene` (Task 4), `useReducedMotion`.
- Produces: `<SkyScene scene={Scene} reducedMotion={boolean} />`: fixed, `inset-0`, `-z-10`, `aria-hidden`.

- [ ] **Step 1:** Implement the layers in the spec's back-to-front order. `AnimatePresence` keyed on `scene.key` gives the 1.2 s cross-fade. `Celestial` places the sun/moon on a wide arc across the upper viewport from `body.progress`. `Precipitation` is a single `<canvas>` with a rAF loop, particle count ∝ `precipIntensity`, paused when `document.hidden`, and resized via `ResizeObserver`. `Clouds` is two texture layers drifting at different speeds (CSS transform keyframes). Under reduced motion, everything renders static and Precipitation/Lightning are omitted.
- [ ] **Step 2:** Source ≤ 6 images (Unsplash licence) for cloud textures and condition overlays. Convert to WebP ≤ 200 KB and add credits to the README.
- [ ] **Step 3:** Add a dev-only scene preview: `?scene=dusk,1195` in the URL overrides the resolved scene's phase and code. Verify in the browser: clear-day, golden, dusk, clear-night, rain-day, thunder-night, snow-day and fog-morning all render distinctly. No console errors. The rain canvas holds about 60 fps in DevTools on a 4× CPU throttle.
- [ ] **Step 4:** Commit `feat: living sky scene with layered clouds, particles and lightning`.

---

### Task 8: App shell, theming and navigation

**Files:**
- Rewrite: `src/app/App.jsx` (move from `src/App.jsx`), `src/main.jsx`, `src/index.css`
- Create: `src/components/nav/{NavRail,BottomNav,navItems}.jsx|js`, `src/components/ui/{GlassCard,Toast,TopProgress,Skeleton}.jsx`, `src/app/views/ComingSoon.jsx`

**Interfaces:**
- Consumes: Task 6 hooks, `SkyScene`, `resolveScene`.
- Produces: `navItems = [{ id:'dashboard', label:'Dashboard', icon }, { id:'saved', label:'Saved', icon }, { id:'clock', label:'Clock', icon }, { id:'map', label:'Map', icon, soon:true }, { id:'settings', label:'Settings', icon }]`. `<GlassCard as? className>`: uses CSS variables `--glass-bg`, `--glass-border`, `--ink`, `--ink-muted`, set on `<html data-glass="light|dark">`.

- [ ] **Step 1:** `index.css`: Tailwind import, font families as `@theme` tokens, and glass tokens for `[data-glass=light]` and `[data-glass=dark]` chosen to pass AA over both the brightest day palette and the darkest night palette. Check with a contrast checker and note the ratios in a CSS comment.
- [ ] **Step 2:** `App`: compute the scene from `data` + `useLocalClock` every 60 s; `data-glass` = appearance `auto` ? `scene.glass` : appearance. Render `SkyScene`, `NavRail` (≥ 768 px, left glass rail; the active item gets an animated `layoutId` pill), `BottomNav` (< 768 px, floating black pill with a circular white active state per the FigJam `2:14` reference), the routed view, `TopProgress` while `status==='refreshing'`, `Toast` for errors and the location notice, and a first-load `Skeleton` over a neutral sky.
- [ ] **Step 3:** `ComingSoon` (route `map`): a glass panel with a Meteocons icon, "Map is on its way", and one line: "Live radar and temperature layers for your saved cities."
- [ ] **Step 4:** Verify in the browser: every nav item navigates, back/forward work, a refresh keeps the view, and there's no dead click.
- [ ] **Step 5:** Commit `feat: app shell, glass theming, responsive navigation`.

---

### Task 9: Search

**Files:**
- Create: `src/components/search/SearchBox.jsx`

**Interfaces:**
- Consumes: `searchPlaces`, `locationQuery`, `useSavedCities`.
- Produces: `<SearchBox onSelect={(query: string) => void} />`.

- [ ] **Step 1:** Implement: 300 ms debounce, 2-char minimum, ARIA combobox (`role="combobox"`, `aria-expanded`, `aria-activedescendant`, a listbox of options), ↑/↓/Enter/Esc, close on outside click, a spinner while fetching, and an empty state "No places found". Each row shows the name, "region, country", and a ★ toggle (add/remove saved, `stopPropagation`). Selecting calls `onSelect(locationQuery(place))`. Enter with no highlighted row selects the first suggestion, or `onSelect(rawText)` if there are none. Keys are `place.id`.
- [ ] **Step 2:** Verify in the browser: "san jose" lists several distinct places, and picking the Costa Rica one loads Costa Rica. Esc closes the list, and keyboard-only use works. A nonsense query shows the error toast while the old data stays visible.
- [ ] **Step 3:** Commit `feat: accessible city search with exact-place selection`.

---

### Task 10: Dashboard

**Files:**
- Create: `src/app/views/Dashboard.jsx`, `src/components/hero/{Hero,SunArc}.jsx`, `src/components/hourly/HourlyPanel.jsx`, `src/components/forecast/{ForecastPanel,TempRangeBar}.jsx`, `src/components/tiles/*.jsx`

**Interfaces:**
- Consumes: `WeatherModel`, `Scene`, settings, `convertTemp`/`convertWind`, `aqiInfo`, `WeatherIcon`/`MetIcon`, `GlassCard`, `useSavedCities`.
- Produces: `<Dashboard data scene clock settings onSearch />`.

- [ ] **Step 1: Hero.** No card. Location line (📍 name, country · weekday, date · live local time), a ★ save toggle, `SearchBox`, and a °C/°F segmented toggle. Then the big temperature in the display font (number animates on change), the condition text, "Feels X° · H X° L X°", and the `WeatherIcon`. `SunArc` is a dashed SVG arc with the sun/moon dot at `scene.body.progress`, sunrise and sunset labels at the ends, and the current time under the dot (FigJam `2:10`).
- [ ] **Step 2: HourlyPanel.** Tabs "Today | Tomorrow | <weekday 3>" (all functional). A horizontal scroll of 24 hour cells (time, icon, temp, rain % shown when ≥ 10). On Today, scroll "Now" into view and highlight it, and dim past hours. Above the cells, a recharts `AreaChart` temperature curve aligned to the cells, with a tooltip in the current unit. Snap-scroll on touch.
- [ ] **Step 3: ForecastPanel.** 3 rows: weekday ("Today" for day 0), icon, condition, chance of rain, low°, a `TempRangeBar` (bar spans the global min..max of the 3 days, gradient coloured by temperature, a dot at the current temp on day 0), and high°.
- [ ] **Step 4: Tiles.**
  - AQI: EPA value, label from `aqiInfo`, a 6-stop gradient bar with a marker, and PM2.5.
  - UV: value and a `uv-index-N` icon, with a label (0–2 Low, 3–5 Moderate, 6–7 High, 8–10 Very high, 11+ Extreme).
  - Wind: a compass needle rotated to `windDegree`, speed and gusts in the chosen unit, and the direction.
  - Humidity: % plus "Dew point X°".
  - Visibility: km or miles, following the unit (C → km, F → miles).
  - Pressure: mb.
  - Cloud cover: % with a bar (FigJam `2:10`).
  - Feels like: ° with a short comparison ("Feels warmer/cooler/similar").
- [ ] **Step 5: Layout and motion.** Desktop: hero on top; then Hourly full width; then a grid with Forecast (spans 1 column, 2 rows) and tiles in 3 columns. Tablet: 2 columns. Mobile: single column, tiles 2-up, bottom padding for `BottomNav`. Staggered entrance (`motion`, 60 ms stagger) and a subtle hover lift on tiles, both disabled under reduced motion.
- [ ] **Step 6:** Verify in the browser at 1440, 1024, 768 and 390 px in both day and night cities (e.g. Mumbai and Los Angeles). The moon only shows at night, the icons match the condition, the AQI label is correct, °F switches every number, and all text is readable.
- [ ] **Step 7:** Commit `feat: living-sky dashboard with hero arc, hourly, forecast and detail tiles`.

---

### Task 11: Saved Cities and Clock views

**Files:**
- Create: `src/app/views/SavedCities.jsx`, `src/app/views/ClockView.jsx`

**Interfaces:**
- Consumes: `useSavedCities`, `fetchForecast` (cached), `resolveScene`, `useLocalClock`, `navigate`.
- Produces: views for the `saved` and `clock` routes.

- [ ] **Step 1: SavedCities.** A responsive grid of up to 8 cards. Each card fetches its city (cached 10 min), resolves its own scene, and renders a mini static sky (gradient + celestial + light particles, per FigJam `2:2`) with the condition, big temp, local time, and the place name. × removes the city (hover on desktop, always visible on touch). Clicking a card loads it and navigates to the dashboard. Empty state: "No saved cities yet. Tap ★ on a search result to pin one." A failed card shows a quiet "Couldn't load" with retry.
- [ ] **Step 2: ClockView.** A full-screen overlay over the live sky: huge local time (display font, tabular numerals, blinking colon unless reduced motion), the weekday and date, and the temp + icon (FigJam `1:2`). Esc, a click or tap exits to the previous route. The nav is hidden while it's active.
- [ ] **Step 3:** Verify in the browser: save 3 cities in different time zones, and each card shows its own day/night. The 9th save drops the oldest. Clock exits correctly.
- [ ] **Step 4:** Commit `feat: saved cities with mini skies and standby clock`.

---

### Task 12: Settings, cleanup and release check

**Files:**
- Create: `src/app/views/SettingsView.jsx`
- Delete: the old components, `src/utils/`, `src/assets/cloudsbeautiful.jpg`, `src/App.jsx` (if not moved)
- Modify: `README.md`

**Interfaces:**
- Consumes: `useSettings`, `SearchBox` (for picking the default city).

- [ ] **Step 1: SettingsView.** Sections:
  - Units: temperature °C/°F and wind km/h / mph.
  - Appearance: Auto / Light / Dark, with the Light/Dark pair styled as the FigJam `2:6` sun/moon switch plus an "Auto (follow the sky)" option.
  - Motion: System / Reduce / Full.
  - Default location: "Use my location" or a fixed city picked via `SearchBox`, plus a clear button.
  Every change applies live and persists.
- [ ] **Step 2:** Delete the dead files. `grep -r "framer-motion\|VITE_API_KEY\|utils/weather" src` returns nothing. `npm run lint` shows 0 errors, `npm test` passes, and `npm run build` succeeds.
- [ ] **Step 3:** Bundle check: `grep -r "weatherapi.com/v1" dist` finds no key, and `dist` contains no `.env` value.
- [ ] **Step 4:** Update the README: features, a screenshot placeholder note, the setup (`WEATHER_API_KEY` in `.env` and in Vercel), the owner actions (rotate key, remove `VITE_API_KEY`), and image credits.
- [ ] **Step 5:** Full browser pass of the spec's success criteria (scene correctness at several cities and phases via `?scene=`, nav, search, saved cities, clock, settings, reduced motion, mobile).
- [ ] **Step 6:** Commit `feat: settings view; remove legacy components; docs`.
