# SkyCast — "Living Sky" Redesign

Date: 2026-11-23
Status: draft, awaiting approval

## Intent and why

SkyCast is a React + Vite weather dashboard deployed on Vercel. It works, but it looks like
most weather dashboards, has visible bugs (a moon icon next to "Sunny" at midday), and five of
its six sidebar icons do nothing. The owner wants it to **stand out**: an app with an appealing,
unique UI and real motion, where the visuals always match the actual time and weather
at the searched city: a morning sun in the morning, a night sky at night, rain when it rains.

Success means:

- Opening the app anywhere, at any hour, shows a sky scene that matches that place's local
  time and current conditions, and moves (drifting clouds, falling rain or snow, twinkling stars).
- Every nav item either works or clearly says "coming soon". Nothing is a dead click.
- Search finds the place you meant and the numbers shown are correct and labelled correctly.
- The API key is no longer shipped to the browser.

## Visual references

The owner's FigJam board "Weather app recreate"
(`https://figma.com/board/rGJazn00Dtd38oehOyR1oA/Weather-app-recreate`, page `0:1`) holds six
reference images. They are **inspiration, not specs to copy pixel-for-pixel**. Take composition and
mood from them, and keep the app's own identity.

| Node | Reference | Used for |
|---|---|---|
| `2:10` | Light glassy card: sun on a dashed arc over a blue sky, big temp, AQI gradient bar, cloud-cover bar | Dashboard hero + AQI/Cloud tiles |
| `2:2` | Six condition tiles (sunny/cloudy/rain/snow × day/night) with layered illustrated backgrounds | Saved Cities cards; scene mood per condition |
| `2:21` | Dark dashboard: weather card, 7-day list, map, overview chart | Layout density reference only (not the chosen direction) |
| `1:2` | Huge "2:23" clock with day + temp | Clock view |
| `2:14` | Black floating pill nav with circular active state | Mobile bottom nav |
| `2:6` | Sun/cloud vs. moon/stars toggle switch | Appearance control in Settings |

## Goals

1. **Living sky background**: a full-viewport scene behind the whole app, driven by the searched
   city's local time + current condition + day/night.
2. **Redesigned dashboard**: frosted-glass cards floating over the sky, a hero with the big
   temperature, a sun/moon arc, hourly + 3-day forecasts, and richer detail tiles.
3. **Working navigation**: Dashboard, Saved Cities, Clock mode and Settings work; Map shows a
   "coming soon" panel; Calendar and Profile are removed.
4. **Fixed search and data**: correct day/night, correct icons, correct AQI labels, URL-encoded
   queries, keyboard-navigable suggestions, inline errors that keep the last good data on screen.
5. **Code cleanup** from the audit (see "Cleanup list").
6. **API key behind a Vercel serverless proxy.**

## Non-goals

- More than 3 forecast days. The free WeatherAPI plan gives 3, and the design is built around 3.
- An interactive weather map. It's "coming soon" only.
- User accounts or a profile. Saved cities live in `localStorage`.
- WebGL/Three.js skies. The scene is CSS/SVG/Canvas so it stays light and works on phones.
- Push notifications, PWA install and offline mode.

## Anti-goals (failure even if it "works")

- Text that becomes hard to read over a bright sky. Every glass surface must keep readable
  contrast (aim for WCAG AA on body text) in every scene.
- A scene that contradicts the data, e.g. sunshine shown at 11 PM, or a clear sky while it's raining.
- Motion that makes the app sluggish on a mid-range phone, or that ignores
  `prefers-reduced-motion`.
- A generic template look: default Inter on white cards with an indigo gradient.

## Constraints

- Stack stays as it is: React 19, Vite 7, Tailwind 4, `motion`, `recharts`, `lucide-react`.
  Additions are allowed (icons, fonts, small utilities).
- Data source stays **WeatherAPI.com** `forecast.json?days=3&aqi=yes` plus `search.json` for suggestions.
- Deployed on Vercel. The proxy must be a Vercel serverless function under `/api`, and local dev
  must still work with `npm run dev`. That means Vite needs a dev-server equivalent of the proxy, so
  `vercel dev` isn't required.
