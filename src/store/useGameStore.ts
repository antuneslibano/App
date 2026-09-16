import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, LogEntry, Quest, Rank, StatKey } from '../types';
import { DIFFICULTY_PENALTY, DIFFICULTY_XP, xpForLevel } from '../lib/leveling';
import { todayStr } from '../lib/date';

interface Toast {
  id: string;
  text: string;
  kind: 'xp' | 'levelup' | 'penalty';
}

interface GameState {
  character: Character;
  quests: Quest[];
  log: LogEntry[];
  lastResetDate: string;
  penaltyEnabled: boolean;
  levelUpFlash: number | null;
  toasts: Toast[];
  setName: (name: string) => void;
  addQuest: (input: { title: string; description?: string; difficulty: Rank; stat?: StatKey; isDaily: boolean }) => void;
  deleteQuest: (id: string) => void;
  toggleQuest: (id: string) => void;
  allocateStat: (stat: StatKey) => void;
  checkDailyReset: () => void;
  togglePenalty: () => void;
  dismissLevelUp: () => void;
  dismissToast: (id: string) => void;
  resetGame: () => void;
}

function mkLog(message: string, type: LogEntry['type']): LogEntry {
  return { id: crypto.randomUUID(), message, type, timestamp: new Date().toISOString() };
}

function applyXp(character: Character, delta: number): { character: Character; leveledUpTo: number | null } {
  let { level, xp, statPoints } = character;
  xp += delta;
  let leveledUpTo: number | null = null;

  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
    statPoints += 3;
    leveledUpTo = level;
  }
  while (xp < 0 && level > 1) {
    level -= 1;
    xp += xpForLevel(level);
    statPoints = Math.max(0, statPoints - 3);
  }
  if (level === 1 && xp < 0) xp = 0;

  return { character: { ...character, level, xp, statPoints }, leveledUpTo };
}

function defaultCharacter(): Character {
  return {
    name: 'Caçador',
    level: 1,
    xp: 0,
    statPoints: 0,
    stats: { str: 10, vit: 10, int: 10, per: 10, agi: 10 },
  };
}

