import { useCallback, useEffect, useRef, useState } from 'react';
import { createLatest } from '../lib/latest.js';
import { locationQuery } from '../lib/locationQuery.js';
import { fetchForecast } from '../services/weatherApi.js';

export const FALLBACK_CITY = 'Mumbai';

/**
 * status: 'idle' → 'initial' (first load) → 'ready'; later loads go 'refreshing' → 'ready'.
 * On error the last good `data` stays on screen and `error` holds a message; status is 'error' only with no data.
 */
export function useWeather() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [latest] = useState(createLatest);
  const hasData = useRef(false);

  const load = useCallback(async (query) => {
    const q = typeof query === 'string' ? query.trim() : locationQuery(query);
    if (!q) return;
    const token = latest.next();
    setStatus(hasData.current ? 'refreshing' : 'initial');
    setError(null);
    try {
      const model = await fetchForecast(q);
      if (!latest.isLatest(token)) return;
      hasData.current = true;
      setData(model);
      setStatus('ready');
    } catch (e) {
      if (!latest.isLatest(token)) return;
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setStatus(hasData.current ? 'ready' : 'error');
    }
  }, [latest]);

  const clearError = useCallback(() => setError(null), []);

  return { data, status, error, load, clearError };
}

/**
 * First load: a fixed default city from Settings wins; otherwise geolocation, falling back to FALLBACK_CITY.
 * Guarded by a ref so React StrictMode's double effect doesn't ask for location twice.
 */
export function useInitialLocation(defaultCity, load) {
  const started = useRef(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (defaultCity) {
      load(defaultCity);
      return;
    }
    const fallback = () => {
      setNotice(`Location unavailable, showing ${FALLBACK_CITY}`);
      load(FALLBACK_CITY);
    };
    if (!('geolocation' in navigator)) {
      fallback();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => load(`${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`),
      fallback,
      { timeout: 8000, maximumAge: 600_000 },
    );
  }, [defaultCity, load]);

  return { notice, dismissNotice: () => setNotice(null) };
}
