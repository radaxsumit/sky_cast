import { motion } from 'motion/react';
import { NAV_ITEMS } from './navItems.js';

// Mobile: floating black pill with a white circle behind the active icon.
export function BottomNav({ route, onNavigate }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] z-30 flex justify-center px-4 md:hidden"
    >
      <ul className="flex items-center gap-1 rounded-full bg-[#06080f]/90 p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/10 backdrop-blur-xl">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = route === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className="relative flex h-12 w-12 items-center justify-center rounded-full"
              >
                {active && (
                  <motion.span
                    layoutId="pill-active"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                  />
                )}
                <Icon className={`relative h-5 w-5 ${active ? 'text-[#06080f]' : 'text-white/75'}`} strokeWidth={2} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
