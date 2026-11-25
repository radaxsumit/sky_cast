import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// setting: 'system' follows the OS, 'on' always reduces, 'off' never reduces.
export function useReducedMotion(setting = 'system') {
  const [systemReduce, setSystemReduce] = useState(() => window.matchMedia?.(QUERY).matches ?? false);

  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return undefined;
    const onChange = (e) => setSystemReduce(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (setting === 'on') return true;
  if (setting === 'off') return false;
  return systemReduce;
}