- Free-tier friendly. Saved-cities refreshes must not hammer the API: cache responses for
  ~10 minutes per location.

## Approaches considered for the sky (decided)

| Approach | Trade-off |
|---|---|
| Procedural (CSS gradients + SVG/Canvas particles) | Covers every time/condition blend smoothly and is light, but clouds can look flat |
| Photo backgrounds per condition × time | Richest texture, but scenes jump between fixed states, rarely match the real data exactly, and add 3–5 MB |
| **Hybrid (chosen)** | Procedural sky carries time of day and particles. A few transparent cloud/haze textures and a soft photo overlay (by condition) add richness |

The owner picked the "living sky hero" direction over a dark data-dashboard look, and handed the
implementation approach to the builder; the hybrid is the builder's call.

## The design

### 1. Scene engine

A pure function resolves a **scene** from the data:

```
resolveScene({ localTime, sunrise, sunset, isDay, conditionCode, cloudPct }) →
  { phase, sky, sun|moon position, cloudDensity, precipitation, intensity, lightning, fog }
```

- **Phase** comes from the city's local time relative to its sunrise/sunset:
  `night`, `dawn` (±45 min around sunrise), `day`, `golden` (last 60 min before sunset), `dusk`
  (±45 min around sunset). Each phase has its own sky gradient palette. Between phases, colours
  interpolate so 6:40 PM looks different from 7:10 PM.
- **Weather layer** comes from WeatherAPI's numeric `condition.code`, **not** the text, which
  varies by language and has values like "Smoky Haze". Codes group into:
  clear, partly-cloudy, cloudy/overcast, fog/mist/haze, drizzle, rain (light/heavy), snow,
  sleet/ice, thunder. Overcast and rain desaturate and darken the sky gradient.
- **Sun/moon** sits on an arc whose progress = (now − sunrise) / (sunset − sunrise) by day and the
  equivalent sunset→next sunrise at night. The moon uses the API's `moon_phase`.
- **Layers**, back to front: sky gradient → stars (night, hidden when cloudy) → sun/moon with
  glow → far clouds → near clouds (parallax speeds) → precipitation canvas → fog/haze veil →
  optional photo overlay (low opacity, blend mode) → app UI.
- **Lightning**: an occasional full-screen flash for thunder codes.
- **Reduced motion**: when `prefers-reduced-motion` is set, show a static scene with no particles
  and no drift.
- The scene cross-fades (~1.2 s) when you switch city or the phase changes. While the app is open
  it re-resolves every minute so the sun visibly moves.
- **Edge cases**: where golden hour and dusk overlap, dusk wins. Polar day/night, where the API
  returns "No sunrise" or "No sunset", falls back to `is_day` with a fixed high/low sun or moon.
- **Local time** of the *searched* city, not the viewer's, comes from `location.localtime_epoch` +
  `location.tz_id`.

### 2. Layout (desktop ≥ 1024 px)

```
┌──────┬──────────────────────────────────────────────────────────────┐
│ nav  │  📍 Mumbai, India · Mon 23 Nov · 6:42 PM     [ search……… ] [°C/°F]│
│ glass│                                                              │
│ rail │   33°            ☾ ──────── arc ────────── ☀               │
│      │   Haze           sunrise 06:51        sunset 17:58           │
│  ◉   │   Feels 36° · H 34° L 21°                                    │
│  ★   │  ┌────────── Hourly (Today | Tomorrow | Wed) ──────────────┐ │
│  ⏱   │  │ now 33° · 19:00 31° · 20:00 30° …  + temp curve + rain % │ │
│  🗺   │  └──────────────────────────────────────────────────────────┘ │
│      │  ┌ 3-day ─────────┐ ┌ AQI ─────┐ ┌ UV ───┐ ┌ Wind ────────┐  │
│  ⚙   │  │ Mon ☁ 21°━━34° │ │ 72 Mod.  │ │ 6 High│ │ compass 7 km/h│ │
│      │  │ Tue …          │ │ ▬▬▬●▬▬▬  │ │       │ │ gusts 12      │  │
│      │  │ Wed …          │ └──────────┘ └───────┘ └──────────────┘  │
│      │  └────────────────┘ ┌ Humidity ┐ ┌ Visib.┐ ┌ Pressure ┐ ┌ Cloud┐│
└──────┴──────────────────────────────────────────────────────────────┘
```

