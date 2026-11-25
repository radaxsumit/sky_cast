import { motion } from 'motion/react';
import { Droplets } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { scaleTemps, smoothPath } from '../../lib/chart.js';
import { currentHourIndex } from '../../lib/time.js';
import { convertTemp } from '../../lib/units.js';
import { Card } from '../ui/Card.jsx';
import { WeatherIcon } from '../ui/WeatherIcon.jsx';

const CELL = 68;
const CHART_H = 64;

function hourLabel(time) {
  const h = Number(time.slice(0, 2));
  if (h === 0) return '12 am';
  if (h === 12) return '12 pm';
  return h < 12 ? `${h} am` : `${h - 12} pm`;
}

export function HourlyPanel({ days, localtime, minutesNow, unit }) {
  const [dayIndex, setDayIndex] = useState(0);
  const scroller = useRef(null);
  // Follow the live clock so "Now" never lags a cached response.
  const nowIndex = minutesNow != null ? Math.floor(minutesNow / 60) : currentHourIndex(localtime);
  const hours = days[dayIndex].hours;

  const temps = hours.map((h) => convertTemp(h.tempC, h.tempF, unit));
  const ys = scaleTemps(temps, CHART_H, 12);
  const points = ys.map((y, i) => [i * CELL + CELL / 2, y]);
  const line = smoothPath(points);
  const width = hours.length * CELL;

  // Bring "now" into view on Today; start of day otherwise.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: dayIndex === 0 ? Math.max(0, nowIndex * CELL - CELL) : 0, behavior: 'smooth' });
  }, [dayIndex, nowIndex]);

  const tabs = days.map((d, i) => (i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.weekday));

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-ink-muted text-sm font-medium">Hourly forecast</h2>
        <div role="tablist" aria-label="Day" className="bg-ink-faint flex rounded-full p-1">
          {tabs.map((label, i) => (
            <button
              key={label}
              role="tab"
              type="button"
              aria-selected={dayIndex === i}
              onClick={() => setDayIndex(i)}
              className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold sm:text-sm ${dayIndex === i ? 'text-[var(--on-accent)]' : 'text-ink-muted hover:text-ink'}`}
            >
              {dayIndex === i && (
                <motion.span layoutId="day-tab" className="absolute inset-0 rounded-full bg-[var(--accent)]" transition={{ duration: 0.25 }} />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar -mx-4 snap-x overflow-x-auto px-4 sm:-mx-5 sm:px-5" tabIndex={0} aria-label="Hours">
        <div className="relative" style={{ width }}>
          <svg width={width} height={CHART_H} className="block overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="hourly-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--color-sun)" stopOpacity="0.35" />
                <stop offset="1" stopColor="var(--color-sun)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${line} L ${points.at(-1)[0]} ${CHART_H} L ${points[0][0]} ${CHART_H} Z`} fill="url(#hourly-fill)" />
            <motion.path
              key={`${dayIndex}${unit}`}
              d={line}
              fill="none"
              stroke="var(--color-sun)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
            {dayIndex === 0 && points[nowIndex] && (
              <circle cx={points[nowIndex][0]} cy={points[nowIndex][1]} r="5" fill="var(--color-sun)" stroke="white" strokeWidth="2" />
            )}
          </svg>

          <ol className="flex">
            {hours.map((h, i) => {
              const isNow = dayIndex === 0 && i === nowIndex;
              const past = dayIndex === 0 && i < nowIndex;
              return (
                <li
                  key={h.epoch}
                  className={`flex snap-start flex-col items-center gap-1 rounded-2xl py-2 ${isNow ? 'bg-ink-faint' : ''} ${past ? 'opacity-45' : ''}`}
                  style={{ width: CELL }}
                  aria-current={isNow ? 'time' : undefined}
                >
                  <span className="tabular text-ink text-[15px] font-semibold">{temps[i]}°</span>
                  <WeatherIcon code={h.code} isDay={h.isDay} text={h.text} size={36} />
                  <span className="text-ink-muted flex h-4 items-center gap-0.5 text-[11px] font-medium">
                    {h.chanceOfRain >= 10 && (
                      <>
                        <Droplets className="h-3 w-3 text-sky-500" aria-hidden="true" />
                        {h.chanceOfRain}%
                      </>
                    )}
                  </span>
                  <span className={`tabular text-xs ${isNow ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
                    {isNow ? 'Now' : hourLabel(h.time)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Card>
  );
}
