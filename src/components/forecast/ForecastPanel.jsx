import { CalendarDays, Droplets } from 'lucide-react';
import { tempColor } from '../../lib/describe.js';
import { convertTemp } from '../../lib/units.js';
import { CardTitle, Card } from '../ui/Card.jsx';
import { WeatherIcon } from '../ui/WeatherIcon.jsx';

// Low→high bar on a shared scale across all 3 days, coloured by real temperature.
function TempRangeBar({ day, range, nowC }) {
  const span = range.max - range.min || 1;
  const left = ((day.minC - range.min) / span) * 100;
  const width = ((day.maxC - day.minC) / span) * 100;
  return (
    <div className="bg-ink-faint relative h-1.5 w-full rounded-full" aria-hidden="true">
      <div
        className="absolute inset-y-0 rounded-full"
        style={{
          left: `${left}%`,
          width: `${Math.max(width, 4)}%`,
          background: `linear-gradient(90deg, ${tempColor(day.minC)}, ${tempColor(day.maxC)})`,
        }}
      />
      {nowC != null && (
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--accent)] shadow"
          style={{ left: `${((Math.min(Math.max(nowC, day.minC), day.maxC) - range.min) / span) * 100}%` }}
        />
      )}
    </div>
  );
}

export function ForecastPanel({ days, unit, currentC, className = '' }) {
  const range = { min: Math.min(...days.map((d) => d.minC)), max: Math.max(...days.map((d) => d.maxC)) };
  return (
    <Card className={`flex flex-col p-5 ${className}`}>
      <CardTitle icon={CalendarDays}>3-day forecast</CardTitle>
      <ul className="flex flex-1 flex-col justify-around">
        {days.map((day, i) => (
          <li key={day.date} className="border-ink-faint flex flex-col gap-2.5 border-b py-4 last:border-0">
            <div className="flex items-center gap-3">
              <WeatherIcon code={day.code} isDay text={day.text} size={44} className="-my-1" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight font-semibold">{i === 0 ? 'Today' : day.weekday}</p>
                <p className="text-ink-muted truncate text-sm">{day.text}</p>
              </div>
              {day.chanceOfRain >= 10 && (
                <span className="text-ink-muted flex items-center gap-1 text-sm" title="Chance of rain">
                  <Droplets className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
                  {day.chanceOfRain}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="tabular text-ink-muted w-9 text-sm">{convertTemp(day.minC, day.minF, unit)}°</span>
              <TempRangeBar day={day} range={range} nowC={i === 0 ? currentC : null} />
              <span className="tabular w-9 text-right text-sm font-semibold">{convertTemp(day.maxC, day.maxF, unit)}°</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
