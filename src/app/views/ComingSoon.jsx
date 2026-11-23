import { MetIcon } from '../../components/ui/WeatherIcon.jsx';
import { GlassCard } from '../../components/ui/GlassCard.jsx';

export function ComingSoon({ onBack }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <GlassCard className="flex max-w-md flex-col items-center px-8 py-10 text-center">
        <MetIcon name="compass" size={96} />
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">The map is on its way</h1>
        <p className="text-ink-muted mt-3 leading-relaxed">
          Live radar and temperature layers for the places you follow are being built. Until then, the full forecast
          for any city is one search away.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--glass-bg-strong)]"
        >
          Back to today
        </button>
      </GlassCard>
    </div>
  );
}
