import { useEffect, useState } from 'react';

// Occasional double-flash every 5–12 s.
export function Lightning() {
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        setFlash((n) => n + 1);
        schedule();
      }, 5000 + Math.random() * 7000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return <div key={flash} className={flash ? 'sky-flash absolute inset-0 bg-white' : 'absolute inset-0 opacity-0'} />;
}
