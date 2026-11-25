import { useCallback } from 'react';
import { addCity, removeCity } from '../lib/savedCities.js';
import { usePersistentState } from './usePersistentState.js';

export function useSavedCities() {
  const [cities, setCities] = usePersistentState('skycast.saved', []);
  const add = useCallback((city) => setCities((list) => addCity(list, city)), [setCities]);
  const remove = useCallback((id) => setCities((list) => removeCity(list, id)), [setCities]);
  const has = useCallback((id) => cities.some((c) => c.id === id), [cities]);
  return { cities, add, remove, has };
}
