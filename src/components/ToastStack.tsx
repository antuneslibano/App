import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export function ToastStack() {
  const toasts = useGameStore((s) => s.toasts);
  const dismissToast = useGameStore((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => setTimeout(() => dismissToast(t.id), 3000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  return (
    <div
      className="fixed left-4 right-4 z-[90] flex flex-col gap-2 items-center max-w-md mx-auto"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`panel rounded px-4 py-2 text-sm font-display text-center w-full ${
              t.kind === 'penalty' ? 'text-red-300 border-red-500/40' : 'text-blue-200'
            }`}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
