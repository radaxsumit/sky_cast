import { motion } from 'motion/react';
import { useEffect } from 'react';
import { WeatherIcon } from '../../components/ui/WeatherIcon.jsx';
import { convertTemp } from '../../lib/units.js';

// Full-screen standby clock over the live sky (FigJam "2:23"). Esc, click or tap goes back.
export function ClockView({ data, clock, settings, onExit }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onExit();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  const tz = data?.location.tzId;
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true })
    .formatToParts(clock.date)
    .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  const day = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(clock.date);
  const date = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'long', day: 'numeric' }).format(clock.date);

  return (
    <button
      type="button"
      onClick={onExit}
      aria-label="Leave clock"
      className="hero-ink fixed inset-0 z-40 flex cursor-default flex-col items-center justify-center bg-black/25 px-6 text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <p className="font-display tabular flex items-baseline text-[clamp(6rem,24vw,18rem)] leading-[0.85] font-semibold tracking-[-0.05em]">
          {parts.hour}
          <span className="blink mx-[0.02em]">:</span>
          {parts.minute}
          <span className="ml-4 text-[0.18em] font-medium tracking-normal opacity-80">{parts.dayPeriod}</span>
        </p>
        <p className="mt-6 text-xl font-medium sm:text-2xl">
          {day}, {date}
        </p>
        {data && (
          <p className="mt-3 flex items-center gap-2 text-lg opacity-95">
            <WeatherIcon code={data.current.code} isDay={data.current.isDay} text={data.current.text} size={40} />
            <span className="tabular font-semibold">{convertTemp(data.current.tempC, data.current.tempF, settings.unit)}°</span>
            <span>in {data.location.name}</span>
          </p>
        )}
        <p className="mt-10 text-sm opacity-70">Tap anywhere or press Esc to go back</p>
      </motion.div>
    </button>
  );
}
