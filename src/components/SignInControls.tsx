import React, { useState } from 'react';
import type { RefinementSession } from '../types';
import { signInWithGoogle, endVerifiedSession } from '../utils/portfolioAuth';
import { authenticateVerifiedPasskey, registerVerifiedPasskey } from '../utils/fidoAuth';

export const SignInControls: React.FC<{ session: RefinementSession | null; onChange: (session: RefinementSession | null) => void }> = ({ session, onChange }) => {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [name, setName] = useState('');
  const run = async (operation: () => Promise<RefinementSession | null>) => {
    setBusy(true); setError('');
    try { onChange(await operation()); } catch (e) { setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.'); } finally { setBusy(false); }
  };
  const button = 'retro-btn px-3 py-2 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-wait';
  return <div className="space-y-4">
    {session ? <>
      <div className="p-3 border border-[var(--rm-status)] bg-[var(--bg-primary)] space-y-1 text-xs">
        <p className="font-bold text-[var(--text-primary)]">{session.displayName} · {session.role === 'owner' ? 'SITE OWNER' : 'VISITOR'}</p>
        <p className="text-[var(--rm-status)]">Verified by {session.authMethod === 'passkey' ? 'passkey' : 'Google sign-in'}</p>
        <p className="text-[var(--text-secondary)]">Authenticated {new Date(session.authenticatedAt).toLocaleString()}</p>
        <p className="text-[10px] break-all text-[var(--text-muted)]">Account: {session.userId}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={button} disabled={busy} onClick={() => run(() => authenticateVerifiedPasskey())}>USE A PASSKEY</button>
        <button className={button} disabled={busy} onClick={() => run(() => registerVerifiedPasskey(session.displayName))}>ADD PASSKEY TO THIS ACCOUNT</button>
        <button className={button} disabled={busy} onClick={() => run(async () => { await endVerifiedSession(); return null; })}>SIGN OUT</button>
      </div>
    </> : <>
      <p className="text-sm text-[var(--text-primary)] font-bold">SIGN IN TO THE SITE</p>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Use a passkey or Google account. The verified session can receive relay replies and submit attributed refinements; it does not publish site changes.</p>
      <div className="flex flex-wrap gap-2">
        <button className={button} disabled={busy} onClick={() => run(() => authenticateVerifiedPasskey())}>SIGN IN WITH PASSKEY</button>
        <button className={button} disabled={busy} onClick={() => run(() => signInWithGoogle())}>SIGN IN WITH GOOGLE</button>
      </div>
      <details className="text-xs border border-[var(--border-color)] p-3 space-y-3">
        <summary className="cursor-pointer text-[var(--text-primary)]">New visitor? Create an account with a passkey</summary>
        <p className="text-[var(--text-secondary)] mt-3">Your display name is a label; the passkey identifies your visitor account. To attach a passkey to a Google account, sign in with Google first.</p>
        <label className="block text-[var(--text-primary)]">Display name
          <input className="mt-1 w-full p-2 border border-[var(--border-strong)] bg-[var(--bg-primary)]" value={name} onChange={e => setName(e.target.value)} maxLength={80} autoComplete="nickname" />
        </label>
        <button className={button} disabled={busy || !name.trim()} onClick={() => run(() => registerVerifiedPasskey(name.trim()))}>CREATE VISITOR PASSKEY</button>
      </details>
      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Passkeys created by the earlier version may need new enrollment because that version did not save verification keys on the server. Sign in with Google, then add a passkey. Existing saved passkeys are not deleted.</p>
    </>}
    {busy && <p role="status" className="text-xs text-[var(--text-secondary)]">Waiting for sign-in verification…</p>}
    {error && <p role="alert" className="text-xs text-red-400 whitespace-pre-wrap">{error}</p>}
  </div>;
};
