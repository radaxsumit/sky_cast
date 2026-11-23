import { motion } from 'motion/react';
import { NAV_ITEMS } from './navItems.js';
import { ThemeSwitch } from './ThemeSwitch.jsx';

function Logo() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
      <defs>
        <linearGradient id="logo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b6cf6" />
          <stop offset="1" stopColor="#7fb3ff" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#logo-sky)" />
      <circle cx="26" cy="15" r="6" fill="#ffcc33" />
      <path d="M8 29c0-4 3-6.5 6.5-6.5 1-3 3.6-4.5 6.5-4.5 4 0 6.8 2.8 7 6.5 2.3.3 4 2 4 4.5H8z" fill="#fff" />
    </svg>
  );
}

// Desktop/tablet: full-height sidebar attached to the left edge.
export function NavRail({ route, onNavigate, dark, onThemeChange }) {
  const main = NAV_ITEMS.filter((i) => i.id !== 'settings');
  const settings = NAV_ITEMS.find((i) => i.id === 'settings');

  const item = ({ id, label, icon: Icon, soon }) => {
    const active = route === id;
    return (
      <li key={id}>
        <button
          type="button"
          onClick={() => onNavigate(id)}
          aria-current={active ? 'page' : undefined}
          className={`group relative flex w-full flex-col items-center gap-1 rounded-2xl py-2.5 text-xs font-medium transition-colors ${active ? 'text-[var(--accent)]' : 'text-ink-muted hover:text-ink hover:bg-ink-faint'}`}
        >
          {active && (
            <>
              <motion.span
                layoutId="rail-bg"
                className="absolute inset-0 rounded-2xl bg-[color-mix(in_srgb,var(--accent)_13%,transparent)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
              <motion.span
                layoutId="rail-bar"
                className="absolute top-1/2 -left-3 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[var(--accent)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            </>
          )}
          <span className="relative">
            <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} />
            {soon && <span className="absolute -top-0.5 -right-1.5 h-2 w-2 rounded-full bg-[var(--color-sun)]" title="Coming soon" />}
          </span>
          <span className="relative">{label}</span>
        </button>
      </li>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-y-0 left-0 z-30 hidden w-[92px] flex-col items-center border-r border-[var(--card-border)] bg-[var(--card)] px-3 py-6 transition-colors duration-500 md:flex"
    >
      <a href="#/" aria-label="SkyCast home" className="mb-1">
        <Logo />
      </a>
      <span className="font-display mb-8 text-sm font-semibold tracking-tight">SkyCast</span>
      <ul className="flex w-full flex-1 flex-col gap-1.5">{main.map(item)}</ul>
      <div className="flex w-full flex-col items-center gap-4">
        <ThemeSwitch dark={dark} onChange={onThemeChange} size="sm" />
        <ul className="w-full">{item(settings)}</ul>
      </div>
    </nav>
  );
}
