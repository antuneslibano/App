import { useState } from 'react';
import { Flame, Plus } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { QuestCard } from './QuestCard';
import { AddQuestModal } from './AddQuestModal';
import { nextResetLabel } from '../lib/date';
import type { Period } from '../types';

function PeriodSection({ period, title }: { period: Exclude<Period, 'custom'>; title: string }) {
  const allQuests = useGameStore((s) => s.quests);
  const streak = useGameStore((s) => s.streaks[period]);
  const quests = allQuests.filter((q) => q.period === period);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs tracking-[0.25em] text-blue-300/60">{title}</h3>
        <div className="flex items-center gap-3 text-[11px] text-blue-300/40">
          {streak > 0 && (
            <span className="flex items-center gap-1 text-amber-300/80">
              <Flame size={12} /> {streak}
            </span>
          )}
          <span>{nextResetLabel(period)}</span>
        </div>
      </div>
      {quests.length === 0 ? (
        <p className="text-sm text-blue-200/40">Gerando missões...</p>
      ) : (
        <div className="space-y-2">
          {quests.map((q) => (
            <QuestCard key={q.id} quest={q} />
          ))}
        </div>
      )}
    </section>
  );
}

export function QuestBoard() {
  const quests = useGameStore((s) => s.quests);
  const [showModal, setShowModal] = useState(false);

  const custom = quests.filter((q) => q.period === 'custom');
  const pendingCustom = custom.filter((q) => !q.completed);
  const doneCustom = custom.filter((q) => q.completed);

  return (
    <div className="space-y-8">
      <PeriodSection period="daily" title="MISSÕES DIÁRIAS" />
      <PeriodSection period="weekly" title="MISSÕES SEMANAIS" />
      <PeriodSection period="monthly" title="MISSÕES MENSAIS" />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs tracking-[0.25em] text-blue-300/60">MISSÕES ({pendingCustom.length})</h3>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded bg-blue-600/20 border border-blue-400/40 px-3 py-1.5 text-sm text-blue-200 hover:bg-blue-600/30 transition"
          >
            <Plus size={14} /> Nova missão
          </button>
        </div>
        {pendingCustom.length === 0 ? (
          <p className="text-sm text-blue-200/40">Sem missões pendentes. Crie uma nova.</p>
        ) : (
          <div className="space-y-2">
            {pendingCustom.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
        )}
        {doneCustom.length > 0 && (
          <div className="space-y-2 mt-3 pt-3 border-t border-blue-500/10">
            {doneCustom.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
        )}
      </section>

      {showModal && <AddQuestModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
