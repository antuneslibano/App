import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, LogEntry, Period, Quest, Rank, StatKey, Streaks } from '../types';
import { PERIOD_LABELS, questPenalty, questXp, xpForLevel } from '../lib/leveling';
import { currentMonthAnchor, currentWeekAnchor, todayStr } from '../lib/date';
import { generatePeriodQuests } from '../lib/questPool';

interface Toast {
  id: string;
  text: string;
  kind: 'xp' | 'levelup' | 'penalty';
}

type RecurringPeriod = 'daily' | 'weekly' | 'monthly';

interface GameState {
  character: Character;
  quests: Quest[];
  log: LogEntry[];
  lastDailyReset: string;
  lastWeeklyReset: string;
  lastMonthlyReset: string;
  streaks: Streaks;
  penaltyEnabled: boolean;
  levelUpFlash: number | null;
  toasts: Toast[];
  setName: (name: string) => void;
  addQuest: (input: { title: string; description?: string; difficulty: Rank; stat?: StatKey }) => void;
  deleteQuest: (id: string) => void;
  toggleQuest: (id: string) => void;
  allocateStat: (stat: StatKey) => void;
  checkResets: () => void;
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
  return [...generatePeriodQuests('daily'), ...generatePeriodQuests('weekly'), ...generatePeriodQuests('monthly')];
}

