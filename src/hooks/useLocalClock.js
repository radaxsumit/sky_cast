import { useEffect, useState } from 'react';
import { minutesInZone } from '../lib/time.js';

// Wall-clock time in the searched city's timezone. Ticks on each minute boundary so clocks never lag.
export function useLocalClock(tzId) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer;
    const schedule = () => {
      const msToNextMinute = 60_000 - (Date.now() % 60_000) + 50;
      timer = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, msToNextMinute);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return {
    date: now,
    minutes: tzId ? minutesInZone(now, tzId) : now.getHours() * 60 + now.getMinutes(),
    label: new Intl.DateTimeFormat('en-US', { timeZone: tzId || undefined, hour: 'numeric', minute: '2-digit' }).format(now),
  };
}
