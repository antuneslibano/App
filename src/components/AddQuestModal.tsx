import { useState } from 'react';
import { X } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { STAT_LABELS, type Rank, type StatKey } from '../types';

const RANKS: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
const STATS: StatKey[] = ['str', 'vit', 'int', 'per', 'agi'];

export function AddQuestModal({ onClose }: { onClose: () => void }) {
  const addQuest = useGameStore((s) => s.addQuest);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Rank>('E');
  const [stat, setStat] = useState<StatKey | ''>('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addQuest({ title, description, difficulty, stat: stat || undefined });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="panel rounded-lg p-6 w-full max-w-md relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-blue-300/60 hover:text-white">
          <X size={18} />
        </button>
        <h2 className="font-display text-xl text-white mb-4 glow-text">Nova Missão</h2>

        <label className="block text-xs text-blue-200/70 mb-1">Título</label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Estudar 1 hora"
          className="w-full mb-3 rounded bg-[#0a1226] border border-blue-500/20 px-3 py-2 text-white outline-none focus:border-blue-400"
        />

        <label className="block text-xs text-blue-200/70 mb-1">Descrição (opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full mb-3 rounded bg-[#0a1226] border border-blue-500/20 px-3 py-2 text-white outline-none focus:border-blue-400 resize-none"
        />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-blue-200/70 mb-1">Dificuldade</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Rank)}
              className="w-full rounded bg-[#0a1226] border border-blue-500/20 px-3 py-2 text-white outline-none focus:border-blue-400"
            >
              {RANKS.map((r) => (
                <option key={r} value={r}>
                  Rank {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-blue-200/70 mb-1">Atributo</label>
            <select
              value={stat}
              onChange={(e) => setStat(e.target.value as StatKey | '')}
              className="w-full rounded bg-[#0a1226] border border-blue-500/20 px-3 py-2 text-white outline-none focus:border-blue-400"
            >
              <option value="">Nenhum</option>
              {STATS.map((s) => (
                <option key={s} value={s}>
                  {STAT_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded bg-gradient-to-r from-blue-600 to-violet-600 py-2 font-display tracking-wide text-white hover:brightness-110 transition"
        >
          Registrar Missão
        </button>
      </form>
    </div>
  );
}
