import type { Period, Rank } from '../types';

export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.35));
}

export function rankForLevel(level: number): Rank {
  if (level < 10) return 'E';
  if (level < 20) return 'D';
  if (level < 30) return 'C';
  if (level < 40) return 'B';
  if (level < 50) return 'A';
  return 'S';
}

export const RANK_COLORS: Record<Rank, string> = {
  E: '#9ca3af',
  D: '#4ade80',
  C: '#38bdf8',
  B: '#818cf8',
  A: '#c084fc',
  S: '#fbbf24',
};

export const DIFFICULTY_XP: Record<Rank, number> = {
  E: 15,
  D: 30,
  C: 55,
  B: 90,
  A: 140,
  S: 220,
};

export const DIFFICULTY_PENALTY: Record<Rank, number> = {
  E: 5,
  D: 10,
  C: 18,
  B: 28,
  A: 40,
  S: 60,
};

export const PERIOD_MULTIPLIER: Record<Period, number> = {
  daily: 1,
  weekly: 1.6,
  monthly: 2.4,
  custom: 1,
};

export function questXp(difficulty: Rank, period: Period): number {
  return Math.round(DIFFICULTY_XP[difficulty] * PERIOD_MULTIPLIER[period]);
}

export function questPenalty(difficulty: Rank, period: Period): number {
  return Math.round(DIFFICULTY_PENALTY[difficulty] * PERIOD_MULTIPLIER[period]);
}

export const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
  custom: 'Missão',
};
