import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  Plus,
  RefreshCw,
  LogOut,
  Users,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  X,
  Radio,
  Hash,
} from 'lucide-react';
import {
  initGoogleChatAuth,
  googleChatSignIn,
  googleChatSignOut,
  getGoogleChatAccessToken,
} from '../services/googleChatAuth';
import {
  listGoogleChatSpaces,
  listGoogleChatMessages,
  sendGoogleChatMessage,
  createGoogleChatSpace,
  GoogleChatSpace,
  GoogleChatMessage,
} from '../services/googleChatService';
import { retroAudio } from '../utils/audio';

interface GoogleChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerminal?: () => void;
}

export const GoogleChatModal: React.FC<GoogleChatModalProps> = ({
  isOpen,
  onClose,
  onOpenTerminal,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<GoogleChatSpace | null>(null);
  const [messages, setMessages] = useState<GoogleChatMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState<string>('');
  const [isLoadingSpaces, setIsLoadingSpaces] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal for new space creation
  const [showCreateSpace, setShowCreateSpace] = useState<boolean>(false);
  const [newSpaceName, setNewSpaceName] = useState<string>('');
  const [isCreatingSpace, setIsCreatingSpace] = useState<boolean>(false);

  // Mandatory confirmation dialog for sending messages (Workspace API mutating operation)
  const [pendingMessageToSend, setPendingMessageToSend] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initGoogleChatAuth(
      (user, token) => {
        setIsAuthenticated(true);
        setUserEmail(user.email);
        setUserName(user.displayName || user.email);
        setAuthError(null);
        loadSpaces(token);
      },
      () => {
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserName(null);
        setSpaces([]);
        setSelectedSpace(null);
        setMessages([]);
      }
    );

    return () => unsubscribe();
  }, []);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle ESC key to dismiss sub-modals or close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingMessageToSend) {
          setPendingMessageToSend(null);
        } else if (showCreateSpace) {
          setShowCreateSpace(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pendingMessageToSend, showCreateSpace, onClose]);

  const loadSpaces = async (tokenOverride?: string) => {
    const token = tokenOverride || (await getGoogleChatAccessToken());
    if (!token) return;

    setIsLoadingSpaces(true);
    setApiError(null);
    try {
      const result = await listGoogleChatSpaces(token);
      if (result.error) {
        setApiError(result.error);
      } else {
        setSpaces(result.spaces);
        if (result.spaces.length > 0 && !selectedSpace) {
          setSelectedSpace(result.spaces[0]);
          loadMessages(result.spaces[0].name, token);
        }
      }
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const loadMessages = async (spaceName: string, tokenOverride?: string) => {
    const token = tokenOverride || (await getGoogleChatAccessToken());
    if (!token) return;

    setIsLoadingMessages(true);
    setApiError(null);
    try {
      const result = await listGoogleChatMessages(spaceName, token);
      if (result.error) {
        setApiError(result.error);
      } else {
        setMessages(result.messages);
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSignIn = async () => {
    setAuthError(null);
    retroAudio.playKeyClick();
    try {
      const result = await googleChatSignIn();
      if (result) {
        setIsAuthenticated(true);
        setUserEmail(result.user.email);
        setUserName(result.user.displayName || result.user.email);
        retroAudio.playBootSuccess();
        loadSpaces(result.accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify popup permissions.');
      retroAudio.playError();
    }
  };

  const handleSignOut = async () => {
    retroAudio.playKeyClick();
    await googleChatSignOut();
    setIsAuthenticated(false);
    setUserEmail(null);
    setSpaces([]);
    setSelectedSpace(null);
    setMessages([]);
  };

  const handleSelectSpace = (space: GoogleChatSpace) => {
    retroAudio.playKeyClick();
    setSelectedSpace(space);
    loadMessages(space.name);
  };

  // Step 1 of send: Trigger mandatory confirmation modal
  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageDraft.trim() || !selectedSpace) return;
    setPendingMessageToSend(messageDraft.trim());
    retroAudio.playKeyClick();
  };

  // Step 2 of send: Execute after explicit user confirmation
  const handleConfirmSend = async () => {
    if (!pendingMessageToSend || !selectedSpace) return;
    const token = await getGoogleChatAccessToken();
    if (!token) {
      setApiError('Session expired. Please sign in again.');
      return;
    }

    setIsSending(true);
    setApiError(null);
    const text = pendingMessageToSend;
    setPendingMessageToSend(null);

    const result = await sendGoogleChatMessage(selectedSpace.name, text, token);
    setIsSending(false);

    if (result.error) {
      setApiError(result.error);
      retroAudio.playError();
    } else {
      setMessageDraft('');
      retroAudio.playBootSuccess();
      if (result.message) {
        setMessages((prev) => [...prev, result.message!]);
      } else {
        loadMessages(selectedSpace.name, token);
      }
    }
  };

  const handleCreateSpaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;

    const token = await getGoogleChatAccessToken();
    if (!token) return;

    setIsCreatingSpace(true);
    setApiError(null);
    const result = await createGoogleChatSpace(newSpaceName.trim(), token);
    setIsCreatingSpace(false);

    if (result.error) {
      setApiError(result.error);
      retroAudio.playError();
    } else if (result.space) {
      retroAudio.playBootSuccess();
      setShowCreateSpace(false);
      setNewSpaceName('');
      setSpaces((prev) => [result.space!, ...prev]);
      setSelectedSpace(result.space);
      setMessages([]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs font-mono"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          className="relative w-full max-w-5xl h-[88vh] max-h-[780px] bg-[#0c0d0e] border-2 border-[var(--rm-border)] shadow-2xl flex flex-col overflow-hidden text-[var(--rm-foreground)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Vintage Terminal Window Titlebar */}
          <div className="bg-[var(--rm-headings)] text-[var(--rm-heading-text)] px-3 py-2 flex items-center justify-between select-none text-xs font-bold border-b border-[var(--rm-border)]">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>GOOGLE CHAT // COMM SUBSYSTEM PROTOCOL V1.0</span>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <span className="text-[10px] opacity-80 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  AUTH: {userEmail}
                </span>
              )}
              <button
                onClick={() => {
                  retroAudio.playKeyClick();
                  onClose();
                }}
                className="hover:bg-[var(--rm-heading-text)] hover:text-[var(--rm-headings)] px-1.5 py-0.5 rounded transition-colors text-xs font-bold"
                title="Close Window (ESC)"
              >
                [X]
              </button>
            </div>
          </div>

          {/* Subheader Toolbar & Diagnostics Status */}
          <div className="bg-[#141618] border-b border-[var(--rm-border)] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[var(--rm-status)]">
                <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isAuthenticated ? 'CARRIER LOCK: ONLINE' : 'STANDBY: AWAITING USER CREDENTIALS'}
              </span>
              {selectedSpace && (
                <span className="text-gray-400 hidden sm:inline">
                  SPACE: <strong className="text-[var(--rm-foreground)]">{selectedSpace.displayName || selectedSpace.name}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => loadSpaces()}
                    disabled={isLoadingSpaces}
                    className="px-2 py-1 text-xs border border-[var(--rm-border)] hover:bg-[var(--rm-border)] hover:text-[var(--rm-heading-text)] transition-colors flex items-center gap-1"
                    title="Refresh Spaces & Messages"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">REFRESH</span>
                  </button>
                  <button
                    onClick={() => setShowCreateSpace(true)}
                    className="px-2 py-1 text-xs border border-emerald-600/70 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>NEW SPACE</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-2 py-1 text-xs border border-red-800/70 text-red-400 hover:bg-red-950/60 transition-colors flex items-center gap-1"
                    title="Disconnect Google Chat session"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="hidden sm:inline">SIGNOUT</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* Error Banner */}
          {(authError || apiError) && (
            <div className="bg-red-950/80 border-b border-red-700 px-4 py-2 text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong>COMMUNICATION ERROR:</strong> {authError || apiError}
              </div>
              <button
                onClick={() => {
                  setAuthError(null);
                  setApiError(null);
                }}
                className="text-red-400 hover:text-white"
              >
                [DISMISS]
              </button>
            </div>
          )}

          {/* Main Body */}
          <div className="flex-1 flex overflow-hidden">
            {!isAuthenticated ? (
              /* Unauthenticated State with Mandatory Official Google Sign-In Button */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#090a0b]">
                <div className="max-w-md w-full border border-[var(--rm-border)] bg-[#111315] p-6 text-left shadow-lg">
                  <div className="flex items-center gap-2 mb-4 text-[var(--rm-headings)] text-sm font-bold border-b border-[var(--rm-border)] pb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>GOOGLE CHAT INTEGRATION PROTOCOL</span>
                  </div>

                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    Connect your Google Workspace or Gmail account to view your active Google Chat
                    spaces, read direct messages, and transmit retro dispatches with explicit confirmation.
                  </p>

                  <div className="bg-[#0c0d0e] p-3 text-[11px] text-gray-400 mb-6 border border-dashed border-[var(--rm-border)]">
                    <div className="font-bold text-[var(--rm-status)] mb-1">SECURITY & PERMISSION SCOPES:</div>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Read and create Google Chat spaces</li>
                      <li>Read conversations and message telemetry</li>
                      <li>Transmit dispatches only after operator confirmation</li>
                      <li>Tokens held strictly in volatile RAM (zero disk persistence)</li>
                    </ul>
                  </div>

                  {/* Official Google Sign-In Button per Skill Mandate */}
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={handleSignIn}
                      className="gsi-material-button group cursor-pointer inline-flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-medium px-4 py-2.5 rounded text-sm shadow-sm transition-all border border-gray-300"
                    >
                      <div className="mr-3">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold tracking-normal text-gray-700">Sign in with Google</span>
                    </button>
                  </div>

                  <div className="text-[10px] text-center text-gray-500">
                    Pressing sign in triggers Google's secure OAuth consent popup.
                  </div>
                </div>
              </div>
            ) : (
              /* Authenticated Two-Pane Retro Chat Workspace */
              <>
                {/* Left Sidebar: Spaces & Rooms */}
                <div className="w-64 sm:w-72 border-r border-[var(--rm-border)] bg-[#0d0e10] flex flex-col shrink-0">
                  <div className="p-3 border-b border-[var(--rm-border)] bg-[#121417] flex items-center justify-between text-xs font-bold text-[var(--rm-headings)]">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      SPACES & ROOMS ({spaces.length})
                    </span>
                    <button
                      onClick={() => setShowCreateSpace(true)}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      NEW
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-[#1d2024]">
                    {isLoadingSpaces && spaces.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400 animate-pulse">
                        SCANNING CARRIER CHANNELS...
                      </div>
                    ) : spaces.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">
                        NO SPACES DETECTED.
                        <div className="mt-2">
                          <button
                            onClick={() => setShowCreateSpace(true)}
                            className="px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] hover:bg-emerald-900"
                          >
                            + CREATE FIRST SPACE
                          </button>
                        </div>
                      </div>
                    ) : (
                      spaces.map((space) => {
                        const isSelected = selectedSpace?.name === space.name;
                        return (
                          <button
                            key={space.name}
                            onClick={() => handleSelectSpace(space)}
                            className={`w-full text-left p-2.5 transition-colors text-xs flex flex-col gap-1 ${
                              isSelected
                                ? 'bg-[var(--rm-headings)] text-[var(--rm-heading-text)] font-bold'
                                : 'hover:bg-[#181a1d] text-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate flex items-center gap-1.5">
                                <Hash className="w-3 h-3 shrink-0 opacity-70" />
                                <span className="truncate">{space.displayName || 'Direct Message'}</span>
                              </span>
                              <span className="text-[9px] opacity-70 uppercase">
                                {space.spaceType || space.type || 'SPACE'}
                              </span>
                            </div>
                            {space.spaceDetails?.description && (
                              <span className="text-[10px] opacity-60 line-clamp-1">
                                {space.spaceDetails.description}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2 border-t border-[var(--rm-border)] bg-[#121417] text-[10px] text-gray-500 flex justify-between items-center">
                    <span>OPERATOR: {userName}</span>
                    <span className="text-emerald-500">READY</span>
                  </div>
                </div>

                {/* Right Pane: Messages Stream & Terminal Composer */}
                <div className="flex-1 flex flex-col bg-[#090a0c] overflow-hidden">
                  {selectedSpace ? (
                    <>
                      {/* Space Header */}
                      <div className="px-4 py-2 border-b border-[var(--rm-border)] bg-[#101214] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-[var(--rm-status)]" />
                          <span className="font-bold text-[var(--rm-foreground)]">
                            {selectedSpace.displayName || selectedSpace.name}
                          </span>
                          <span className="text-[10px] text-gray-400 bg-gray-900 px-1.5 py-0.5 border border-gray-800">
                            ID: {selectedSpace.name.replace('spaces/', '')}
                          </span>
                        </div>
                        <button
                          onClick={() => loadMessages(selectedSpace.name)}
                          disabled={isLoadingMessages}
                          className="text-[11px] text-[var(--rm-headings)] hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                          SYNC
                        </button>
                      </div>

                      {/* Message Log */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {isLoadingMessages && messages.length === 0 ? (
                          <div className="text-center py-8 text-xs text-gray-400 animate-pulse">
                            RECEIVING TELEGRAM TRANSMISSIONS...
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="text-center py-12 text-xs text-gray-500 border border-dashed border-[var(--rm-border)] p-6">
                            NO MESSAGES FOUND IN THIS SPACE BUFFER.
                            <div className="mt-1 text-[11px] text-gray-400">
                              Dispatch a new message below to begin transmission.
                            </div>
                          </div>
                        ) : (
                          messages.map((msg, index) => {
                            const senderName = msg.sender?.displayName || msg.sender?.name || 'USER';
                            const isMe = msg.sender?.displayName === userName || msg.sender?.name?.includes(userEmail || '');
                            const timestamp = msg.createTime
                              ? new Date(msg.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                              : '00:00:00';

                            return (
                              <div
                                key={msg.name || index}
                                className={`p-3 border text-xs flex flex-col gap-1 rounded-sm ${
                                  isMe
                                    ? 'border-[var(--rm-headings)] bg-[#121815] ml-4 sm:ml-12'
                                    : 'border-[var(--rm-border)] bg-[#0f1113] mr-4 sm:mr-12'
                                }`}
                              >
                                <div className="flex items-center justify-between border-b border-white/5 pb-1 text-[10px] text-gray-400">
                                  <span className="font-bold text-[var(--rm-headings)] flex items-center gap-1">
                                    <span>&gt;</span>
                                    <span>{senderName}</span>
                                    {isMe && <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 border border-emerald-800">YOU</span>}
                                  </span>
                                  <span>{timestamp}</span>
                                </div>
                                <div className="text-gray-200 whitespace-pre-wrap break-words leading-relaxed pt-1">
                                  {msg.text || msg.formattedText || '(No plain text payload)'}
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Composer */}
                      <form
                        onSubmit={handleInitiateSend}
                        className="p-3 bg-[#111316] border-t border-[var(--rm-border)] flex items-center gap-2"
                      >
                        <span className="text-[var(--rm-status)] text-sm font-bold pl-1">&gt;</span>
                        <input
                          type="text"
                          value={messageDraft}
                          onChange={(e) => setMessageDraft(e.target.value)}
                          placeholder={`Transmit message to #${selectedSpace.displayName || 'space'}...`}
                          className="flex-1 bg-[#090a0c] border border-[var(--rm-border)] px-3 py-2 text-xs text-[var(--rm-foreground)] placeholder-gray-600 focus:outline-none focus:border-[var(--rm-headings)] font-mono"
                          disabled={isSending}
                        />
                        <button
                          type="submit"
                          disabled={isSending || !messageDraft.trim()}
                          className="px-4 py-2 text-xs font-bold bg-[var(--rm-headings)] text-[var(--rm-heading-text)] hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>TRANSMIT</span>
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-xs text-gray-500">
                      <Radio className="w-8 h-8 text-[var(--rm-status)] mb-3 opacity-60" />
                      <div>SELECT A SPACE FROM THE LEFT TERMINAL PANE TO COMMENCE TRANSMISSION</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="bg-[#121417] border-t border-[var(--rm-border)] px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-gray-500 select-none">
            <div className="flex items-center gap-3">
              <span>HOST: chat.googleapis.com (v1)</span>
              <span>TRANSPORT: HTTPS REST</span>
              <span>CIPHER: TLS 1.3 / AES-256</span>
            </div>
            <div className="flex items-center gap-3">
              {onOpenTerminal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenTerminal();
                  }}
                  className="text-[var(--rm-headings)] hover:underline flex items-center gap-1"
                >
                  <Terminal className="w-3 h-3" />
                  <span>&gt;_ OPEN DOS CONSOLE</span>
                </button>
              )}
              <span>[ESC] TO EXIT</span>
            </div>
          </div>
        </motion.div>

        {/* MANDATORY USER CONFIRMATION MODAL FOR SENDING MESSAGE (WORKSPACE API MUTATING OPERATION) */}
        {pendingMessageToSend && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0f1114] border-2 border-[var(--rm-headings)] max-w-md w-full p-5 shadow-2xl text-[var(--rm-foreground)] font-mono text-xs"
            >
              <div className="flex items-center gap-2 text-[var(--rm-headings)] font-bold text-sm border-b border-[var(--rm-border)] pb-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>CONFIRM WORKSPACE TRANSMISSION</span>
              </div>

              <p className="text-gray-300 mb-3 leading-relaxed">
                You are about to dispatch a message to Google Chat via the Google Workspace API:
              </p>

              <div className="bg-[#08090a] p-3 border border-gray-800 mb-4 space-y-1.5">
                <div>
                  <span className="text-gray-500">TARGET SPACE: </span>
                  <strong className="text-[var(--rm-headings)]">
                    {selectedSpace?.displayName || selectedSpace?.name}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">SENDER ACCOUNT: </span>
                  <span className="text-gray-300">{userEmail}</span>
                </div>
                <div>
                  <span className="text-gray-500">PAYLOAD TEXT: </span>
                  <p className="text-emerald-300 bg-black/60 p-2 mt-1 border border-emerald-950 font-mono text-[11px] break-words">
                    "{pendingMessageToSend}"
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-amber-300/80 mb-4">
                * Explicit confirmation required by Google Workspace security policies prior to sending data on your behalf.
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    retroAudio.playKeyClick();
                    setPendingMessageToSend(null);
                  }}
                  className="px-3 py-1.5 border border-gray-700 hover:bg-gray-800 text-gray-300 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSend}
                  className="px-4 py-1.5 bg-[var(--rm-headings)] text-[var(--rm-heading-text)] font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>CONFIRM & SEND</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL FOR CREATING A NEW SPACE */}
        {showCreateSpace && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0f1114] border-2 border-emerald-600 max-w-md w-full p-5 shadow-2xl text-[var(--rm-foreground)] font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-[var(--rm-border)] pb-2 mb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Plus className="w-4 h-4" />
                  <span>CREATE GOOGLE CHAT SPACE</span>
                </div>
                <button
                  onClick={() => setShowCreateSpace(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSpaceSubmit}>
                <p className="text-gray-300 mb-3 leading-relaxed">
                  Provision a brand-new space in your Google Workspace / Google Chat directory:
                </p>

                <div className="mb-4">
                  <label className="block text-[11px] text-gray-400 mb-1">
                    SPACE DISPLAY NAME:
                  </label>
                  <input
                    type="text"
                    required
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    placeholder="e.g. Retro Computing Guild"
                    className="w-full bg-[#08090a] border border-[var(--rm-border)] px-3 py-2 text-xs text-[var(--rm-foreground)] focus:outline-none focus:border-emerald-500 font-mono"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateSpace(false)}
                    className="px-3 py-1.5 border border-gray-700 hover:bg-gray-800 text-gray-300 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingSpace || !newSpaceName.trim()}
                    className="px-4 py-1.5 bg-emerald-600 text-white font-bold hover:bg-emerald-500 disabled:opacity-40 transition-all flex items-center gap-1.5"
                  >
                    {isCreatingSpace ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>CREATE SPACE</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
