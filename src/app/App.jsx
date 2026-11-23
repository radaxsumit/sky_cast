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
import { useInitialLocation, useWeather } from '../hooks/useWeather.js';
import { SkyScene } from '../scene/SkyScene.jsx';
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
  const { data, status, error, load, clearError } = useWeather();
  const { notice, dismissNotice } = useInitialLocation(settings.defaultCity, load);
  const clock = useLocalClock(data?.location.tzId, 30_000);
  const scene = useScene(data, clock.minutes);
  const reducedMotion = useReducedMotion(settings.motion);
  const lastRoute = useRef('dashboard');

  // Glass tint: follows the sky unless the person forced Light or Dark. The sky itself never changes.
  const glass = settings.appearance === 'auto' ? scene.glass : settings.appearance;
  useEffect(() => {
    document.documentElement.dataset.glass = glass;
  }, [glass]);

  useEffect(() => {
    if (route !== 'clock') lastRoute.current = route;
  }, [route]);

  // Refresh the current place every 15 minutes while the tab is open.
  const query = data ? `${data.location.lat},${data.location.lon}` : null;
  useEffect(() => {
    if (!query) return undefined;
    const id = setInterval(() => load(query), 15 * 60_000);
    return () => clearInterval(id);
  }, [query, load]);

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
    view = <ClockView data={data} clock={clock} settings={settings} onExit={() => navigate(lastRoute.current)} />;
  } else if (route === 'map') {
    view = <ComingSoon onBack={() => navigate('dashboard')} />;
  } else if (route === 'saved') {
    view = <SavedCities saved={saved} settings={settings} onOpen={openPlace} onSearch={openPlace} />;
  } else if (route === 'settings') {
    view = <SettingsView settings={settings} update={updateSettings} />;
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
    view = (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="glass max-w-md rounded-[26px] p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Weather couldn’t load</h1>
          <p className="text-ink-muted mt-2">{error ?? 'The weather service did not respond.'}</p>
          <button
            type="button"
            onClick={() => load('Mumbai')}
            className="mt-5 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--glass-bg-strong)]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
      <SkyScene scene={scene} reducedMotion={reducedMotion} />
      <TopProgress active={status === 'refreshing'} />
      <Toast message={toast} tone={error ? 'error' : 'info'} onDismiss={dismiss} />
      {route !== 'clock' && <NavRail route={route} onNavigate={navigate} />}
      {route !== 'clock' && <BottomNav route={route} onNavigate={navigate} />}
      <main
        className={
          route === 'clock'
            ? ''
            : 'mx-auto w-full max-w-[1400px] px-4 pt-4 pb-28 sm:px-6 md:pr-8 md:pb-10 md:pl-[116px] lg:pr-10'
        }
      >
        {view}
      </main>
    </MotionConfig>
  );
}