- The hero has no card. The big temperature and the sun/moon arc sit directly on the sky, as in
  the FigJam "Calicut" reference. Everything below is frosted glass whose tint follows the phase:
  light glass by day, dark glass at night.
- **Hourly**: a horizontally scrollable strip of the 24 hours. "Now" is highlighted, and each hour
  has an animated icon, temp and chance of rain, with a smooth temperature curve behind or above
  it. Today, Tomorrow and Day 3 tabs **work** (all 3 days of hourly data are already in the response).
- **3-day forecast**: day name, animated icon, condition, and a low→high range bar coloured by
  temperature (Apple-Weather style), with chance of rain.
- **Detail tiles** (all from the existing response): Air Quality (the US EPA 1–6 index with correct
  labels, a gradient bar and the PM2.5 value), UV index, Wind (compass needle at `wind_degree`, speed,
  gusts), Humidity (plus dew point), Visibility, Pressure, Cloud cover (bar, as in the FigJam
  reference), and Feels-like. Sunrise/sunset lives in the hero arc, so there's no separate tile.
- **Mobile (< 768 px)**: single column. The rail becomes a floating bottom pill nav (FigJam
  reference), the hero takes ~60 % of the first screen, and tiles go 2-up.
- **Tablet**: the rail stays and tiles go 2–3-up.

### 3. Navigation

| Item | Behaviour |
|---|---|
| Dashboard | The view above. |
| Saved Cities | Grid of city cards, each a mini living-sky tile showing that city's own phase and condition (FigJam "condition tiles" reference) with temp, condition and local time. Add from the search bar (★ on a suggestion or on the current city); remove with an × on hover or long-press. Clicking a card opens it on the Dashboard. Stored in `localStorage`, max 8. |
| Clock | A full-screen "standby" view: huge local time, day, date and current temp over the living sky (FigJam "2:23" reference). Exit with Esc or tap. |
| Map | "Coming soon" panel in the app's style, with a short line on what's planned. |
| Settings | Temperature unit (°C/°F), wind unit (km/h / mph), appearance (**Auto** = follows the sky's day/night, Light, Dark; the toggle is styled after the FigJam sun/moon switch), reduce motion (on/off/system), and default location (use my location / a fixed city). Persisted in `localStorage`. **Appearance changes only the UI glass tint and text colours, never the sky scene**, so the scene always tells the truth about the weather. That means contrast must hold in all four combinations: light or dark glass over a day or night sky. *(Builder's call; owner can override.)* |
| Calendar, Profile | **Removed.** |

Routing: simple view state (or hash routing so the browser back button and refresh keep the
view). No router library is needed unless the builder prefers one.

### 4. Search and data fixes

- Suggestions are debounced (~300 ms) from 2 characters, and queries are URL-encoded.
- Arrow keys, Enter and Esc work in the dropdown, and it closes on outside click. Each result
  shows name, region and country; selecting one queries by `id:<location id>` (or lat,lon) so
  ambiguous names resolve to the exact place.
- Typing a name and pressing Enter with no selection picks the first suggestion, or queries the
  raw text if there are none.
- First load: if Settings has a fixed default city, use it and skip geolocation. Otherwise:
  geolocation → fallback to a built-in default city.
  A failed or denied geolocation shows a small, dismissible notice instead of failing silently.
- While a new city loads, keep the current dashboard visible with a slim top progress bar.
  Errors appear as an inline toast and the last good data stays. The full-screen loader is
  only for the very first load, and it is a skeleton over a neutral sky, not a spinner.
