import { motion } from 'motion/react';
import { NAV_ITEMS } from './navItems.js';

function Logo() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
      <defs>
        <linearGradient id="logo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#f59e9e" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#logo-sky)" />
      <circle cx="26" cy="15" r="6" fill="#ffd76a" />
      <path d="M8 29c0-4 3-6.5 6.5-6.5 1-3 3.6-4.5 6.5-4.5 4 0 6.8 2.8 7 6.5 2.3.3 4 2 4 4.5H8z" fill="#fff" opacity=".95" />
    </svg>
  );
}

// Desktop/tablet: a slim glass rail. The active item gets a pill that glides between items.
export function NavRail({ route, onNavigate }) {
  return (
    <nav
      aria-label="Main"
      className="glass fixed top-4 bottom-4 left-4 z-30 hidden w-[76px] flex-col items-center rounded-[28px] py-5 md:flex"
    >
      <a href="#/" aria-label="SkyCast home" className="mb-8">
        <Logo />
      </a>
      <ul className="flex flex-1 flex-col items-center gap-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon, soon }) => {
          const active = route === id;
          return (
            <li key={id} className={id === 'settings' ? 'mt-auto' : undefined}>
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className="group relative flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium"
              >
                {active && (
                  <motion.span
                    layoutId="rail-active"
                    className="absolute inset-0 rounded-2xl bg-[var(--ink)]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon
                  className={`relative h-5 w-5 transition-colors ${active ? 'text-[var(--glass-bg-strong)]' : 'text-ink-muted group-hover:text-ink'}`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span className={`relative ${active ? 'text-[var(--glass-bg-strong)]' : 'text-ink-muted group-hover:text-ink'}`}>
                  {label}
                </span>
                {soon && !active && (
                  <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-[var(--color-sun)]" title="Coming soon" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
