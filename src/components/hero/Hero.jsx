import { AnimatePresence, motion } from 'motion/react';
import { Star } from 'lucide-react';
import { findSaved } from '../../lib/savedCities.js';
import { convertTemp } from '../../lib/units.js';
import { SearchBox } from '../search/SearchBox.jsx';
import { WeatherIcon } from '../ui/WeatherIcon.jsx';
import { SunArc } from './SunArc.jsx';

function UnitToggle({ unit, onChange }) {
  return (
    <div role="group" aria-label="Temperature unit" className="glass flex h-11 items-center rounded-2xl p-1">
      {['C', 'F'].map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          aria-pressed={unit === u}
          className={`relative h-9 w-10 rounded-xl text-sm font-semibold ${unit === u ? 'text-[var(--glass-bg-strong)]' : 'text-ink-muted'}`}
        >
          {unit === u && (
            <motion.span layoutId="unit-pill" className="absolute inset-0 rounded-xl bg-[var(--ink)]" transition={{ duration: 0.25 }} />
          )}
          <span className="relative">°{u}</span>
        </button>
      ))}
    </div>
  );
}

export function Hero({ data, scene, clock, settings, onUnitChange, onSearch, saved }) {
  const { location, current, days } = data;
  const today = days[0];
  const unit = settings.unit;
  const temp = convertTemp(current.tempC, current.tempF, unit);
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
    <header className="relative z-20 pt-2 pb-8 md:pb-12">
      <div className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="hero-ink">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{location.name}</h1>
            <button
              type="button"
              onClick={toggleSave}
              aria-pressed={Boolean(savedHere)}
              aria-label={savedHere ? `Remove ${location.name} from saved` : `Save ${location.name}`}
              className="rounded-xl p-2 transition-colors hover:bg-white/15"
            >
              <Star className={`h-5 w-5 ${savedHere ? 'fill-[var(--color-sun)] text-[var(--color-sun)]' : ''}`} />
            </button>
          </div>
          <p className="mt-0.5 text-[15px] opacity-90">{[location.region, location.country].filter(Boolean).join(', ')}</p>
          <p className="tabular mt-0.5 text-[15px] opacity-90">
            {dateLine}, {clock.label}
          </p>
        </div>
        <div className="flex w-full gap-3 lg:w-[420px]">
          <SearchBox onSelect={onSearch} saved={saved} className="flex-1" />
          <UnitToggle unit={unit} onChange={onUnitChange} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="hero-ink">
          <div className="flex items-start">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${temp}${unit}`}
                initial={{ y: 40, opacity: 0, filter: 'blur(8px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -30, opacity: 0, filter: 'blur(8px)' }}
                transition={{ type: 'spring', stiffness: 160, damping: 20 }}
                className="font-display tabular block text-[clamp(7rem,20vw,13.5rem)] leading-[0.82] font-semibold tracking-[-0.06em]"
              >
                {temp}
              </motion.span>
            </AnimatePresence>
            <span className="font-display mt-3 text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-light">°</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <WeatherIcon code={current.code} isDay={current.isDay} text={current.text} size={56} className="-my-2 drop-shadow" />
            <p className="font-display text-2xl font-medium tracking-tight sm:text-[1.7rem]">{current.text}</p>
          </div>
          <dl className="mt-3 flex gap-5 text-[15px]">
            <div>
              <dt className="inline opacity-80">Feels like </dt>
              <dd className="tabular inline font-semibold">{convertTemp(current.feelsC, current.feelsF, unit)}°</dd>
            </div>
            <div>
              <dt className="inline opacity-80">High </dt>
              <dd className="tabular inline font-semibold">{convertTemp(today.maxC, today.maxF, unit)}°</dd>
            </div>
            <div>
              <dt className="inline opacity-80">Low </dt>
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
    </header>
  );
}
