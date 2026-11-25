import { motion } from 'motion/react';
import { NAV_ITEMS } from './navItems.js';
import { ThemeSwitch } from './ThemeSwitch.jsx';

function Logo() {
  return (
    <img
      src="/icon-256.png"
      alt=""
      width={44}
      height={44}
      draggable={false}
      className="h-11 w-11 drop-shadow-[0_6px_14px_rgba(47,91,234,0.35)]"
    />
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
