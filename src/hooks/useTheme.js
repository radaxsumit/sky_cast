import { useEffect, useState } from 'react';

const QUERY = '(prefers-color-scheme: dark)';

// appearance: 'auto' follows the operating system; 'light' / 'dark' are fixed.
export function useTheme(appearance) {
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.(QUERY).matches ?? false);

  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return undefined;
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const theme = appearance === 'auto' ? (systemDark ? 'dark' : 'light') : appearance;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0e1a' : '#eef1f6');
  }, [theme]);

  return theme;
}