/** Resolves a finished cycle for one recurring period: applies penalties/streaks, then generates the next batch. */
function resetPeriodQuests(
  quests: Quest[],
  character: Character,
  streaks: Streaks,
  period: RecurringPeriod,
  penaltyEnabled: boolean,
): { quests: Quest[]; character: Character; streaks: Streaks; logs: LogEntry[]; toasts: Toast[] } {
  const periodQuests = quests.filter((q) => q.period === period);
  const logs: LogEntry[] = [];
  const toasts: Toast[] = [];
  let nextCharacter = character;
  let nextStreak = streaks[period];

  if (periodQuests.length > 0) {
    const allDone = periodQuests.every((q) => q.completedInPeriod);
    if (allDone) {
      nextStreak += 1;
      logs.push(mkLog(`Todas as missões ${PERIOD_LABELS[period].toLowerCase()}s concluídas! Sequência: ${nextStreak}.`, 'system'));
    } else {
      nextStreak = 0;
      for (const q of periodQuests) {
        if (!q.completedInPeriod && penaltyEnabled) {
          const penalty = questPenalty(q.difficulty, q.period);
          const result = applyXp(nextCharacter, -penalty);
          nextCharacter = result.character;
          logs.push(mkLog(`Penalidade: "${q.title}" não foi concluída. -${penalty} XP`, 'penalty'));
          toasts.push({ id: crypto.randomUUID(), text: `Penalidade: -${penalty} XP (${q.title})`, kind: 'penalty' });
        }
      }
    }
  }

  const otherQuests = quests.filter((q) => q.period !== period);
  const freshQuests = generatePeriodQuests(period);
  logs.push(mkLog(`Novas missões ${PERIOD_LABELS[period].toLowerCase()}s disponíveis.`, 'system'));

  return {
    quests: [...otherQuests, ...freshQuests],
    character: nextCharacter,
    streaks: { ...streaks, [period]: nextStreak },
    logs,
    toasts,
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      character: defaultCharacter(),
      quests: seedQuests(),
      log: [mkLog('Sistema iniciado. Bem-vindo, Caçador.', 'system')],
      lastDailyReset: todayStr(),
      lastWeeklyReset: currentWeekAnchor(),
      lastMonthlyReset: currentMonthAnchor(),
      streaks: { daily: 0, weekly: 0, monthly: 0 },
      penaltyEnabled: true,
      levelUpFlash: null,
      toasts: [],

      setName: (name) =>
        set((state) => ({ character: { ...state.character, name: name.trim() || state.character.name } })),

      addQuest: ({ title, description, difficulty, stat }) =>
        set((state) => {
          const quest: Quest = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description?.trim() || undefined,
            difficulty,
            stat,
            period: 'custom',
            createdAt: new Date().toISOString(),
            completed: false,
            completedInPeriod: false,
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

          const isDone = quest.period === 'custom' ? quest.completed : quest.completedInPeriod;
          const xpAmount = questXp(quest.difficulty, quest.period);
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
            return q.period === 'custom' ? { ...q, completed: !isDone } : { ...q, completedInPeriod: !isDone };
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

      checkResets: () =>
        set((state) => {
          const today = todayStr();
          const weekAnchor = currentWeekAnchor();
          const monthAnchor = currentMonthAnchor();

          let quests = state.quests;
          let character = state.character;
          let streaks = state.streaks;
          let lastDailyReset = state.lastDailyReset;
          let lastWeeklyReset = state.lastWeeklyReset;
          let lastMonthlyReset = state.lastMonthlyReset;
          const logs: LogEntry[] = [];
          const toasts: Toast[] = [...state.toasts];

          const cycles: [RecurringPeriod, string, string][] = [
            ['daily', lastDailyReset, today],
            ['weekly', lastWeeklyReset, weekAnchor],
            ['monthly', lastMonthlyReset, monthAnchor],
          ];

          for (const [period, last, anchor] of cycles) {
            if (last === anchor) continue;
            const result = resetPeriodQuests(quests, character, streaks, period, state.penaltyEnabled);
            quests = result.quests;
            character = result.character;
            streaks = result.streaks;
            logs.push(...result.logs);
            toasts.push(...result.toasts);
            if (period === 'daily') lastDailyReset = today;
            if (period === 'weekly') lastWeeklyReset = weekAnchor;
            if (period === 'monthly') lastMonthlyReset = monthAnchor;
          }

          if (logs.length === 0) return state;

          return {
            quests,
            character,
            streaks,
            lastDailyReset,
            lastWeeklyReset,
            lastMonthlyReset,
            log: [...logs, ...state.log].slice(0, 50),
            toasts,
          };
        }),

      togglePenalty: () => set((state) => ({ penaltyEnabled: !state.penaltyEnabled })),

      dismissLevelUp: () => set({ levelUpFlash: null }),

      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      resetGame: () =>
        set({
          character: defaultCharacter(),
          quests: seedQuests(),
          log: [mkLog('Sistema reiniciado.', 'system')],
          lastDailyReset: todayStr(),
          lastWeeklyReset: currentWeekAnchor(),
          lastMonthlyReset: currentMonthAnchor(),
          streaks: { daily: 0, weekly: 0, monthly: 0 },
          penaltyEnabled: true,
          levelUpFlash: null,
          toasts: [],
        }),
    }),
    {
      name: 'solo-leveling-save-v1',
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2 && state) {
          const oldQuests = Array.isArray(state.quests) ? (state.quests as Record<string, unknown>[]) : [];
          const migratedQuests: Quest[] = oldQuests.map((q) => ({
            id: q.id as string,
            title: q.title as string,
            description: q.description as string | undefined,
            difficulty: q.difficulty as Rank,
            stat: q.stat as StatKey | undefined,
            period: (q.isDaily ? 'daily' : 'custom') as Period,
            createdAt: q.createdAt as string,
            completed: (q.completed as boolean) ?? false,
            completedInPeriod: (q.completedToday as boolean) ?? false,
          }));
          return {
            ...state,
            quests: [...migratedQuests, ...generatePeriodQuests('weekly'), ...generatePeriodQuests('monthly')],
            lastDailyReset: (state.lastResetDate as string) ?? todayStr(),
            lastWeeklyReset: currentWeekAnchor(),
            lastMonthlyReset: currentMonthAnchor(),
            streaks: { daily: 0, weekly: 0, monthly: 0 },
          };
        }
        return state;
      },
    },
  ),
);
