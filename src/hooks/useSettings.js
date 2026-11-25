import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState.js';

export const DEFAULT_SETTINGS = {
  unit: 'C', // 'C' | 'F'
  wind: 'kph', // 'kph' | 'mph'
  appearance: 'auto', // 'auto' (follow the device) | 'light' | 'dark'
  motion: 'system', // 'system' | 'on' (reduce) | 'off' (full)
  defaultCity: null, // SavedCity | null → use geolocation
};

export function useSettings() {
  const [stored, setStored] = usePersistentState('skycast.settings', DEFAULT_SETTINGS);
  const settings = { ...DEFAULT_SETTINGS, ...stored };
  const update = useCallback((patch) => setStored((s) => ({ ...DEFAULT_SETTINGS, ...s, ...patch })), [setStored]);
  return [settings, update];
}
