import { motion } from 'motion/react';
import { LocateFixed, MapPin, X } from 'lucide-react';
import { SearchBox } from '../../components/search/SearchBox.jsx';
import { GlassCard } from '../../components/ui/GlassCard.jsx';

function Segmented({ label, value, options, onChange, id }) {
  return (
    <div role="radiogroup" aria-label={label} className="bg-ink-faint inline-flex rounded-full p-1">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`relative rounded-full px-4 py-2 text-sm font-semibold ${value === v ? 'text-[var(--glass-bg-strong)]' : 'text-ink-muted hover:text-ink'}`}
        >
          {value === v && (
            <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-[var(--ink)]" transition={{ duration: 0.25 }} />
          )}
          <span className="relative">{text}</span>
        </button>
      ))}
    </div>
  );
}

// Sun/moon switch (FigJam toggle reference) for forcing Light or Dark panels.
function DayNightSwitch({ dark, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark panels"
      onClick={() => onChange(!dark)}
      className="relative h-12 w-24 shrink-0 overflow-hidden rounded-full shadow-inner ring-1 ring-black/10 transition-colors duration-500"
      style={{ background: dark ? 'linear-gradient(135deg,#1b2347,#2f3a6b)' : 'linear-gradient(135deg,#5aa6ef,#9fd0ff)' }}
    >
      {/* clouds by day, stars by night */}
      <span className={`absolute right-2 bottom-1 h-5 w-10 rounded-full bg-white/80 blur-[1px] transition-opacity duration-500 ${dark ? 'opacity-0' : 'opacity-100'}`} />
      {[18, 30, 44].map((x, i) => (
        <span
          key={x}
          className={`absolute h-1 w-1 rounded-full bg-white transition-opacity duration-500 ${dark ? 'opacity-90' : 'opacity-0'}`}
          style={{ left: x, top: 12 + (i % 2) * 14 }}
        />
      ))}
      <motion.span
        className="absolute top-1.5 h-9 w-9 rounded-full shadow-md"
        animate={{ left: dark ? 54 : 6, background: dark ? '#dfe4f2' : '#ffcf3f' }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        {dark && (
          <>
            <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-[#b9c1d8]" />
            <span className="absolute right-2 bottom-2 h-2.5 w-2.5 rounded-full bg-[#b9c1d8]" />
          </>
        )}
      </motion.span>
    </button>
  );
}

function Row({ title, hint, children }) {
  return (
    <div className="border-ink-faint flex flex-col gap-3 border-b py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-sm">
        <h3 className="font-semibold">{title}</h3>
        {hint && <p className="text-ink-muted mt-0.5 text-sm">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

export function SettingsView({ settings, update }) {
  const forced = settings.appearance !== 'auto';
  return (
    <div className="mx-auto max-w-3xl pt-2">
      <h1 className="font-display hero-ink mb-6 text-4xl font-semibold tracking-tight">Settings</h1>

      <GlassCard className="px-6 py-2 sm:px-8">
        <Row title="Temperature">
          <Segmented id="unit" label="Temperature unit" value={settings.unit} onChange={(unit) => update({ unit })} options={[['C', '°C'], ['F', '°F']]} />
        </Row>
        <Row title="Wind speed">
          <Segmented id="wind" label="Wind unit" value={settings.wind} onChange={(wind) => update({ wind })} options={[['kph', 'km/h'], ['mph', 'mph']]} />
        </Row>
        <Row title="Panels" hint="Auto matches the sky: light panels by day, dark at night. The sky always shows the real time and weather.">
          <Segmented
            id="appearance"
            label="Panel appearance"
            value={forced ? 'manual' : 'auto'}
            onChange={(v) => update({ appearance: v === 'auto' ? 'auto' : 'light' })}
            options={[['auto', 'Auto'], ['manual', 'Manual']]}
          />
          {forced && <DayNightSwitch dark={settings.appearance === 'dark'} onChange={(dark) => update({ appearance: dark ? 'dark' : 'light' })} />}
        </Row>
        <Row title="Motion" hint="Reduce turns off drifting clouds, rain, snow and lightning.">
          <Segmented
            id="motion"
            label="Motion"
            value={settings.motion}
            onChange={(motion) => update({ motion })}
            options={[['system', 'System'], ['on', 'Reduce'], ['off', 'Full']]}
          />
        </Row>
        <Row title="Start with" hint="The place shown when SkyCast opens.">
          {settings.defaultCity ? (
            <span className="bg-ink-faint flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-3 text-sm font-semibold">
              <MapPin className="h-4 w-4" />
              {settings.defaultCity.name}
              <button
                type="button"
                onClick={() => update({ defaultCity: null })}
                aria-label="Use my location instead"
                className="rounded-full p-1 hover:bg-[var(--ink-faint)]"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ) : (
            <span className="text-ink-muted flex items-center gap-2 text-sm">
              <LocateFixed className="h-4 w-4" /> My location
            </span>
          )}
        </Row>
        <div className="pb-5">
          <SearchBox
            placeholder="Choose a starting city"
            onSelect={(q, place) => update({ defaultCity: place ?? { name: q } })}
          />
        </div>
      </GlassCard>
    </div>
  );
}
