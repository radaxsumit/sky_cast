import { useMemo } from 'react';
import { applyScenePreview } from '../scene/preview.js';
import { resolveScene } from '../scene/resolveScene.js';

// Neutral pre-load sky (a calm blue hour) shown before the first forecast arrives.
const NEUTRAL = {
  minutesNow: 1100,
  sunriseMin: 400,
  sunsetMin: 1080,
  isDay: false,
  code: 1003,
  text: '',
  cloud: 30,
};

export function sceneInputFrom(data, minutesNow) {
  if (!data) return NEUTRAL;
  const today = data.days[0];
  return {
    minutesNow,
    sunriseMin: today.astro.sunriseMin,
    sunsetMin: today.astro.sunsetMin,
    isDay: data.current.isDay,
    code: data.current.code,
    text: data.current.text,
    cloud: data.current.cloud,
    moonPhase: today.astro.moonPhase,
  };
}

export function useScene(data, minutesNow) {
  const search = typeof window === 'undefined' ? '' : window.location.search;
  return useMemo(
    () => resolveScene(applyScenePreview(sceneInputFrom(data, minutesNow), search)),
    [data, minutesNow, search],
  );
}
