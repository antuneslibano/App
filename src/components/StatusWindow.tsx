import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { RANK_COLORS, rankForLevel, xpForLevel } from '../lib/leveling';
import { STAT_LABELS, type StatKey } from '../types';
import { StatRadar } from './StatRadar';

const STAT_ORDER: StatKey[] = ['str', 'vit', 'int', 'per', 'agi'];

export function StatusWindow() {
  const character = useGameStore((s) => s.character);
  const allocateStat = useGameStore((s) => s.allocateStat);
  const setName = useGameStore((s) => s.setName);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(character.name);

  const rank = rankForLevel(character.level);
  const rankColor = RANK_COLORS[rank];
  const xpNeeded = xpForLevel(character.level);
  const progress = Math.min(100, Math.round((character.xp / xpNeeded) * 100));

  return (
    <div className="panel panel-pulse rounded-lg p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs tracking-[0.3em] text-blue-300/70 mb-1">STATUS DO JOGADOR</p>
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                setName(nameDraft);
                setEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setName(nameDraft);
                  setEditingName(false);
                }
              }}
              className="font-display text-2xl bg-transparent border-b border-blue-400/50 outline-none text-white"
            />
          ) : (
            <h1
              className="font-display text-2xl text-white glow-text cursor-pointer"
              onClick={() => setEditingName(true)}
              title="Clique para editar"
            >
              {character.name}
            </h1>
          )}
        </div>
        <div
          className="flex items-center gap-2 rounded-md px-3 py-1.5 border"
          style={{ borderColor: rankColor, color: rankColor, boxShadow: `0 0 16px ${rankColor}33` }}
        >
          <span className="font-display text-xl">{rank}</span>
          <span className="text-xs uppercase tracking-wide text-blue-200/70">Rank</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <div className="flex items-end justify-between mb-1">
            <span className="font-display text-lg text-white">Nível {character.level}</span>
            <span className="text-sm text-blue-200/70">
              {character.xp} / {xpNeeded} XP
            </span>
          </div>
          <div className="h-3 rounded-full bg-[#0a1226] border border-blue-500/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
              style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(96,165,250,0.7)' }}
            />
          </div>

          <div className="mt-6 space-y-3">
            {STAT_ORDER.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-28 text-sm text-blue-100/90">{STAT_LABELS[key]}</span>
                <div className="flex-1 h-2 rounded-full bg-[#0a1226] border border-blue-500/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-blue-400"
                    style={{ width: `${Math.min(100, character.stats[key])}%` }}
                  />
                </div>
                <span className="w-8 text-right font-display text-sm text-white">{character.stats[key]}</span>
                {character.statPoints > 0 && (
                  <button
                    onClick={() => allocateStat(key)}
                    className="w-6 h-6 flex items-center justify-center rounded border border-blue-400/40 text-blue-300 hover:bg-blue-500/20 transition"
                    title={`Adicionar ponto em ${STAT_LABELS[key]}`}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {character.statPoints > 0 && (
            <p className="mt-3 text-xs text-amber-300/90 glow-text">
              Você tem {character.statPoints} ponto(s) de atributo para distribuir.
            </p>
          )}
        </div>

        <StatRadar stats={character.stats} />
      </div>
    </div>
  );
}
