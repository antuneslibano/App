import { useEffect, useState } from 'react';
import { History, ListChecks, UserRound } from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import { StatusWindow } from './components/StatusWindow';
import { QuestBoard } from './components/QuestBoard';
import { LogFeed } from './components/LogFeed';
import { NotificationSettings } from './components/NotificationSettings';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { ToastStack } from './components/ToastStack';
import { InstallPrompt } from './components/InstallPrompt';

type Tab = 'status' | 'missoes' | 'historico';

const TABS: { id: Tab; label: string; icon: typeof UserRound }[] = [
  { id: 'status', label: 'Status', icon: UserRound },
  { id: 'missoes', label: 'Missões', icon: ListChecks },
  { id: 'historico', label: 'Histórico', icon: History },
];

function App() {
  const checkResets = useGameStore((s) => s.checkResets);
  const [tab, setTab] = useState<Tab>('status');

  useEffect(() => {
    checkResets();
    const onFocus = () => checkResets();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(checkResets, 60_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [checkResets]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="text-center pt-[calc(env(safe-area-inset-top,0px)+20px)] pb-4 px-4">
        <p className="text-[10px] tracking-[0.4em] text-blue-400/60 mb-1">O SISTEMA</p>
        <h1 className="font-display text-2xl text-white glow-text">ARISE</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6 max-w-md w-full mx-auto">
        {tab === 'status' && <StatusWindow />}
        {tab === 'missoes' && <QuestBoard />}
        {tab === 'historico' && (
          <div className="space-y-4">
            <NotificationSettings />
            <LogFeed />
          </div>
        )}
      </main>

      <nav
        className="sticky bottom-0 border-t border-blue-500/15 bg-[#050810]/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-md mx-auto flex">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 transition"
              >
                <Icon size={20} className={active ? 'text-blue-300' : 'text-blue-300/35'} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-[11px] font-display tracking-wide ${active ? 'text-blue-200' : 'text-blue-300/35'}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <LevelUpOverlay />
      <ToastStack />
      <InstallPrompt />
    </div>
  );
}

export default App;
