import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { QuestCard } from './QuestCard';
import { AddQuestModal } from './AddQuestModal';

export function QuestBoard() {
  const quests = useGameStore((s) => s.quests);
  const [showModal, setShowModal] = useState(false);

  const dailies = quests.filter((q) => q.isDaily);
  const oneOff = quests.filter((q) => !q.isDaily);
  const pendingOneOff = oneOff.filter((q) => !q.completed);
  const doneOneOff = oneOff.filter((q) => q.completed);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-white glow-text">Missões</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded bg-blue-600/20 border border-blue-400/40 px-3 py-1.5 text-sm text-blue-200 hover:bg-blue-600/30 transition"
        >
          <Plus size={14} /> Nova missão
        </button>
      </div>

      <section>
        <h3 className="text-xs tracking-[0.25em] text-blue-300/60 mb-3">MISSÕES DIÁRIAS</h3>
        {dailies.length === 0 ? (
          <p className="text-sm text-blue-200/40">Nenhuma missão diária cadastrada.</p>
        ) : (
          <div className="space-y-2">
            {dailies.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-xs tracking-[0.25em] text-blue-300/60 mb-3">MISSÕES ({pendingOneOff.length})</h3>
        {pendingOneOff.length === 0 ? (
          <p className="text-sm text-blue-200/40">Sem missões pendentes. Crie uma nova.</p>
        ) : (
          <div className="space-y-2">
            {pendingOneOff.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
        )}
        {doneOneOff.length > 0 && (
          <div className="space-y-2 mt-3 pt-3 border-t border-blue-500/10">
            {doneOneOff.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
        )}
      </section>

      {showModal && <AddQuestModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
