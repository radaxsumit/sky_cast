import { AnimatePresence, motion } from 'motion/react';
import { RotateCw, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchBox } from '../../components/search/SearchBox.jsx';
import { WeatherIcon } from '../../components/ui/WeatherIcon.jsx';
import { locationQuery } from '../../lib/locationQuery.js';
import { MAX_SAVED } from '../../lib/savedCities.js';
import { minutesInZone } from '../../lib/time.js';
import { convertTemp } from '../../lib/units.js';
import { resolveScene } from '../../scene/resolveScene.js';
import { arcPosition } from '../../scene/arc.js';
import { fetchForecast } from '../../services/weatherApi.js';
import { sceneInputFrom } from '../useScene.js';

// A still, miniature version of the living sky for one city (FigJam "condition tiles").
function MiniSky({ scene }) {
  const { top, mid, bottom } = scene.sky;
  const body = arcPosition(scene.body.progress);
  const isSun = scene.body.kind === 'sun';
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${top}, ${mid} 60%, ${bottom})` }} />
      {scene.stars > 0 &&
        [12, 28, 47, 63, 78, 88, 35, 55].map((x, i) => (
          <span
            key={x}
            className="absolute h-[2px] w-[2px] rounded-full bg-white"
            style={{ left: `${x}%`, top: `${10 + ((i * 37) % 45)}%`, opacity: scene.stars * 0.8 }}
          />
        ))}
      <div
        className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: `${body.left}%`,
          top: `${body.top}%`,
          opacity: Math.max(0.25, 1 - Math.max(0, scene.clouds - 0.45) * 1.5),
          background: isSun
            ? 'radial-gradient(circle at 40% 40%, #fff 0%, #ffe08a 40%, #ffb547 70%, transparent 72%)'
            : 'radial-gradient(circle at 40% 40%, #fff 0%, #d9e1f5 55%, transparent 58%)',
          boxShadow: isSun ? '0 0 60px 18px rgba(255,190,90,0.45)' : '0 0 40px 8px rgba(220,230,255,0.25)',
        }}
      />
      {scene.clouds > 0.3 && (
        <div
          className="absolute inset-x-[-10%] top-[35%] h-1/2 rounded-[50%] blur-2xl"
          style={{ background: `rgba(255,255,255,${scene.dim > 0.25 ? 0.18 : 0.32})`, opacity: scene.clouds }}
        />
      )}
      {scene.precip !== 'none' && (
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              scene.precip === 'snow'
                ? 'radial-gradient(circle, #fff 1.2px, transparent 1.6px)'
                : 'linear-gradient(105deg, transparent 46%, rgba(220,232,255,0.7) 50%, transparent 54%)',
            backgroundSize: scene.precip === 'snow' ? '18px 18px' : '14px 22px',
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
    </div>
  );
}

function CityCard({ city, unit, onOpen, onRemove }) {
  const [state, setState] = useState({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchForecast(locationQuery(city))
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch(() => alive && setState({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, [city, attempt]);

  const data = state.data;
  const scene = data ? resolveScene(sceneInputFrom(data, minutesInZone(new Date(), data.location.tzId))) : null;
  const time = data
    ? new Intl.DateTimeFormat('en-US', { timeZone: data.location.tzId, hour: 'numeric', minute: '2-digit' }).format(new Date())
    : null;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="group relative aspect-[16/10] overflow-hidden rounded-[26px] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/20"
    >
      {scene ? <MiniSky scene={scene} /> : <div className="absolute inset-0 animate-pulse bg-white/20" />}

      <button
        type="button"
        onClick={() => onOpen(locationQuery(city))}
        className="absolute inset-0 flex flex-col justify-between p-5 text-left text-white"
        aria-label={`Open ${city.name}`}
      >
        <span className="flex items-center gap-2 text-sm font-medium [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
          {data && <WeatherIcon code={data.current.code} isDay={data.current.isDay} text={data.current.text} size={28} className="-my-1" />}
          {data ? data.current.text : state.status === 'error' ? 'Couldn’t load' : 'Loading…'}
        </span>
        <span className="flex items-end justify-between gap-3 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
          <span className="min-w-0">
            <span className="font-display block truncate text-2xl font-semibold tracking-tight">{city.name}</span>
            <span className="block truncate text-sm opacity-90">{city.country}</span>
          </span>
          <span className="text-right">
            {data && (
              <span className="font-display tabular block text-5xl leading-none font-semibold tracking-tighter">
                {convertTemp(data.current.tempC, data.current.tempF, unit)}°
              </span>
            )}
            {time && <span className="tabular mt-1 block text-sm opacity-90">{time}</span>}
          </span>
        </span>
      </button>

      {state.status === 'error' && (
        <button
          type="button"
          onClick={() => {
            setState({ status: 'loading' });
            setAttempt((n) => n + 1);
          }}
          className="absolute top-4 right-14 flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold text-white"
        >
          <RotateCw className="h-3.5 w-3.5" /> Retry
        </button>
      )}

      <button
        type="button"
        onClick={() => onRemove(city.id)}
        aria-label={`Remove ${city.name}`}
        className="absolute top-3 right-3 rounded-full bg-black/25 p-2 text-white backdrop-blur-md transition-opacity hover:bg-black/40 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.li>
  );
}

export function SavedCities({ saved, settings, onOpen }) {
  const { cities } = saved;
  return (
    <div className="pt-2">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="hero-ink">
          <h1 className="font-display text-4xl font-semibold tracking-tight">Saved places</h1>
          <p className="mt-1 opacity-90">
            {cities.length ? `${cities.length} of ${MAX_SAVED} places, each under its own sky right now.` : 'Pin up to 8 places to compare their weather at a glance.'}
          </p>
        </div>
        <SearchBox
          onSelect={(q, place) => (place ? saved.add(place) : onOpen(q))}
          saved={saved}
          placeholder="Add a place"
          className="w-full md:w-96"
        />
      </div>

      {cities.length === 0 ? (
        <div className="glass mx-auto mt-10 flex max-w-md flex-col items-center rounded-[26px] px-8 py-10 text-center">
          <Star className="h-8 w-8 text-[var(--color-sun)]" />
          <h2 className="font-display mt-3 text-2xl font-semibold">No saved places yet</h2>
          <p className="text-ink-muted mt-2">
            Search above and pick a place to save it, or tap the star next to a city’s name on the Today screen.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {cities.map((city) => (
              <CityCard key={city.id} city={city} unit={settings.unit} onOpen={onOpen} onRemove={saved.remove} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
