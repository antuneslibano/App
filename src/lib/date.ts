export function todayStr(): string {
  return new Date().toLocaleDateString('en-CA');
}

export function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA');
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Date string (en-CA) of the most recent Sunday (today, if today is Sunday). */
export function currentWeekAnchor(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toLocaleDateString('en-CA');
}

/** "YYYY-MM" for the current month. */
export function currentMonthAnchor(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const WEEKDAYS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export function nextResetLabel(period: 'daily' | 'weekly' | 'monthly'): string {
  if (period === 'daily') return 'Reinicia à meia-noite';
  if (period === 'weekly') return 'Reinicia domingo';
  const d = new Date();
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return `Reinicia dia 1 (${WEEKDAYS_PT[nextMonth.getDay()]})`;
}
