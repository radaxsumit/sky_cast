import { AnimatePresence, motion } from 'motion/react';
import { RotateCw, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchBox } from '../../components/search/SearchBox.jsx';
import { WeatherIcon } from '../../components/ui/WeatherIcon.jsx';
import { WeatherPhoto } from '../../components/ui/WeatherPhoto.jsx';
import { locationQuery } from '../../lib/locationQuery.js';
import { MAX_SAVED } from '../../lib/savedCities.js';
import { minutesInZone } from '../../lib/time.js';
import { convertTemp } from '../../lib/units.js';
import { resolveScene } from '../../scene/resolveScene.js';
import { fetchForecast } from '../../services/weatherApi.js';
import { sceneInputFrom } from '../useScene.js';

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
      className="group relative isolate aspect-[16/10] overflow-hidden rounded-[24px] bg-slate-700 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.6)]"
    >
      {scene ? (
        <>
          <WeatherPhoto scene={scene} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" aria-hidden="true" />
        </>
      ) : (
        <div className="absolute inset-0 animate-pulse bg-slate-400/40" />
      )}

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
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Saved places</h1>
          <p className="text-ink-muted mt-1">
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
        <div className="card mx-auto mt-10 flex max-w-md flex-col items-center rounded-[26px] px-8 py-10 text-center">
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
