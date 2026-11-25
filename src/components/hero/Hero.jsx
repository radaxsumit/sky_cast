import { AnimatePresence, motion } from 'motion/react';
import { Star } from 'lucide-react';
import { findSaved } from '../../lib/savedCities.js';
import { convertTemp } from '../../lib/units.js';
import { SearchBox } from '../search/SearchBox.jsx';
import { WeatherIcon } from '../ui/WeatherIcon.jsx';
import { WeatherPhoto } from '../ui/WeatherPhoto.jsx';
import { SunArc } from './SunArc.jsx';

function UnitToggle({ unit, onChange }) {
  return (
    <div role="group" aria-label="Temperature unit" className="card flex h-11 items-center rounded-2xl p-1">
      {['C', 'F'].map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          aria-pressed={unit === u}
          className={`relative h-9 w-10 rounded-xl text-sm font-semibold ${unit === u ? 'text-[var(--on-accent)]' : 'text-ink-muted'}`}
        >
          {unit === u && (
            <motion.span layoutId="unit-pill" className="absolute inset-0 rounded-xl bg-[var(--accent)]" transition={{ duration: 0.25 }} />
          )}
          <span className="relative">°{u}</span>
        </button>
      ))}
    </div>
  );
}

/** Page header: place, date, save, search and unit. */
export function PlaceHeader({ data, clock, unit, onUnitChange, onSearch, saved }) {
  const { location } = data;
  const savedHere = findSaved(saved.cities, location.lat, location.lon);
  const dateLine = new Intl.DateTimeFormat('en-GB', {
    timeZone: location.tzId,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(clock.date);

  const toggleSave = () => {
    if (savedHere) saved.remove(savedHere.id);
    else
      saved.add({
        id: `${location.lat},${location.lon}`,
        name: location.name,
        region: location.region,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
      });
  };

  return (
    <header className="relative z-20 mb-5 flex flex-col-reverse gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight">{location.name}</h1>
          <button
            type="button"
            onClick={toggleSave}
            aria-pressed={Boolean(savedHere)}
            aria-label={savedHere ? `Remove ${location.name} from saved` : `Save ${location.name}`}
            className="text-ink-muted hover:bg-ink-faint rounded-xl p-2"
          >
            <Star className={`h-5 w-5 ${savedHere ? 'fill-[var(--color-sun)] text-[var(--color-sun)]' : ''}`} />
          </button>
        </div>
        <p className="text-ink-muted text-[15px]">
          {[location.region, location.country].filter(Boolean).join(', ')}
          <span aria-hidden="true"> — </span>
          {dateLine}
        </p>
      </div>
      <div className="flex w-full gap-3 lg:w-[440px]">
        <SearchBox onSelect={onSearch} saved={saved} className="flex-1" />
        <UnitToggle unit={unit} onChange={onUnitChange} />
      </div>
    </header>
  );
}

/** The photo card: a real photograph for this weather and time of day, with current conditions on top. */
export function Hero({ data, scene, clock, unit, className = '' }) {
  const { current, days } = data;
  const today = days[0];
  const temp = convertTemp(current.tempC, current.tempF, unit);

  return (
    <section
      aria-label="Current weather"
      className={`relative isolate flex min-h-[380px] flex-col overflow-hidden rounded-[30px] bg-slate-800 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.55)] sm:min-h-[420px] sm:p-8 ${className}`}
    >
      <WeatherPhoto scene={scene} className="-z-10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-black/10 to-black/25" aria-hidden="true" />

      <div className="photo-ink flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 truncate rounded-full bg-black/25 py-1 pr-4 pl-1.5 text-sm font-medium whitespace-nowrap backdrop-blur-md [text-shadow:none]">
          <WeatherIcon code={current.code} isDay={current.isDay} text={current.text} size={32} className="-my-1" />
          {current.text}
        </span>
        <span className="tabular shrink-0 rounded-full bg-black/25 px-3.5 py-1.5 text-sm font-medium whitespace-nowrap backdrop-blur-md [text-shadow:none]">
          {clock.label}
          <span className="hidden sm:inline"> local time</span>
        </span>
      </div>

      <div className="photo-ink mt-auto flex flex-col gap-6 pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-start">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${temp}${unit}`}
                initial={{ y: 30, opacity: 0, filter: 'blur(6px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -24, opacity: 0, filter: 'blur(6px)' }}
                transition={{ type: 'spring', stiffness: 170, damping: 22 }}
                className="font-display tabular block text-[clamp(6.5rem,15vw,10.5rem)] leading-[0.82] font-semibold tracking-[-0.06em]"
              >
                {temp}
              </motion.span>
            </AnimatePresence>
            <span className="font-display mt-2 text-[clamp(2.25rem,5vw,3.75rem)] leading-none font-light">°{unit}</span>
          </div>
          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
            <div>
              <dt className="inline opacity-85">Feels like </dt>
              <dd className="tabular inline font-semibold">{convertTemp(current.feelsC, current.feelsF, unit)}°</dd>
            </div>
            <div>
              <dt className="inline opacity-85">High </dt>
              <dd className="tabular inline font-semibold">{convertTemp(today.maxC, today.maxF, unit)}°</dd>
            </div>
            <div>
              <dt className="inline opacity-85">Low </dt>
              <dd className="tabular inline font-semibold">{convertTemp(today.minC, today.minF, unit)}°</dd>
            </div>
          </dl>
        </div>
        <SunArc
          body={scene.body}
          sunrise={today.astro.sunrise}
          sunset={today.astro.sunset}
          sunriseMin={today.astro.sunriseMin}
          sunsetMin={today.astro.sunsetMin}
          minutesNow={clock.minutes}
        />
      </div>
    </section>
  );
}
