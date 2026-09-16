export type StatKey = 'str' | 'vit' | 'int' | 'per' | 'agi';

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface Stats {
  str: number;
  vit: number;
  int: number;
  per: number;
  agi: number;
}

export const STAT_LABELS: Record<StatKey, string> = {
  str: 'Força',
  vit: 'Vitalidade',
  int: 'Inteligência',
  per: 'Percepção',
  agi: 'Agilidade',
};

export type Period = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Quest {
  id: string;
  title: string;
  description?: string;
  difficulty: Rank;
  stat?: StatKey;
  period: Period;
  createdAt: string;
  /** For 'custom' quests: whether it's done. */
  completed: boolean;
  /** For 'daily' | 'weekly' | 'monthly' quests: whether it's done in the current cycle. */
  completedInPeriod: boolean;
}

export interface Streaks {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface Character {
  name: string;
  level: number;
  xp: number;
  statPoints: number;
  stats: Stats;
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'quest' | 'levelup' | 'penalty' | 'system';
  timestamp: string;
}
