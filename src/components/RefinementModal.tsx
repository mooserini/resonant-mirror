import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { RefinementItem, RefinementSession } from '../types';
import { getVerifiedSession, PortfolioRequestError } from '../utils/portfolioAuth';
import { getStagedRefinements, addRefinementItem, getLegacyDrafts, buildSingleIterationPrompt, buildBatchIterationPrompt } from '../utils/refinementService';
import { SignInControls } from './SignInControls';
interface RefinementModalProps { isOpen: boolean; onClose: () => void; onOpenTerminal?: () => void }
function download(text: string, name: string, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const RefinementModal: React.FC<RefinementModalProps> = ({ isOpen, onClose }) => {
  const [session, setSession] = useState<RefinementSession | null>(null), [checking, setChecking] = useState(true);
  const [items, setItems] = useState<RefinementItem[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [title, setTitle] = useState(''), [details, setDetails] = useState(''), [category, setCategory] = useState<RefinementItem['category']>('general'), [priority, setPriority] = useState<RefinementItem['priority']>('normal');
  const [assistant, setAssistant] = useState('ChatGPT / Codex'), [preview, setPreview] = useState('');
  const [tab, setTab] = useState<'write' | 'saved'>('write');
  useEffect(() => {
    if (!isOpen) return;
    let active = true; setChecking(true); setError(''); setNotice(''); setPreview(''); setItems([]);
    getVerifiedSession().then(s => { if (active) setSession(s); }).catch(() => { if (active) { setSession(null); setError('Unable to check authentication. Please sign in to continue.'); } }).finally(() => { if (active) setChecking(false); });
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', key);
    return () => { active = false; window.removeEventListener('keydown', key); };
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !session || checking) return;
    let active = true; setItems([]);
    getStagedRefinements().then(i => { if (active) setItems(i); }).catch(e => { if (active) fail(e); });
    const expiry = setTimeout(() => { setSession(null); setItems([]); setPreview(''); setError('Your session expired. Sign in again to continue.'); }, Math.max(0, Date.parse(session.expiresAt) - Date.now()));
    return () => { active = false; clearTimeout(expiry); };
  }, [isOpen, session?.userId, session?.expiresAt, checking]);
  const fail = (e: unknown) => { setError(e instanceof Error ? e.message : 'The request failed.'); if (e instanceof PortfolioRequestError && e.status === 401) { setSession(null); setItems([]); setPreview(''); } };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const item = await addRefinementItem({ title, details, category, priority }); setItems(old => [item, ...old].slice(0, 200)); setTitle(''); setDetails(''); setTab('saved'); setNotice(`Saved for review · authenticated by ${item.authentication.method === 'passkey' ? 'passkey' : 'Google'}.`); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };
  const copy = async (text: string) => { setError(''); try { await navigator.clipboard.writeText(text); setNotice('Brief copied. Paste it into your chosen assistant.'); } catch { setError('Clipboard access failed. Use Download brief instead.'); } };
  if (!isOpen) return null;
  const button = 'retro-btn px-3 py-2 text-xs font-bold cursor-pointer disabled:opacity-40';
  const input = 'w-full mt-1 p-2 border border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs';
  const legacy = getLegacyDrafts();
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="refinement-title">
    <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-[var(--bg-card)] border-2 border-[var(--border-strong)] font-mono shadow-xl">
      <div className="rainbow-border-top h-[3px] shrink-0" />
      <div className="p-4 flex justify-between items-center border-b border-[var(--border-color)]">
        <h2 id="refinement-title" className="text-sm font-bold text-[var(--text-primary)]">PREPARE A SITE CHANGE</h2>
        <button onClick={onClose} aria-label="Close refinement" className="cursor-pointer text-[var(--text-primary)]"><X size={18} /></button>
      </div>
      <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
        {checking ? <p className="text-xs text-[var(--text-secondary)]">Checking your session…</p> : <SignInControls session={session} onChange={s => { setSession(s); setItems([]); setPreview(''); setError(''); }} />}
        {error && <p role="alert" className="text-xs text-red-400 whitespace-pre-wrap">{error}</p>}
        {notice && <p role="status" className="text-xs text-[var(--rm-status)]">{notice}</p>}
        {!checking && session && <>
          <div className="flex flex-wrap gap-2 border-t border-[var(--border-color)] pt-4">
            <button className={button} onClick={() => setTab('write')} aria-pressed={tab === 'write'}>PROPOSE A CHANGE</button>
            <button className={button} onClick={() => setTab('saved')} aria-pressed={tab === 'saved'}>{session.role === 'owner' ? 'REVIEW SUGGESTIONS' : 'MY SUGGESTIONS'} ({items.length})</button>
          </div>
          {tab === 'write' ? <form onSubmit={submit} className="space-y-4 text-xs text-[var(--text-secondary)]">
            <div className="grid sm:grid-cols-2 gap-3">
              <label>Section<select className={input} value={category} onChange={e => setCategory(e.target.value as RefinementItem['category'])}>{[['general','General revision'],['project','Projects'],['bio','Biography'],['skill','Skills'],['huggingface','Hugging Face'],['easteregg','Terminal']].map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
              <label>Priority<select className={input} value={priority} onChange={e => setPriority(e.target.value as RefinementItem['priority'])}>{['normal','high','immediate'].map(p => <option key={p}>{p}</option>)}</select></label>
            </div>
            <label className="block">Title<input required maxLength={180} className={input} value={title} onChange={e => setTitle(e.target.value)} /></label>
            <label className="block">Requested change and supporting sources<textarea required maxLength={12000} rows={5} className={input} value={details} onChange={e => setDetails(e.target.value)} placeholder="What is inaccurate or missing? Include the page section and public source links." /></label>
            <p>Your account and authentication method will be attached by the server. This saves a suggestion for review; it does not change the public page.</p>
            <button className={button} disabled={busy || !title.trim() || !details.trim()}>{busy ? 'SAVING…' : 'SUBMIT AUTHENTICATED SUGGESTION'}</button>
          </form> : <div className="space-y-4">
            <p className="text-[11px] text-[var(--text-secondary)]">Most recent 200 submissions. {session.role === 'owner' ? 'Your refinements and visitor suggestions are listed here.' : 'Only your submissions are shown.'}</p>
            <label className="block text-xs text-[var(--text-secondary)]">Assistant for handoff<select className={input} value={assistant} onChange={e => { setAssistant(e.target.value); setPreview(''); }}>{['ChatGPT / Codex','Hermes','GrokBot','Grok Build','Other assistant'].map(a => <option key={a}>{a}</option>)}</select></label>
            <p className="text-[11px] text-[var(--text-muted)]">Copy or download a brief, then open it in your chosen assistant. Nothing is sent automatically.</p>
            {items.length === 0 && <p className="text-xs text-[var(--text-secondary)]">No suggestions submitted yet.</p>}
            {items.length > 0 && <button className={button} onClick={() => setPreview(buildBatchIterationPrompt(items, assistant))}>PREVIEW ALL BRIEFS</button>}
            {items.map(item => <article key={item.id} className="p-3 border border-[var(--border-color)] bg-[var(--bg-primary)] space-y-2 text-xs">
              <h3 className="font-bold text-[var(--text-primary)]">{item.title}</h3>
              <p className="text-[var(--text-secondary)]">{item.author} · {item.role === 'owner' ? 'SITE OWNER' : 'VISITOR'} · {new Date(item.createdAt).toLocaleString()}</p>
              <p className="text-[var(--rm-status)]">Authenticated by {item.authentication.method === 'passkey' ? 'passkey' : 'Google sign-in'} · submitted for review</p>
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap break-words">{item.details}</p>
              <details className="text-[10px] text-[var(--text-muted)] break-all"><summary className="cursor-pointer">Authentication record</summary><p>Account: {item.userId}</p><p>Verified: {item.authentication.verifiedAt}</p>{item.authentication.credentialId && <p>Passkey ID: {item.authentication.credentialId}</p>}<p>Receipt: {item.id}</p><p>Content SHA-256: {item.contentHash}</p></details>
              <button className={button} onClick={() => setPreview(buildSingleIterationPrompt(item, assistant))}>PREVIEW HANDOFF</button>
            </article>)}
            {preview && <div className="space-y-2 border-t border-[var(--border-color)] pt-4"><label className="block text-xs text-[var(--text-secondary)]">Review before handing off<textarea className={input} readOnly rows={9} value={preview} /></label><div className="flex flex-wrap gap-2"><button className={button} onClick={() => copy(preview)}>COPY BRIEF</button><button className={button} onClick={() => download(preview,'resonant-mirror-change.md')}>DOWNLOAD BRIEF</button></div></div>}
          </div>}
          {legacy.length > 0 && <div className="border-t border-[var(--border-color)] pt-3 space-y-2 text-xs text-[var(--text-secondary)]"><p>{legacy.length} older browser-local draft(s) preserved. They have no verified authentication record.</p><button className={button} onClick={() => download(JSON.stringify(legacy,null,2),'legacy-unverified-refinements.json','application/json')}>DOWNLOAD OLD DRAFTS (UNVERIFIED)</button></div>}
        </>}
      </div>
    </div>
  </div>;
};
