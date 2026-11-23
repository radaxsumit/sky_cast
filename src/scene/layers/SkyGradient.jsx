import { AnimatePresence, motion } from 'motion/react';

// Cross-fades between gradients, since CSS can't transition gradient stops directly.
export function SkyGradient({ sky, reducedMotion }) {
  const key = `${sky.top}${sky.mid}${sky.bottom}`;
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={key}
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 58%, ${sky.bottom} 100%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 1.2, ease: 'easeInOut' }}
      />
    </AnimatePresence>
  );
}
