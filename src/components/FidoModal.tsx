import React, { useState } from 'react';
import { 
  KeyRound, 
  Fingerprint, 
  ShieldCheck, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  LogOut, 
  RefreshCw 
} from 'lucide-react';
import { FidoSession } from '../types';
import { 
  isWebAuthnAvailable, 
  performFidoRegistration, 
  performFidoAuthentication, 
  clearFidoSession 
} from '../utils/fidoAuth';
import { retroAudio } from '../utils/audio';

interface FidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: FidoSession | null;
  onSessionChange: (session: FidoSession | null) => void;
}

export const FidoModal: React.FC<FidoModalProps> = ({
  isOpen,
  onClose,
  session,
  onSessionChange,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'register' | 'auth'>('status');
  const [userName, setUserName] = useState('architect.guest');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const webAuthnSupported = isWebAuthnAvailable();

  if (!isOpen) return null;

  const handleRegister = async () => {
    retroAudio.playKeyclick();
    setLoading(true);
    setFeedback('Requesting WebAuthn Passkey creation (Touch biometric or insert YubiKey)...');

    try {
      const newSession = await performFidoRegistration(userName.trim() || 'architect.guest');
      onSessionChange(newSession);
      retroAudio.playFidoSuccess();
      setFeedback(`FIDO2 Passkey successfully registered! Attestation ID: ${newSession.credentialId}`);
      setActiveTab('status');
    } catch (err: unknown) {
      setFeedback(`Registration failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    retroAudio.playKeyclick();
    setLoading(true);
    setFeedback('Authenticating credential assertion via WebAuthn challenge...');

    try {
      const authSession = await performFidoAuthentication(userName.trim() || 'architect.guest');
      onSessionChange(authSession);
      retroAudio.playFidoSuccess();
      setFeedback(`Authentication successful! Session verified under: ${authSession.credentialId}`);
      setActiveTab('status');
    } catch (err: unknown) {
      setFeedback(`Authentication assertion failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    retroAudio.playKeyclick();
    clearFidoSession();
    onSessionChange(null);
    setFeedback('FIDO2 authenticated session terminated. Cryptographic keys flushed.');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fido-modal-title"
    >
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-strong)] w-full max-w-lg shadow-2xl relative flex flex-col font-mono text-xs sm:text-sm">
        
        {/* Top Rainbow Bar */}
        <div className="rainbow-border-top h-[3px] w-full" />

        {/* Modal Header */}
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-between items-center">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
            <KeyRound className="w-5 h-5 text-[var(--rm-status)]" />
            <span id="fido-modal-title">FIDO2 / WEBAUTHN SECURITY VAULT</span>
          </div>
          <button
            onClick={() => {
              retroAudio.playKeyclick();
              onClose();
            }}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <button
            onClick={() => {
              retroAudio.playKeyclick();
              setActiveTab('status');
            }}
            className={`flex-1 py-2 text-center text-xs font-bold border-r border-[var(--border-color)] cursor-pointer ${
              activeTab === 'status'
                ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-b-2 border-b-[var(--rm-status)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            [ SESSION STATUS ]
          </button>
          <button
            onClick={() => {
              retroAudio.playKeyclick();
              setActiveTab('register');
            }}
            className={`flex-1 py-2 text-center text-xs font-bold border-r border-[var(--border-color)] cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-b-2 border-b-[var(--rm-status)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            [ REGISTER PASSKEY ]
          </button>
          <button
            onClick={() => {
              retroAudio.playKeyclick();
              setActiveTab('auth');
            }}
            className={`flex-1 py-2 text-center text-xs font-bold cursor-pointer ${
              activeTab === 'auth'
                ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-b-2 border-b-[var(--rm-status)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            [ ASSERT PASSKEY ]
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Environment Capability Chip */}
          <div className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--rm-status)]" />
              <span className="text-[var(--text-secondary)]">WEBAUTHN API SUPPORT:</span>
            </div>
            <span className={`font-bold ${webAuthnSupported ? 'text-[var(--rm-status)]' : 'text-amber-500'}`}>
              {webAuthnSupported ? 'HARDWARE SUPPORTED' : 'EMULATOR PROTOCOL'}
            </span>
          </div>

          {/* Tab 1: Current Session Status */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {session?.isAuthenticated ? (
                <div className="p-4 border-2 border-[var(--rm-status)] bg-[var(--rm-status)]/10 space-y-3">
                  <div className="flex items-center gap-2 text-[var(--rm-status)] font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" />
                    <span>SESSION CRYPTOGRAPHICALLY VERIFIED</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-2">
                    <div>
                      <span className="text-[var(--text-muted)]">USER HANDLE:</span>{' '}
                      <span className="font-bold text-[var(--text-primary)]">{session.userHandle}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">CREDENTIAL ID:</span>{' '}
                      <span className="font-mono text-[11px] text-[var(--rm-accent-bright)]">{session.credentialId}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">ALGORITHM:</span>{' '}
                      <span>{session.algorithm}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">SECURITY LEVEL:</span>{' '}
                      <span className="text-[var(--rm-status)] font-bold">{session.securityLevel}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">ATTESTATION TIME:</span>{' '}
                      <span>{session.timestamp ? new Date(session.timestamp).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 retro-btn py-2 text-xs font-bold text-red-500 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>[ TERMINATE FIDO2 SESSION ]</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 border border-[var(--border-strong)] bg-[var(--bg-secondary)] text-center space-y-3">
                  <Fingerprint className="w-10 h-10 mx-auto text-[var(--text-muted)]" />
                  <div className="font-bold text-[var(--text-primary)]">
                    NO ACTIVE FIDO2 AUTHENTICATION SESSION
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Register a platform passkey (Touch ID, Windows Hello, YubiKey) or assert an existing credential to establish a verified hardware session.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('register')}
                      className="flex-1 retro-btn py-2 font-bold cursor-pointer"
                    >
                      REGISTER PASSKEY
                    </button>
                    <button
                      onClick={() => setActiveTab('auth')}
                      className="flex-1 retro-btn py-2 font-bold cursor-pointer"
                    >
                      ASSERT PASSKEY
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Register Passkey */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)] font-bold block">
                  REGISTER CREDENTIAL USERNAME:
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. thomas.guest"
                  className="w-full p-2 border border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--rm-status)]"
                />
              </div>

              <p className="text-xs text-[var(--text-secondary)]">
                Will invoke the browser’s WebAuthn client (`navigator.credentials.create`) targeting an ES256 hardware passkey with direct attestation.
              </p>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full retro-btn py-2.5 font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4 text-[var(--rm-status)]" />}
                <span>{loading ? 'WAITING FOR HARDWARE TOKEN...' : '[ REGISTER FIDO2 PASSKEY ]'}</span>
              </button>
            </div>
          )}

          {/* Tab 3: Assert Passkey */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)] font-bold block">
                  ASSERT CREDENTIAL USERNAME:
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. thomas.guest"
                  className="w-full p-2 border border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--rm-status)]"
                />
              </div>

              <p className="text-xs text-[var(--text-secondary)]">
                Will verify biometric or security key assertion (`navigator.credentials.get`) with cryptographic challenge verification.
              </p>

              <button
                onClick={handleAuthenticate}
                disabled={loading}
                className="w-full retro-btn py-2.5 font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4 text-[var(--rm-status)]" />}
                <span>{loading ? 'ASSERTING CHALLENGE...' : '[ ASSERT FIDO2 CREDENTIAL ]'}</span>
              </button>
            </div>
          )}

          {/* Status Feedback Message */}
          {feedback && (
            <div className="p-3 bg-[var(--terminal-bg)] text-[var(--terminal-text)] font-mono text-xs border border-[var(--border-strong)] leading-relaxed">
              <div className="text-[10px] text-gray-400 pb-1 mb-1 border-b border-gray-700">
                FIDO2 SUBSYSTEM LOG:
              </div>
              <p>{feedback}</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-between items-center text-[10px] text-[var(--text-muted)]">
          <span>CTAP2 / FIDO2 PROTOCOL SPECIFICATION</span>
          <button
            onClick={() => {
              retroAudio.playKeyclick();
              onClose();
            }}
            className="retro-btn px-3 py-1 cursor-pointer font-bold"
          >
            DISMISS
          </button>
        </div>

      </div>
    </div>
  );
};
