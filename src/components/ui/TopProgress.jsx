import { AnimatePresence, motion } from 'motion/react';

export function TopProgress({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-[var(--color-sun)]"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.85, transition: { duration: 2.5, ease: [0.1, 0.7, 0.3, 1] } }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.35 } }}
        />
      )}
    </AnimatePresence>
  );
}
