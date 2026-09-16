import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { rankForLevel, RANK_COLORS } from '../lib/leveling';

export function LevelUpOverlay() {
  const levelUpFlash = useGameStore((s) => s.levelUpFlash);
  const dismissLevelUp = useGameStore((s) => s.dismissLevelUp);

  return (
    <AnimatePresence>
      {levelUpFlash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissLevelUp}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="text-center"
          >
            <motion.p
              initial={{ letterSpacing: '0.1em' }}
              animate={{ letterSpacing: '0.5em' }}
              transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
              className="font-display text-blue-300 text-sm mb-4"
            >
              LEVEL UP
            </motion.p>
            <p className="font-display text-7xl text-white glow-text mb-2">{levelUpFlash}</p>
            <p
              className="font-display text-lg"
              style={{ color: RANK_COLORS[rankForLevel(levelUpFlash)] }}
            >
              Rank {rankForLevel(levelUpFlash)}
            </p>
            <p className="text-blue-200/50 text-xs mt-6">Toque para continuar</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
