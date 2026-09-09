import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { FidoSession, RefinementSession } from '../types';
import { getVerifiedSession } from '../utils/portfolioAuth';
import { refreshFidoSession } from '../utils/fidoAuth';
import { SignInControls } from './SignInControls';
interface FidoModalProps { isOpen: boolean; onClose: () => void; session: FidoSession | null; onSessionChange: (s: FidoSession | null) => void }
export const FidoModal: React.FC<FidoModalProps> = ({ isOpen, onClose, onSessionChange }) => {
  const [verified, setVerified] = useState<RefinementSession | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    if (!isOpen) return;
    let active = true; setLoading(true); setError('');
    getVerifiedSession().then(s => { if (active) setVerified(s); }).catch(() => { if (active) { setVerified(null); setError('The server could not verify a session. Try signing in again.'); } }).finally(() => { if (active) setLoading(false); });
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', key);
    return () => { active = false; window.removeEventListener('keydown', key); };
  }, [isOpen]);
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" role="dialog" aria-modal="true" aria-labelledby="fido-title">
    <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto border-2 border-[var(--border-strong)] bg-[var(--bg-card)] font-mono">
      <div className="rainbow-border-top h-[3px]" />
      <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
        <h2 id="fido-title" className="text-sm font-bold text-[var(--text-primary)]">PASSKEYS &amp; VERIFIED SIGN-IN</h2>
        <button onClick={onClose} aria-label="Close sign-in" className="cursor-pointer text-[var(--text-primary)]"><X size={18} /></button>
      </div>
      <div className="p-5 space-y-4">
        {loading ? <p className="text-xs text-[var(--text-secondary)]">Checking session…</p> : <SignInControls session={verified} onChange={s => { setVerified(s); setError(''); void refreshFidoSession().then(onSessionChange); }} />}
        {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  </div>;
};
