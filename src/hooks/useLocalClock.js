import { useEffect, useState } from 'react';
import { minutesInZone } from '../lib/time.js';

// Wall-clock time in the searched city's timezone, re-rendering every `intervalMs`.
export function useLocalClock(tzId, intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [tzId, intervalMs]);

  const zone = tzId || undefined;
  return {
    date: now,
    minutes: tzId ? minutesInZone(now, tzId) : now.getHours() * 60 + now.getMinutes(),
    label: new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' }).format(now),
  };
}
