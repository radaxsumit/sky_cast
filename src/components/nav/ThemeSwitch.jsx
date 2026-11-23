import { motion } from 'motion/react';

// Sun-and-clouds / moon-and-stars switch (FigJam toggle reference).
export function ThemeSwitch({ dark, onChange, size = 'md' }) {
  const s = size === 'sm' ? { w: 56, h: 30, knob: 22, pad: 4 } : { w: 88, h: 44, knob: 34, pad: 5 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={() => onChange(!dark)}
      className="relative shrink-0 overflow-hidden rounded-full shadow-inner ring-1 ring-black/10 transition-colors duration-500"
      style={{
        width: s.w,
        height: s.h,
        background: dark ? 'linear-gradient(135deg,#1b2347,#323d72)' : 'linear-gradient(135deg,#4f9df0,#a7d4ff)',
      }}
    >
      <span
        className={`absolute rounded-full bg-white/85 blur-[1px] transition-opacity duration-500 ${dark ? 'opacity-0' : 'opacity-100'}`}
        style={{ right: s.pad, bottom: s.pad - 1, width: s.w * 0.42, height: s.h * 0.42 }}
      />
      {[0.22, 0.36, 0.5].map((x, i) => (
        <span
          key={x}
          className={`absolute h-[3px] w-[3px] rounded-full bg-white transition-opacity duration-500 ${dark ? 'opacity-90' : 'opacity-0'}`}
          style={{ left: s.w * x, top: s.h * (i % 2 ? 0.62 : 0.28) }}
        />
      ))}
      <motion.span
        className="absolute rounded-full shadow-md"
        style={{ top: (s.h - s.knob) / 2, width: s.knob, height: s.knob }}
        animate={{ left: dark ? s.w - s.knob - s.pad : s.pad, background: dark ? '#dfe4f2' : '#ffcc33' }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        {dark && (
          <>
            <span className="absolute rounded-full bg-[#b6bed6]" style={{ top: '22%', left: '22%', width: '24%', height: '24%' }} />
            <span className="absolute rounded-full bg-[#b6bed6]" style={{ bottom: '20%', right: '22%', width: '30%', height: '30%' }} />
          </>
        )}
      </motion.span>
    </button>
  );
}
