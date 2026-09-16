import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('sl-install-dismissed') === '1');
  const [standalone, setStandalone] = useState(isStandalone());

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    const onInstalled = () => setStandalone(true);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (standalone || dismissed) return null;
  if (!deferredPrompt && !isIOS()) return null;

  function dismiss() {
    localStorage.setItem('sl-install-dismissed', '1');
    setDismissed(true);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  }

  return (
    <div className="fixed left-4 right-4 z-[80] panel rounded-lg p-4" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)' }}>
      <button onClick={dismiss} className="absolute top-3 right-3 text-blue-300/50 hover:text-white">
        <X size={16} />
      </button>

      {deferredPrompt ? (
        <div className="flex items-center gap-3 pr-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
            <Download size={18} className="text-blue-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-medium">Instalar o ARISE</p>
            <p className="text-xs text-blue-200/60">Use como um app, direto da tela inicial.</p>
          </div>
          <button
            onClick={handleInstall}
            className="rounded bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1.5 text-xs font-display text-white shrink-0"
          >
            Instalar
          </button>
        </div>
      ) : (
        <div className="pr-6">
          <p className="text-sm text-white font-medium mb-1">Instalar o ARISE no seu iPhone</p>
          <p className="text-xs text-blue-200/70 leading-relaxed">
            Toque em <Share size={12} className="inline mx-0.5 -mt-0.5" /> Compartilhar na barra do Safari e depois em
            "Adicionar à Tela de Início".
          </p>
        </div>
      )}
    </div>
  );
}
