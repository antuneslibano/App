import type { Quest, Rank, StatKey } from '../types';

interface Template {
  title: string;
  difficulty: Rank;
  stat?: StatKey;
  description?: string;
}

const DAILY_POOL: Template[] = [
  { title: '50 flexões', difficulty: 'E', stat: 'str' },
  { title: '100 flexões', difficulty: 'D', stat: 'str' },
  { title: '30 agachamentos', difficulty: 'E', stat: 'agi' },
  { title: '100 agachamentos', difficulty: 'D', stat: 'agi' },
  { title: '100 abdominais', difficulty: 'D', stat: 'vit' },
  { title: 'Beber 2 litros de água', difficulty: 'E', stat: 'vit' },
  { title: 'Caminhar 20 minutos', difficulty: 'D', stat: 'vit' },
  { title: 'Ler 20 páginas', difficulty: 'E', stat: 'int' },
  { title: 'Estudar 45 minutos', difficulty: 'D', stat: 'int' },
  { title: 'Meditar 10 minutos', difficulty: 'E', stat: 'per' },
  { title: 'Arrumar a cama', difficulty: 'E', stat: 'per' },
  { title: 'Organizar o espaço de trabalho', difficulty: 'E', stat: 'per' },
  { title: 'Ficar 2 horas sem redes sociais', difficulty: 'D', stat: 'per' },
  { title: 'Dormir 8 horas', difficulty: 'D', stat: 'vit' },
];

const WEEKLY_POOL: Template[] = [
  { title: 'Treinar 4 vezes na semana', difficulty: 'B', stat: 'str' },
  { title: 'Correr 10 km ao longo da semana', difficulty: 'B', stat: 'agi' },
  { title: 'Ler 100 páginas de um livro', difficulty: 'C', stat: 'int' },
  { title: 'Estudar algo novo por 3 horas', difficulty: 'C', stat: 'int' },
  { title: 'Cozinhar 5 refeições saudáveis', difficulty: 'C', stat: 'vit' },
  { title: 'Passar a semana sem álcool', difficulty: 'B', stat: 'vit' },
  { title: 'Organizar as finanças da semana', difficulty: 'C', stat: 'per' },
  { title: 'Conversar com 3 pessoas importantes pra você', difficulty: 'C', stat: 'per' },
  { title: 'Limpar a casa por completo', difficulty: 'C', stat: 'per' },
];

const MONTHLY_POOL: Template[] = [
  { title: 'Treinar 16 vezes no mês', difficulty: 'A', stat: 'str' },
  { title: 'Correr 50 km no mês', difficulty: 'S', stat: 'agi' },
  { title: 'Ler 2 livros completos', difficulty: 'A', stat: 'int' },
  { title: 'Concluir um curso ou treinamento completo', difficulty: 'S', stat: 'int' },
  { title: 'Manter um hábito por 30 dias seguidos', difficulty: 'A', stat: 'vit' },
  { title: 'Economizar uma meta definida do seu salário', difficulty: 'A', stat: 'per' },
  { title: 'Concluir um projeto pessoal', difficulty: 'S', stat: 'per' },
];

const POOLS: Record<'daily' | 'weekly' | 'monthly', Template[]> = {
  daily: DAILY_POOL,
  weekly: WEEKLY_POOL,
  monthly: MONTHLY_POOL,
};

export const PERIOD_QUEST_COUNT: Record<'daily' | 'weekly' | 'monthly', number> = {
  daily: 4,
  weekly: 3,
  monthly: 2,
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generatePeriodQuests(period: 'daily' | 'weekly' | 'monthly'): Quest[] {
  const count = PERIOD_QUEST_COUNT[period];
  const picks = shuffle(POOLS[period]).slice(0, count);
  const now = new Date().toISOString();
  return picks.map((tpl) => ({
    id: crypto.randomUUID(),
    title: tpl.title,
    description: tpl.description,
    difficulty: tpl.difficulty,
    stat: tpl.stat,
    period,
    createdAt: now,
    completed: false,
    completedInPeriod: false,
  }));
}
