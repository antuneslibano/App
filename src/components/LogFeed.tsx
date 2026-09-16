import { useGameStore } from '../store/useGameStore';
import { formatTime } from '../lib/date';

const TYPE_COLOR: Record<string, string> = {
  quest: 'text-blue-300',
  levelup: 'text-amber-300',
  penalty: 'text-red-300',
  system: 'text-blue-200/50',
};

export function LogFeed() {
  const log = useGameStore((s) => s.log);
  const penaltyEnabled = useGameStore((s) => s.penaltyEnabled);
  const togglePenalty = useGameStore((s) => s.togglePenalty);

  return (
    <div className="panel rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-white glow-text">Histórico</h2>
        <label className="flex items-center gap-2 text-xs text-blue-200/70">
          <input type="checkbox" checked={penaltyEnabled} onChange={togglePenalty} />
          Zona de Penalidade
        </label>
      </div>
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {log.map((entry) => (
          <div key={entry.id} className="text-sm flex gap-3">
            <span className="text-blue-300/30 shrink-0 tabular-nums">{formatTime(entry.timestamp)}</span>
            <span className={TYPE_COLOR[entry.type]}>{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
