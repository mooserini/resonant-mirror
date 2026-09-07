import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wrench, 
  CheckCircle, 
  Copy, 
  Trash2, 
  LogOut, 
  KeyRound, 
  Fingerprint, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';
import { RefinementItem, RefinementSession } from '../types';
import { 
  getCurrentRefinementSession, 
  loginRefinementSession, 
  clearRefinementSession,
  getStagedRefinements,
  addRefinementItem,
  removeRefinementItem,
  clearAllRefinements,
  buildSingleIterationPrompt,
  buildBatchIterationPrompt
} from '../utils/refinementService';
import { performFidoAuthentication } from '../utils/fidoAuth';
import { retroAudio } from '../utils/audio';

interface RefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerminal?: () => void;
}

export const RefinementModal: React.FC<RefinementModalProps> = ({
  isOpen,
  onClose,
  onOpenTerminal,
}) => {
  const [session, setSession] = useState<RefinementSession | null>(() => getCurrentRefinementSession());
  const [userIdInput, setUserIdInput] = useState('mooserini');
  const [activeTab, setActiveTab] = useState<'create' | 'ledger'>('create');
  
  // New refinement form state
  const [category, setCategory] = useState<RefinementItem['category']>('huggingface');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState<RefinementItem['priority']>('high');

  // Ledger state
  const [stagedItems, setStagedItems] = useState<RefinementItem[]>(() => getStagedRefinements());
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [batchCopied, setBatchCopied] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSession(getCurrentRefinementSession());
      setStagedItems(getStagedRefinements());
      setFeedbackNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (rawId: string, authMethod: 'userId-passkey' | 'fido2-hardware' = 'userId-passkey') => {
    retroAudio.playKeyclick();
    const newSession = loginRefinementSession(rawId, authMethod);
    setSession(newSession);
    retroAudio.playFidoSuccess();
    setFeedbackNotice(`Authenticated as ${newSession.userId}. Refinement loop active.`);
  };

  const handleFidoLogin = async () => {
    retroAudio.playKeyclick();
    setFeedbackNotice('Querying WebAuthn passkey / CTAP2 hardware key...');
    try {
      await performFidoAuthentication(userIdInput.trim() || 'mooserini');
      const newSession = loginRefinementSession(userIdInput.trim() || 'mooserini', 'fido2-hardware');
      setSession(newSession);
      retroAudio.playFidoSuccess();
      setFeedbackNotice(`FIDO2 Passkey verified for ${newSession.userId}! Dropped into refinement session.`);
    } catch {
      // Fallback
      handleLogin(userIdInput, 'userId-passkey');
    }
  };

  const handleLogout = () => {
    retroAudio.playKeyclick();
    clearRefinementSession();
    setSession(null);
    setFeedbackNotice('Session terminated. User logged out.');
  };

  const handleStageItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !title.trim()) return;
    retroAudio.playKeyclick();

    const created = addRefinementItem({
      userId: session.userId,
      category,
      title: title.trim(),
      details: details.trim() || 'Refinement details pending specification.',
      priority,
    });

    setStagedItems(getStagedRefinements());
    setTitle('');
    setDetails('');
    retroAudio.playAchievementFanfare();
    setFeedbackNotice(`Refinement "${created.title}" successfully staged to session ledger!`);
    setActiveTab('ledger');
  };

  const handleCopySinglePrompt = (item: RefinementItem) => {
    retroAudio.playKeyclick();
    const prompt = buildSingleIterationPrompt(item);
    navigator.clipboard.writeText(prompt);
    setCopiedPromptId(item.id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  const handleCopyBatchPrompt = () => {
    retroAudio.playKeyclick();
    const prompt = buildBatchIterationPrompt(stagedItems);
    navigator.clipboard.writeText(prompt);
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 2500);
  };

  const handleRemoveItem = (id: string) => {
    retroAudio.playKeyclick();
    removeRefinementItem(id);
    setStagedItems(getStagedRefinements());
  };

  const handleClearAll = () => {
    retroAudio.playKeyclick();
    clearAllRefinements();
    setStagedItems([]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="refinement-modal-title"
    >
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-strong)] w-full max-w-2xl max-h-[90vh] shadow-2xl relative flex flex-col font-mono text-xs sm:text-sm overflow-hidden">
        
        {/* Top Rainbow Bar */}
        <div className="rainbow-border-top h-[3px] w-full" />

        {/* Modal Window Chrome */}
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-between items-center select-none">
          <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <Wrench className="w-4 h-4 text-[var(--rm-accent-bright)]" />
            <span id="refinement-modal-title" className="tracking-wide">
              REFINEMENT &amp; ITERATION LOOP
            </span>
          </div>

          <div className="flex items-center gap-2">
            {session && (
              <span className="text-[10px] px-2 py-0.5 border border-[#00aa00] bg-[#00aa00]/15 text-[#00aa00] font-bold">
                OPERATOR: {session.userId}
              </span>
            )}
            <button
              onClick={() => {
                retroAudio.playKeyclick();
                onClose();
              }}
              className="p-1 hover:bg-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Close Refinement Window (ESC)"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackNotice && (
          <div className="px-4 py-2 bg-[var(--bg-primary)] border-b border-[var(--border-color)] text-[11px] text-[var(--rm-status)] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{feedbackNotice}</span>
            </div>
            <button 
              onClick={() => setFeedbackNotice(null)}
              className="text-[var(--text-muted)] hover:text-white cursor-pointer ml-2"
            >
              [X]
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {!session ? (
            /* STEP 1: USER ID AUTHENTICATION GATEWAY */
            <div className="space-y-5 py-2">
              <div className="p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-2">
                <div className="flex items-center gap-2 text-[var(--rm-accent-bright)] font-bold text-xs uppercase">
                  <KeyRound className="w-4 h-4" />
                  <span>AUTHENTICATE OPERATOR SESSION</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  To refine the portfolio or stage new additions (such as Hugging Face models, autonomous agent lineage notes, projects, or skills), please enter your operator User ID to drop into your active refinement session.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-[var(--text-primary)]">
                  USER ID / OPERATOR HANDLE:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="e.g. mooserini"
                    className="flex-1 p-2.5 border-2 border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono font-bold focus:outline-none focus:border-[var(--rm-status)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleLogin(userIdInput);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleLogin(userIdInput)}
                    className="retro-btn px-4 py-2 font-bold bg-[var(--rm-headings)] text-[var(--rm-heading-text)] hover:opacity-90 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>[ LOGIN ]</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick select presets */}
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                  <span>PRESETS:</span>
                  {['mooserini', 'thomas.kenny', 'uncle.russet'].map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        setUserIdInput(id);
                        retroAudio.playKeyclick();
                      }}
                      className="px-1.5 py-0.5 border border-[var(--border-color)] hover:border-[var(--rm-status)] hover:text-[var(--rm-status)] cursor-pointer"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hardware / Passkey Secondary Method */}
              <div className="pt-2 border-t border-[var(--border-color)]">
                <button
                  onClick={handleFidoLogin}
                  className="w-full retro-btn p-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border-dashed"
                >
                  <Fingerprint className="w-4 h-4 text-[var(--rm-status)]" />
                  <span>[ OR AUTHENTICATE VIA FIDO2 / WEBAUTHN PASSKEY ]</span>
                </button>
              </div>

              <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] text-[var(--text-muted)] space-y-1">
                <div>• Session ID &amp; User ID will attach to all staged refinement records.</div>
                <div>• Once logged in, your session persists across modal opens for rapid iterations.</div>
              </div>
            </div>
          ) : (
            /* STEP 2: ACTIVE REFINEMENT WORKSPACE LOOP */
            <div className="space-y-5">
              {/* Session Control Header */}
              <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00aa00] animate-pulse" />
                    <span className="font-bold text-[var(--text-primary)]">
                      OPERATOR: {session.userId}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      ({session.sessionId})
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    AUTHENTICATION: {session.authMethod.toUpperCase()} • STARTED: {new Date(session.startedAt).toLocaleTimeString()}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-2 py-1 text-[10px] border border-red-800 text-red-400 hover:bg-red-950/40 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Logout current operator session"
                >
                  <LogOut className="w-3 h-3" />
                  <span>LOGOUT</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[var(--border-color)]">
                <button
                  onClick={() => {
                    retroAudio.playKeyclick();
                    setActiveTab('create');
                  }}
                  className={`px-4 py-2 text-xs font-bold cursor-pointer transition-all border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'create'
                      ? 'border-[var(--rm-status)] text-[var(--rm-status)] bg-[var(--bg-primary)]'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>[ STAGE REFINEMENT ]</span>
                </button>

                <button
                  onClick={() => {
                    retroAudio.playKeyclick();
                    setActiveTab('ledger');
                  }}
                  className={`px-4 py-2 text-xs font-bold cursor-pointer transition-all border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'ledger'
                      ? 'border-[var(--rm-status)] text-[var(--rm-status)] bg-[var(--bg-primary)]'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>[ REFINEMENT LEDGER ({stagedItems.length}) ]</span>
                </button>
              </div>

              {activeTab === 'create' ? (
                /* TAB 1: FORM TO STAGE REFINEMENT */
                <form onSubmit={handleStageItem} className="space-y-4">
                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-primary)]">
                      TARGET CATEGORY:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {[
                        { id: 'huggingface', label: '🤗 Hugging Face / Models' },
                        { id: 'project', label: '📁 New / Modified Project' },
                        { id: 'skill', label: '⚡ Technical Skill' },
                        { id: 'bio', label: '📜 Bio & Architecture' },
                        { id: 'easteregg', label: '🎮 Terminal Easter Egg' },
                        { id: 'general', label: '⚙ General Revision' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            retroAudio.playKeyclick();
                            setCategory(cat.id as RefinementItem['category']);
                          }}
                          className={`p-1.5 text-[11px] text-left border cursor-pointer transition-colors ${
                            category === cat.id
                              ? 'border-[var(--rm-status)] bg-[var(--rm-status)]/15 text-[var(--rm-status)] font-bold'
                              : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Refinement Title */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-primary)]">
                      REFINEMENT TITLE:
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={
                        category === 'huggingface'
                          ? 'e.g. Add Hermes-Qwen-14B GGUF weights to @mooserini'
                          : category === 'project'
                          ? 'e.g. Add launch daemon supervisor project'
                          : 'Enter concise summary of desired addition...'
                      }
                      className="w-full p-2.5 border-2 border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--rm-status)]"
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-primary)]">
                      PRIORITY LEVEL:
                    </label>
                    <div className="flex gap-2">
                      {(['normal', 'high', 'immediate'] as const).map((p) => (
                        <label key={p} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            checked={priority === p}
                            onChange={() => setPriority(p)}
                            className="accent-[var(--rm-headings)] cursor-pointer"
                          />
                          <span className="uppercase">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Notes / Iteration Prompt */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-primary)]">
                      SPECIFICATIONS &amp; DESIRED ADDITIONS:
                    </label>
                    <textarea
                      rows={4}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Describe the exact model repo, project URL, metrics, code snippet, or text revision to incorporate..."
                      className="w-full p-2.5 border-2 border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--rm-status)] resize-y leading-relaxed"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={!title.trim()}
                      className="retro-btn px-4 py-2 font-bold bg-[var(--rm-headings)] text-[var(--rm-heading-text)] hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>[ STAGE TO SESSION LEDGER ]</span>
                    </button>

                    <button
                      type="button"
                      disabled={!title.trim()}
                      onClick={() => {
                        retroAudio.playKeyclick();
                        const mockItem: RefinementItem = {
                          id: `TEMP-${Date.now().toString(36).toUpperCase()}`,
                          userId: session.userId,
                          category,
                          title: title.trim(),
                          details: details.trim(),
                          priority,
                          status: 'staged',
                          createdAt: new Date().toISOString(),
                        };
                        const prompt = buildSingleIterationPrompt(mockItem);
                        navigator.clipboard.writeText(prompt);
                        setFeedbackNotice('Generated iteration prompt copied to clipboard! Paste directly into AI Studio chat.');
                      }}
                      className="retro-btn px-4 py-2 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Copy className="w-4 h-4 text-[var(--rm-accent-bright)]" />
                      <span>[ COPY PROMPT FOR AI STUDIO ]</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* TAB 2: STAGED LEDGER */
                <div className="space-y-4">
                  {stagedItems.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-[var(--border-color)] space-y-2">
                      <Layers className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
                      <div className="text-xs font-bold text-[var(--text-primary)]">
                        NO REFINEMENTS CURRENTLY STAGED
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Use the &ldquo;Stage Refinement&rdquo; tab to add what you notice. Staged items can be copied as complete prompts for AI Studio.
                      </p>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="retro-btn px-3 py-1.5 text-xs font-bold mt-2 inline-block cursor-pointer"
                      >
                        + STAGE YOUR FIRST REFINEMENT
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs pb-1 border-b border-[var(--border-color)]">
                        <span className="font-bold text-[var(--text-primary)]">
                          {stagedItems.length} REFINEMENT(S) RECORDED:
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopyBatchPrompt}
                            className="px-2 py-1 text-[10px] font-bold border border-[var(--rm-status)] bg-[var(--rm-status)]/15 text-[var(--rm-status)] hover:bg-[var(--rm-status)] hover:text-black cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{batchCopied ? 'BATCH COPIED!' : 'COPY ALL BATCH PROMPTS'}</span>
                          </button>
                          <button
                            onClick={handleClearAll}
                            className="px-2 py-1 text-[10px] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-400 cursor-pointer"
                          >
                            CLEAR ALL
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                        {stagedItems.map((item) => (
                          <div 
                            key={item.id}
                            className="p-3 border border-[var(--border-color)] bg-[var(--bg-primary)] space-y-2 text-xs"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--rm-accent-bright)]">
                                    {item.category}
                                  </span>
                                  <span className="font-bold text-[var(--text-primary)]">
                                    {item.title}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)]">
                                  ID: {item.id} • OPERATOR: {item.userId} • PRIORITY: {item.priority.toUpperCase()}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => handleCopySinglePrompt(item)}
                                  className="p-1 border border-[var(--border-strong)] hover:border-[var(--rm-status)] text-[var(--text-primary)] hover:text-[var(--rm-status)] cursor-pointer"
                                  title="Copy single AI Studio prompt for this refinement"
                                >
                                  {copiedPromptId === item.id ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-[var(--rm-status)]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1 border border-[var(--border-strong)] hover:border-red-600 text-[var(--text-muted)] hover:text-red-400 cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                              {item.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Terminal Quick Link */}
              {onOpenTerminal && (
                <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Want to query refinements in DOS console?</span>
                  <button
                    onClick={() => {
                      retroAudio.playKeyclick();
                      onClose();
                      onOpenTerminal();
                    }}
                    className="text-[var(--rm-status)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>LAUNCH DOS CONSOLE (~)</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
