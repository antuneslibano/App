import { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { StatusWindow } from './components/StatusWindow';
import { QuestBoard } from './components/QuestBoard';
import { LogFeed } from './components/LogFeed';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { ToastStack } from './components/ToastStack';

type Tab = 'status' | 'missoes' | 'historico';

const TABS: { id: Tab; label: string }[] = [
  { id: 'status', label: 'Status' },
  { id: 'missoes', label: 'Missões' },
  { id: 'historico', label: 'Histórico' },
];

function App() {
  const checkDailyReset = useGameStore((s) => s.checkDailyReset);
  const [tab, setTab] = useState<Tab>('status');

  useEffect(() => {
    checkDailyReset();
    const onFocus = () => checkDailyReset();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(checkDailyReset, 60_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [checkDailyReset]);

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <p className="text-xs tracking-[0.4em] text-blue-400/60 mb-1">O SISTEMA</p>
          <h1 className="font-display text-3xl text-white glow-text">ARISE</h1>
        </header>

        <nav className="flex justify-center gap-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-display tracking-wide rounded-t border-b-2 transition ${
                tab === t.id
                  ? 'text-white border-blue-400'
                  : 'text-blue-300/40 border-transparent hover:text-blue-200/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main>
          {tab === 'status' && <StatusWindow />}
          {tab === 'missoes' && <QuestBoard />}
          {tab === 'historico' && <LogFeed />}
        </main>
      </div>

      <LevelUpOverlay />
      <ToastStack />
    </div>
  );
}

export default App;
