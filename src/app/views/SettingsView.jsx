import { motion } from 'motion/react';
import { LocateFixed, MapPin, X } from 'lucide-react';
import { SearchBox } from '../../components/search/SearchBox.jsx';
import { ThemeSwitch } from '../../components/nav/ThemeSwitch.jsx';
import { Card } from '../../components/ui/Card.jsx';

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
          className={`relative rounded-full px-4 py-2 text-sm font-semibold ${value === v ? 'text-[var(--on-accent)]' : 'text-ink-muted hover:text-ink'}`}
        >
          {value === v && (
            <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-[var(--accent)]" transition={{ duration: 0.25 }} />
          )}
          <span className="relative">{text}</span>
        </button>
      ))}
    </div>
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

export function SettingsView({ settings, update, theme }) {
  return (
    <div className="mx-auto max-w-3xl pt-2">
      <h1 className="font-display mb-6 text-4xl font-semibold tracking-tight">Settings</h1>

      <Card className="px-6 py-2 sm:px-8">
        <Row title="Temperature">
          <Segmented id="unit" label="Temperature unit" value={settings.unit} onChange={(unit) => update({ unit })} options={[['C', '°C'], ['F', '°F']]} />
        </Row>
        <Row title="Wind speed">
          <Segmented id="wind" label="Wind unit" value={settings.wind} onChange={(wind) => update({ wind })} options={[['kph', 'km/h'], ['mph', 'mph']]} />
        </Row>
        <Row title="Theme" hint="Auto follows your device's light or dark setting.">
          <Segmented
            id="appearance"
            label="Theme"
            value={settings.appearance}
            onChange={(appearance) => update({ appearance })}
            options={[['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]}
          />
          <ThemeSwitch dark={theme === 'dark'} onChange={(dark) => update({ appearance: dark ? 'dark' : 'light' })} size="sm" />
        </Row>
        <Row title="Motion" hint="Reduce turns off animations and transitions.">
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
      </Card>
    </div>
  );
}