function seedQuests(): Quest[] {
  const now = new Date().toISOString();
  const base = { createdAt: now, completed: false, completedToday: false, streak: 0 };
  return [
    { id: crypto.randomUUID(), title: '100 flexões', difficulty: 'D', stat: 'str', isDaily: true, ...base },
    { id: crypto.randomUUID(), title: '100 abdominais', difficulty: 'D', stat: 'vit', isDaily: true, ...base },
    { id: crypto.randomUUID(), title: '100 agachamentos', difficulty: 'D', stat: 'agi', isDaily: true, ...base },
    { id: crypto.randomUUID(), title: 'Ler por 30 minutos', difficulty: 'E', stat: 'int', isDaily: true, ...base },
    {
      id: crypto.randomUUID(),
      title: 'Arrumar a cama',
      description: 'Comece o dia com uma vitória fácil.',
      difficulty: 'E',
      stat: 'per',
      isDaily: true,
      ...base,
    },
  ];
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      character: defaultCharacter(),
      quests: seedQuests(),
      log: [mkLog('Sistema iniciado. Bem-vindo, Caçador.', 'system')],
      lastResetDate: todayStr(),
      penaltyEnabled: true,
      levelUpFlash: null,
      toasts: [],

      setName: (name) =>
        set((state) => ({ character: { ...state.character, name: name.trim() || state.character.name } })),

      addQuest: ({ title, description, difficulty, stat, isDaily }) =>
        set((state) => {
          const quest: Quest = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description?.trim() || undefined,
            difficulty,
            stat,
            isDaily,
            createdAt: new Date().toISOString(),
            completed: false,
            completedToday: false,
            streak: 0,
          };
          return {
            quests: [quest, ...state.quests],
            log: [mkLog(`Nova missão registrada: "${quest.title}"`, 'system'), ...state.log].slice(0, 50),
          };
        }),

      deleteQuest: (id) => set((state) => ({ quests: state.quests.filter((q) => q.id !== id) })),

      toggleQuest: (id) =>
        set((state) => {
          const quest = state.quests.find((q) => q.id === id);
          if (!quest) return state;

          const isDone = quest.isDaily ? quest.completedToday : quest.completed;
          const xpAmount = DIFFICULTY_XP[quest.difficulty];
          const delta = isDone ? -xpAmount : xpAmount;

          const { character: nextCharacterBase, leveledUpTo } = applyXp(state.character, delta);
          let stats = nextCharacterBase.stats;
          if (quest.stat) {
            const change = isDone ? -1 : 1;
            stats = { ...stats, [quest.stat]: Math.max(0, stats[quest.stat] + change) };
          }
          const character = { ...nextCharacterBase, stats };

          const quests = state.quests.map((q) => {
            if (q.id !== id) return q;
            if (q.isDaily) {
              return {
                ...q,
                completedToday: !isDone,
                lastCompletedDate: !isDone ? todayStr() : q.lastCompletedDate,
                streak: !isDone ? q.streak + 1 : Math.max(0, q.streak - 1),
              };
            }
            return { ...q, completed: !isDone };
          });

          const newLogs: LogEntry[] = [];
          const toasts = [...state.toasts];
          if (!isDone) {
            newLogs.push(mkLog(`Missão concluída: "${quest.title}" (+${xpAmount} XP)`, 'quest'));
            toasts.push({ id: crypto.randomUUID(), text: `+${xpAmount} XP — ${quest.title}`, kind: 'xp' });
            if (leveledUpTo) {
              newLogs.push(mkLog(`Você subiu para o nível ${leveledUpTo}!`, 'levelup'));
            }
          } else {
            newLogs.push(mkLog(`Missão desfeita: "${quest.title}"`, 'system'));
          }

          return {
            character,
            quests,
            log: [...newLogs, ...state.log].slice(0, 50),
            levelUpFlash: leveledUpTo ?? state.levelUpFlash,
            toasts,
          };
        }),

      allocateStat: (stat) =>
        set((state) => {
          if (state.character.statPoints <= 0) return state;
          return {
            character: {
              ...state.character,
              statPoints: state.character.statPoints - 1,
              stats: { ...state.character.stats, [stat]: state.character.stats[stat] + 1 },
            },
          };
        }),

      checkDailyReset: () =>
        set((state) => {
          const today = todayStr();
          if (state.lastResetDate === today) return state;

          let character = state.character;
          const newLogs: LogEntry[] = [];
          const toasts = [...state.toasts];

          const quests = state.quests.map((q) => {
            if (!q.isDaily) return q;
            if (!q.completedToday) {
              if (state.penaltyEnabled) {
                const penalty = DIFFICULTY_PENALTY[q.difficulty];
                const result = applyXp(character, -penalty);
                character = result.character;
                newLogs.push(mkLog(`Penalidade: "${q.title}" não foi concluída. -${penalty} XP`, 'penalty'));
                toasts.push({ id: crypto.randomUUID(), text: `Penalidade: -${penalty} XP`, kind: 'penalty' });
              }
              return { ...q, completedToday: false, streak: 0 };
            }
            return { ...q, completedToday: false };
          });

          newLogs.push(mkLog('Um novo dia começou. Missões diárias reiniciadas.', 'system'));

          return { character, quests, lastResetDate: today, log: [...newLogs, ...state.log].slice(0, 50), toasts };
        }),

      togglePenalty: () => set((state) => ({ penaltyEnabled: !state.penaltyEnabled })),

      dismissLevelUp: () => set({ levelUpFlash: null }),

      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      resetGame: () =>
        set({
          character: defaultCharacter(),
          quests: seedQuests(),
          log: [mkLog('Sistema reiniciado.', 'system')],
          lastResetDate: todayStr(),
          penaltyEnabled: true,
          levelUpFlash: null,
          toasts: [],
        }),
    }),
    { name: 'solo-leveling-save-v1' },
  ),
);
