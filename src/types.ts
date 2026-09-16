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

export interface Quest {
  id: string;
  title: string;
  description?: string;
  difficulty: Rank;
  stat?: StatKey;
  isDaily: boolean;
  createdAt: string;
  completed: boolean;
  completedToday: boolean;
  lastCompletedDate?: string;
  streak: number;
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
