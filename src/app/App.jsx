import { MotionConfig } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';
import { BottomNav } from '../components/nav/BottomNav.jsx';
import { NavRail } from '../components/nav/NavRail.jsx';
import { DashboardSkeleton } from '../components/ui/Skeleton.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { TopProgress } from '../components/ui/TopProgress.jsx';
import { useHashRoute } from '../hooks/useHashRoute.js';
import { useLocalClock } from '../hooks/useLocalClock.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useSavedCities } from '../hooks/useSavedCities.js';
import { useSettings } from '../hooks/useSettings.js';
import { useTheme } from '../hooks/useTheme.js';
import { FALLBACK_CITY, useInitialLocation, useWeather } from '../hooks/useWeather.js';
import { useScene } from './useScene.js';
import { ClockView } from './views/ClockView.jsx';
import { ComingSoon } from './views/ComingSoon.jsx';
import { Dashboard } from './views/Dashboard.jsx';
import { SavedCities } from './views/SavedCities.jsx';
import { SettingsView } from './views/SettingsView.jsx';

export default function App() {
  const [settings, updateSettings] = useSettings();
  const saved = useSavedCities();
  const [route, navigate] = useHashRoute();
  const { data, status, error, load, lastQuery, clearError } = useWeather();
  const { notice, dismissNotice } = useInitialLocation(settings.defaultCity, load);
  const clock = useLocalClock(data?.location.tzId);
  const scene = useScene(data, clock.minutes);
  const reducedMotion = useReducedMotion(settings.motion);
  const theme = useTheme(settings.appearance);
  const lastRoute = useRef('dashboard');

  useEffect(() => {
    if (route !== 'clock') lastRoute.current = route;
  }, [route]);

  // Refresh the current place every 15 minutes with the query that loaded it, unless a load is already running.
  const busy = status === 'initial' || status === 'refreshing';
  useEffect(() => {
    if (!lastQuery || busy) return undefined;
    const id = setInterval(() => load(lastQuery, { fresh: true }), 15 * 60_000);
    return () => clearInterval(id);
  }, [lastQuery, busy, load]);

  const openPlace = useCallback(
    (q) => {
      load(q);
      navigate('dashboard');
    },
    [load, navigate],
  );

  const toast = error ?? notice;
  const dismiss = error ? clearError : dismissNotice;
  const firstLoad = !data && (status === 'idle' || status === 'initial');

  let view;
  if (route === 'clock') {
    view = <ClockView data={data} scene={scene} clock={clock} settings={settings} onExit={() => navigate(lastRoute.current)} />;
  } else if (route === 'map') {
    view = <ComingSoon onBack={() => navigate('dashboard')} />;
  } else if (route === 'saved') {
    view = <SavedCities saved={saved} settings={settings} onOpen={openPlace} />;
  } else if (route === 'settings') {
    view = <SettingsView settings={settings} update={updateSettings} theme={theme} />;
  } else if (firstLoad) {
    view = <DashboardSkeleton />;
  } else if (data) {
    view = (
      <Dashboard
        data={data}
        scene={scene}
        clock={clock}
        settings={settings}
        onUnitChange={(unit) => updateSettings({ unit })}
        onSearch={load}
        saved={saved}
      />
    );
  } else {
    const retry = lastQuery || (settings.defaultCity ? settings.defaultCity : FALLBACK_CITY);
    view = (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="card max-w-md rounded-[24px] p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Weather couldn’t load</h1>
          <p className="text-ink-muted mt-2">{error ?? 'The weather service did not respond.'}</p>
          <button
            type="button"
            onClick={() => load(retry)}
            className="mt-5 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
      <TopProgress active={status === 'refreshing'} />
      <Toast message={toast} tone={error ? 'error' : 'info'} onDismiss={dismiss} />
      {route !== 'clock' && (
        <>
          <NavRail
            route={route}
            onNavigate={navigate}
            dark={theme === 'dark'}
            onThemeChange={(dark) => updateSettings({ appearance: dark ? 'dark' : 'light' })}
          />
          <BottomNav route={route} onNavigate={navigate} />
        </>
      )}
      <main className={route === 'clock' ? '' : 'min-h-dvh px-4 pt-5 pb-28 sm:px-6 md:pb-10 md:pl-[124px] lg:pr-8 xl:pr-10'}>
        <div className={route === 'clock' ? '' : 'mx-auto w-full max-w-[1360px]'}>{view}</div>
      </main>
    </MotionConfig>
  );
}
