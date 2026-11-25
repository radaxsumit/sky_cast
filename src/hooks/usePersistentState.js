import { useEffect, useState } from 'react';

// useState mirrored to localStorage. Storage may be unavailable (private mode), so every access is guarded.
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable: keep working in memory */
    }
  }, [key, value]);

  return [value, setValue];
}
