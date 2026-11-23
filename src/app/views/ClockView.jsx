import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { WeatherIcon } from '../../components/ui/WeatherIcon.jsx';
import { WeatherPhoto } from '../../components/ui/WeatherPhoto.jsx';
import { convertTemp } from '../../lib/units.js';

// Full-screen standby clock over the current weather photo (FigJam "2:23"). Esc, click or tap goes back.
export function ClockView({ data, scene, clock, settings, onExit }) {
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
    <div className="photo-ink fixed inset-0 z-40 isolate flex flex-col items-center justify-center bg-slate-900 px-6 text-center" onClick={onExit}>
      <WeatherPhoto scene={scene} className="-z-10" />
      <div className="absolute inset-0 -z-10 bg-black/45" aria-hidden="true" />
      <button
        type="button"
        onClick={onExit}
        aria-label="Close clock"
        className="absolute top-5 right-5 rounded-full bg-white/15 p-2.5 backdrop-blur-md hover:bg-white/25"
      >
        <X className="h-5 w-5" />
      </button>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <time className="font-display tabular flex items-baseline text-[clamp(6rem,24vw,18rem)] leading-[0.85] font-semibold tracking-[-0.05em]">
          {parts.hour}
          <span className="blink mx-[0.02em]" aria-hidden="true">
            :
          </span>
          {parts.minute}
          <span className="ml-4 text-[0.18em] font-medium tracking-normal opacity-80">{parts.dayPeriod}</span>
        </time>
        <p className="mt-6 text-xl font-medium sm:text-2xl">
          {day}, {date}
        </p>
        {data && (
          <p className="mt-3 flex items-center gap-2 text-lg">
            <WeatherIcon code={data.current.code} isDay={data.current.isDay} text={data.current.text} size={40} />
            <span className="tabular font-semibold">{convertTemp(data.current.tempC, data.current.tempF, settings.unit)}°</span>
            <span>in {data.location.name}</span>
          </p>
        )}
        <p className="mt-10 text-sm opacity-75">Tap anywhere or press Esc to go back</p>
      </motion.div>
    </div>
  );
}
