import { useEffect, useState } from 'react';
import { Bell, BellOff, Check, Copy } from 'lucide-react';
import { getExistingSubscription, isPushSupported, subscribeToPush, unsubscribeFromPush } from '../lib/push';

export function NotificationSettings() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const supported = isPushSupported();

  useEffect(() => {
    if (!supported) return;
    getExistingSubscription().then(setSubscription);
  }, [supported]);

  async function handleEnable() {
    setLoading(true);
    setError(null);
    try {
      const sub = await subscribeToPush();
      setSubscription(sub);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível ativar as notificações.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    try {
      await unsubscribeFromPush();
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!subscription) return;
    await navigator.clipboard.writeText(JSON.stringify(subscription));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!supported) {
    return (
      <div className="panel rounded-lg p-5">
        <h2 className="font-display text-lg text-white glow-text mb-2">Notificações</h2>
        <p className="text-sm text-blue-200/60">
          Este navegador não suporta notificações push. No iPhone, instale o app na Tela de Início primeiro (iOS 16.4+).
        </p>
      </div>
    );
  }

  return (
    <div className="panel rounded-lg p-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-lg text-white glow-text">Notificações</h2>
        {subscription ? (
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <Bell size={14} /> Ativadas
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-blue-300/40">
            <BellOff size={14} /> Desativadas
          </span>
        )}
      </div>

      {!subscription && (
        <>
          <p className="text-sm text-blue-200/60 mb-3">
            Receba um lembrete do Sistema pra não esquecer suas missões, mesmo com o app fechado.
          </p>
          <button
            onClick={handleEnable}
            disabled={loading}
            className="w-full rounded bg-gradient-to-r from-blue-600 to-violet-600 py-2 font-display tracking-wide text-white hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? 'Ativando...' : 'Ativar notificações'}
          </button>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </>
      )}

      {subscription && (
        <>
          <p className="text-sm text-blue-200/60 mb-3">
            Falta um passo único: copie o código abaixo e cole em{' '}
            <span className="text-blue-200/90">
              github.com/antuneslibano/App → Settings → Secrets and variables → Actions
            </span>{' '}
            como um novo secret chamado <span className="text-blue-200/90">PUSH_SUBSCRIPTION</span>.
          </p>
          <div className="flex items-center gap-2 mb-3">
            <textarea
              readOnly
              value={JSON.stringify(subscription)}
              rows={3}
              className="flex-1 text-[10px] rounded bg-[#0a1226] border border-blue-500/20 px-2 py-1.5 text-blue-100/70 resize-none"
              onFocus={(e) => e.target.select()}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 rounded bg-blue-600/20 border border-blue-400/40 px-3 py-1.5 text-sm text-blue-200 hover:bg-blue-600/30 transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar código'}
            </button>
            <button
              onClick={handleDisable}
              disabled={loading}
              className="rounded border border-red-500/30 px-3 py-1.5 text-sm text-red-300/80 hover:bg-red-500/10 transition"
            >
              Desativar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
