import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';

// Errors stay until dismissed; informational notices fade after 6 s.
export function Toast({ message, tone = 'error', onDismiss }) {
  useEffect(() => {
    if (!message || tone === 'error') return undefined;
    const id = setTimeout(onDismiss, 6000);
    return () => clearTimeout(id);
  }, [message, tone, onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="card pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl py-2.5 pr-2 pl-4 text-sm"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${tone === 'error' ? 'bg-rose-500' : 'bg-[var(--color-sun)]'}`} />
            <span className="text-ink">{message}</span>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="text-ink-muted hover:text-ink rounded-lg p-1.5"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
