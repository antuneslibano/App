import { Check, Trash2 } from 'lucide-react';
import type { Quest } from '../types';
import { STAT_LABELS } from '../types';
import { PERIOD_LABELS, RANK_COLORS, questXp } from '../lib/leveling';
import { useGameStore } from '../store/useGameStore';

export function QuestCard({ quest }: { quest: Quest }) {
  const toggleQuest = useGameStore((s) => s.toggleQuest);
  const deleteQuest = useGameStore((s) => s.deleteQuest);
  const isDone = quest.period === 'custom' ? quest.completed : quest.completedInPeriod;
  const color = RANK_COLORS[quest.difficulty];
  const xp = questXp(quest.difficulty, quest.period);

  return (
    <div
      className={`panel rounded-lg p-4 flex items-start gap-3 transition-opacity ${isDone ? 'opacity-60' : ''}`}
    >
      <button
        onClick={() => toggleQuest(quest.id)}
        className="mt-0.5 w-6 h-6 shrink-0 rounded border flex items-center justify-center transition"
        style={{
          borderColor: isDone ? '#4ade80' : 'rgba(96,165,250,0.4)',
          background: isDone ? 'rgba(74,222,128,0.15)' : 'transparent',
        }}
        title={isDone ? 'Desfazer' : 'Concluir missão'}
      >
        {isDone && <Check size={14} color="#4ade80" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-display text-xs px-1.5 py-0.5 rounded border"
            style={{ borderColor: color, color }}
          >
            {quest.difficulty}
          </span>
          <h3 className={`font-medium text-white ${isDone ? 'line-through decoration-blue-400/60' : ''}`}>
            {quest.title}
          </h3>
          {quest.period !== 'custom' && (
            <span className="text-[10px] uppercase tracking-wide text-blue-300/70 border border-blue-400/20 rounded px-1.5 py-0.5">
              {PERIOD_LABELS[quest.period]}
            </span>
          )}
          {quest.stat && (
            <span className="text-[10px] uppercase tracking-wide text-violet-300/70 border border-violet-400/20 rounded px-1.5 py-0.5">
              {STAT_LABELS[quest.stat]}
            </span>
          )}
        </div>
        {quest.description && <p className="text-sm text-blue-100/60 mt-1">{quest.description}</p>}
        <div className="flex items-center gap-3 mt-2 text-xs text-blue-200/60">
          <span>+{xp} XP</span>
        </div>
      </div>

      {quest.period === 'custom' && (
        <button
          onClick={() => deleteQuest(quest.id)}
          className="text-blue-300/30 hover:text-red-400 transition p-1"
          title="Remover missão"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