- **Mapping**: `is_day`, condition code, `uv`, `gust_kph`, `wind_degree`, `wind_dir`, `dewpoint`,
  `cloud`, `pressure_mb`, `air_quality.pm2_5`, all 3 days' hourly data, `moon_phase`, `tz_id`,
  and `localtime_epoch` are added to the normalized model. Dates are formatted in the city's
  timezone, which fixes the off-by-one weekday from `new Date("YYYY-MM-DD")`.

### 5. Icons, type and imagery

- **Weather icons**: `@bybas/weather-icons` (Meteocons, MIT), the animated "fill" set, mapped
  from condition code + day/night (e.g. 1003 + night → `partly-cloudy-night`). The pack also has
  UV, humidity, wind, compass, barometer, sunrise/sunset and moon-phase icons for the tiles.
- **UI icons**: `lucide-react` stays for nav and controls.
- **Typography**: a characterful display face for the big numbers and headings, plus a clean sans
  for UI text, self-hosted via `@fontsource`. The exact faces are the builder's call, within the
  anti-goal above.
- **Photo and texture overlays**: a small set (≤ 6) of free-licence images (Unsplash or similar,
  credited in the README), converted to WebP at ≤ 200 KB each and used at low opacity. Cloud
  textures are transparent PNG/WebP or SVG.

### 6. API proxy

- `api/weather.js` and `api/search.js` are Vercel functions that read `WEATHER_API_KEY` from the
  server environment, forward only whitelisted params (`q`, `days`), and add short cache headers.
- In dev, a Vite `server.proxy` (or a tiny Vite plugin) does the same using the key from the local
  `.env`, so no `VITE_`-prefixed key ever reaches the bundle.
- `.env.example` moves to the repo root and documents `WEATHER_API_KEY`.
- If `WEATHER_API_KEY` is missing, the functions return a clear 500 JSON error, and the UI shows
  a "weather service not configured" message instead of a blank screen.
- **Release**: all work goes on one feature branch. Its Vercel preview deployment is used to check
  the proxy and the new UI before merging to `main`, so production never runs half-migrated.
- **Owner actions** (outside the code):
  1. Add `WEATHER_API_KEY` in Vercel project settings (Preview + Production).
  2. **Rotate the WeatherAPI key**, because the current one is already public in the
     deployed bundle.
  3. Remove the old `VITE_API_KEY` from Vercel.

### 7. Cleanup list (from the audit)

- Switch `framer-motion` imports to `motion/react`, and drop the `prop-types` dependency if unused.
- Delete dead code: the `converTemp` prop, unused `isDarkMode` props, `@keyframes float`, the
  unreachable loading bar, and the duplicate icon logic in `ForecastList` (one shared icon mapper).
- Remove the duplicate wind and condition cards.
- Move `src/screenshots/` to `docs/screenshots/`, delete `desktop.ini`, and update README image paths.
- Set the page `<title>` and meta description properly ("SkyCast").
- Fix the `useEffect` dependency warning and the StrictMode double geolocation request.

### 8. Folder structure (target)

```
api/                  weather.js, search.js            (Vercel functions)
src/
  app/                App.jsx, views (Dashboard, SavedCities, Clock, Settings, ComingSoon)
  components/         nav, search, hero, hourly, forecast, tiles/*, ui/* (GlassCard, …)
  scene/              resolveScene.js, SkyScene.jsx, layers/* (Stars, Clouds, Precip, Lightning…)
  services/           weatherApi.js (calls /api/*), cache.js
  hooks/              useWeather, useSettings, useSavedCities, useLocalClock
  lib/                conditionCodes.js, iconMap.js, time.js, units.js, aqi.js
  assets/             textures, photos
docs/                 screenshots, specs
```

## Left to the builder

- Exact palettes per phase, font choice, glass blur/opacity values, and animation timings.
- Canvas vs. DOM/SVG for particles, as long as performance holds on mobile.
- Which specific photos and textures to use, within the size budget and licence rule.
- Whether to use hash routing or plain state for views.
- Whether to add unit tests. Recommended: Vitest for the pure logic in `resolveScene`,
  condition-code grouping, icon mapping and time maths.
