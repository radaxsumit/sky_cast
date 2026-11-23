import { useCallback, useEffect, useState } from 'react';

export const ROUTES = ['dashboard', 'saved', 'clock', 'map', 'settings'];

const fromHash = () => {
  const name = window.location.hash.replace(/^#\/?/, '');
  return ROUTES.includes(name) ? name : 'dashboard';
};

// Hash routing keeps the current view across refreshes and makes back/forward work, without a router dependency.
export function useHashRoute() {
  const [route, setRoute] = useState(fromHash);

  useEffect(() => {
    const onChange = () => setRoute(fromHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next) => {
    window.location.hash = next === 'dashboard' ? '/' : `/${next}`;
  }, []);

  return [route, navigate];
}
