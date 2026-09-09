import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, MessageSquare, Radio, RefreshCw, Send, ShieldCheck, Terminal, X } from 'lucide-react';
import type { RefinementSession, RelayMessage, RelayProfile } from '../types';
import { getVerifiedSession } from '../utils/portfolioAuth';
import { getRelayProfile, listRelayMessages, registerRelayHandle, sendRelayMessage } from '../services/resonantRelay';
import { SignInControls } from './SignInControls';
import { retroAudio } from '../utils/audio';

interface Props { isOpen: boolean; onClose: () => void; onOpenTerminal?: () => void }

function mergeMessages(current: RelayMessage[], incoming: RelayMessage[]) {
  return [...new Map([...current, ...incoming].map(message => [message.id, message])).values()]
    .sort((a, b) => a.id.localeCompare(b.id));
}

export const ResonantRelayModal: React.FC<Props> = ({ isOpen, onClose, onOpenTerminal }) => {
  const [session, setSession] = useState<RefinementSession | null>(null);
  const [profile, setProfile] = useState<RelayProfile | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [handle, setHandle] = useState('');
  const [callsign, setCallsign] = useState('');
  const [draft, setDraft] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [messages, setMessages] = useState<RelayMessage[]>([]);
  const cursor = useRef<string | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const refreshIdentity = useCallback(async () => {
    setChecking(true); setError('');
    try {
      const [verified, relay] = await Promise.all([getVerifiedSession(), getRelayProfile()]);
      setSession(verified); setProfile(relay.profile);
      if (!verified) { setMessages([]); cursor.current = null; }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The relay identity check failed.'); }
    finally { setChecking(false); }
  }, []);

  const syncMessages = useCallback(async (reset = false) => {
    if (!profile?.hasConversation || document.visibilityState === 'hidden') return;
    setSyncing(true);
    try {
      const result = await listRelayMessages(reset ? null : cursor.current);
      setMessages(previous => reset ? result.messages : mergeMessages(previous, result.messages));
      cursor.current = result.nextCursor;
      setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Reply check failed.'); }
    finally { setSyncing(false); }
  }, [profile?.hasConversation]);

  useEffect(() => { if (isOpen) void refreshIdentity(); }, [isOpen, refreshIdentity]);
  useEffect(() => { if (isOpen && profile?.hasConversation) void syncMessages(true); }, [isOpen, profile?.hasConversation, syncMessages]);
  useEffect(() => {
    if (!isOpen || !profile?.hasConversation) return;
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void syncMessages(); }, 60000);
    const visible = () => { if (document.visibilityState === 'visible') void syncMessages(); };
    document.addEventListener('visibilitychange', visible);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, [isOpen, profile?.hasConversation, syncMessages]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    if (!isOpen) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [isOpen, onClose]);

  const saveHandle = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const saved = await registerRelayHandle(handle, accepted);
      setProfile(saved); setAccepted(false); setHandle('');
      setSession(await getVerifiedSession());
      setNotice(`Handle ${saved.handle} is registered. Replies are now available in this browser after sign-in.`);
      retroAudio.playBootSuccess();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Handle registration failed.'); retroAudio.playError(); }
    finally { setBusy(false); }
  };

  const transmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const text = draft.trim();
      const result = await sendRelayMessage(session ? { message: text } : { message: text, callsign: callsign.trim(), acceptedDisclosure: accepted });
      if (result.message) setMessages(previous => mergeMessages(previous, [result.message!]));
      setDraft('');
      if (!session) {
        setAccepted(false);
        setNotice('Dispatch accepted. Anonymous dispatch is send-only; sign in and choose a handle to receive replies here.');
      } else {
        setProfile(previous => previous ? { ...previous, hasConversation: true } : previous);
        setNotice(result.duplicate ? 'That transmission was already accepted.' : 'Transmission accepted by the private relay.');
      }
      retroAudio.playBootSuccess();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Transmission failed.'); retroAudio.playError(); }
    finally { setBusy(false); }
  };

  if (!isOpen) return null;
  const button = 'retro-btn px-3 py-2 text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-wait';

  return <AnimatePresence>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs font-mono" onClick={onClose}>
      <motion.div initial={{ scale: .96, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: .96, opacity: 0, y: 10 }} className="relative w-full max-w-4xl h-[88vh] max-h-[760px] bg-[var(--bg-card)] border-2 border-[var(--border-strong)] shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]" onClick={event => event.stopPropagation()}>
        <div className="bg-[var(--rm-headings)] text-[var(--rm-heading-text)] px-3 py-2 flex items-center justify-between text-xs font-bold border-b border-[var(--border-strong)]">
          <div className="flex items-center gap-2"><Radio className="w-3.5 h-3.5" /><span>RESONANT RELAY // PRIVATE DISCORD COURIER V1.0</span></div>
          <button onClick={onClose} className="p-1" title="Close relay"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="flex items-center gap-2 text-[var(--rm-status)]"><span className="w-2 h-2 rounded-full bg-[var(--rm-status)]" />{session ? `VERIFIED HANDLE: ${profile?.handle || 'NOT YET CHOSEN'}` : 'ANONYMOUS SEND-ONLY LINK'}</span>
          {profile?.hasConversation && <button className={button} disabled={syncing} onClick={() => void syncMessages()}><RefreshCw className={`inline w-3 h-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />CHECK REPLIES</button>}
        </div>

        {(error || notice) && <div role={error ? 'alert' : 'status'} className={`px-4 py-2 text-xs border-b flex items-start gap-2 ${error ? 'border-red-700 text-red-600 bg-red-950/10' : 'border-[var(--rm-status)] text-[var(--rm-status)] bg-[var(--rm-status)]/10'}`}>
          {error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}<span>{error || notice}</span>
        </div>}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {checking ? <p className="text-xs text-[var(--text-secondary)] animate-pulse">CHECKING RELAY IDENTITY…</p> : session && !profile ?
            <form onSubmit={saveHandle} className="max-w-xl mx-auto space-y-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
              <h2 className="font-bold text-[var(--rm-headings)]">REGISTER YOUR SITE HANDLE</h2>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">This handle—not your Google or passkey account name—labels messages carried into Discord. The site keeps an internal account identifier so the handle returns with your verified session. Authentication credentials, provider email, and provider profile name are not sent to Discord.</p>
              <label className="block text-xs">HANDLE<input autoFocus autoComplete="nickname" maxLength={24} value={handle} onChange={event => setHandle(event.target.value)} className="mt-1 w-full p-2 border border-[var(--border-strong)] bg-[var(--bg-primary)]" placeholder="three_to_twenty_four" /></label>
              <label className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--text-secondary)]"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-0.5" /><span>I understand that my chosen handle and messages will be visible to Thomas in his private Discord relay. I have read this site's <a className="underline" href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a className="underline" href="/terms" target="_blank" rel="noreferrer">Terms</a>, including that Discord processes and retains its copy under its <a className="underline" href="https://discord.com/privacy" target="_blank" rel="noreferrer">privacy policy</a>.</span></label>
              <button className={button} disabled={busy || !accepted || !handle.trim()}>CONFIRM HANDLE</button>
            </form> :

            session && profile ? <div className="h-full flex flex-col min-h-[420px]">
              <div className="flex-1 space-y-3 pb-4">
                {messages.length === 0 ? <div className="border border-dashed border-[var(--border-color)] p-6 text-center text-xs text-[var(--text-muted)]">NO TRANSMISSIONS IN THIS HANDLE THREAD YET.</div> : messages.map(message => <div key={message.id} className={`max-w-[88%] border p-3 text-xs ${message.author === 'you' ? 'ml-auto border-[var(--rm-headings)] bg-[var(--rm-headings)]/5' : 'mr-auto border-[var(--rm-status)] bg-[var(--rm-status)]/5'}`}>
                  <div className="flex justify-between gap-4 text-[10px] text-[var(--text-muted)] mb-1"><strong className="text-[var(--rm-headings)]">{message.author === 'you' ? profile.handle : 'THOMAS'}</strong><span>{new Date(message.createdAt).toLocaleString()}</span></div>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
                </div>)}
                <div ref={messagesEnd} />
              </div>
              <form onSubmit={transmit} className="sticky bottom-0 border-t border-[var(--border-color)] bg-[var(--bg-card)] pt-3 flex gap-2">
                <textarea maxLength={1800} rows={3} value={draft} onChange={event => setDraft(event.target.value)} className="flex-1 p-2 border border-[var(--border-strong)] bg-[var(--bg-primary)] text-xs resize-none" placeholder={`Message Thomas as ${profile.handle}…`} />
                <button className={button} disabled={busy || !draft.trim()}><Send className="w-3.5 h-3.5 inline mr-1" />SEND</button>
              </form>
            </div> :

            <div className="grid md:grid-cols-[1.1fr_.9fr] gap-5">
              <form onSubmit={transmit} className="space-y-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
                <div><h2 className="font-bold text-[var(--rm-headings)]">ANONYMOUS DISPATCH</h2><p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">Anyone can send Thomas a dispatch without registering. Anonymous dispatches are send-only: this browser cannot receive his reply.</p></div>
                <label className="block text-xs">CALLSIGN (OPTIONAL)<input autoComplete="nickname" maxLength={24} value={callsign} onChange={event => setCallsign(event.target.value)} className="mt-1 w-full p-2 border border-[var(--border-strong)] bg-[var(--bg-primary)]" /></label>
                <label className="block text-xs">MESSAGE<textarea maxLength={1800} rows={7} value={draft} onChange={event => setDraft(event.target.value)} className="mt-1 w-full p-2 border border-[var(--border-strong)] bg-[var(--bg-primary)] resize-none" /></label>
                <label className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--text-secondary)]"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-0.5" /><span>I understand that my callsign and message go to Thomas through Discord. I have read this site's <a className="underline" href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a className="underline" href="/terms" target="_blank" rel="noreferrer">Terms</a>, including that Discord processes and retains its copy under its <a className="underline" href="https://discord.com/privacy" target="_blank" rel="noreferrer">privacy policy</a>.</span></label>
                <button className={button} disabled={busy || !accepted || !draft.trim()}><Send className="w-3.5 h-3.5 inline mr-1" />SEND ONCE</button>
              </form>
              <div className="border border-[var(--border-color)] p-5 space-y-4">
                <div><h2 className="font-bold text-[var(--rm-headings)]">ENABLE REPLIES</h2><p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">Sign in with Google or a passkey, then choose a handle used only on this site. Your provider identity is not used as your public chat name.</p></div>
                <SignInControls session={null} onChange={() => { void refreshIdentity(); }} />
              </div>
            </div>}
        </div>

        <div className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] px-4 py-1.5 flex flex-wrap justify-between gap-2 text-[10px] text-[var(--text-muted)]">
          <span>TRANSPORT: SAME-ORIGIN WORKER → DISCORD REST · REPLY CHECK: 60s WHILE VISIBLE</span>
          {onOpenTerminal && <button onClick={() => { onClose(); onOpenTerminal(); }} className="text-[var(--rm-headings)]"><Terminal className="inline w-3 h-3 mr-1" />OPEN DOS CONSOLE</button>}
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>;
};
