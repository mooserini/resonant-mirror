import React, { useState } from 'react';
import { Key, X, Copy, Download, CheckCircle, Shield } from 'lucide-react';
import { PERSONAL_INFO, GPG_ARMORED_PUBLIC_KEY } from '../data/portfolioData';
import { retroAudio } from '../utils/audio';

interface GpgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GpgModal: React.FC<GpgModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    retroAudio.playKeyclick();
    navigator.clipboard.writeText(GPG_ARMORED_PUBLIC_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    retroAudio.playKeyclick();
    const blob = new Blob([GPG_ARMORED_PUBLIC_KEY], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thomas-kenny-${PERSONAL_INFO.gpgKeyId.replace(/\s+/g, '')}.asc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-mono text-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gpg-modal-title"
    >
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-strong)] w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Rainbow Accent */}
        <div className="rainbow-border-top h-[3px] w-full" />

        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <Key className="w-4 h-4 text-[var(--rm-headings)]" />
            <span id="gpg-modal-title">GPG ARMORED PUBLIC KEY DOSSIER</span>
          </div>
          <button
            onClick={() => {
              retroAudio.playKeyclick();
              onClose();
            }}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Close GPG Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Metadata Block */}
          <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1.5 text-xs text-[var(--text-secondary)]">
            <div>
              <span className="text-[var(--text-muted)]">UID:</span>{' '}
              <span className="font-bold text-[var(--text-primary)]">{PERSONAL_INFO.name} &lt;{PERSONAL_INFO.email}&gt;</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">KEY ID:</span>{' '}
              <span className="font-bold text-[var(--rm-headings)]">{PERSONAL_INFO.gpgKeyId}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">FINGERPRINT:</span>{' '}
              <span className="font-bold text-[var(--text-primary)] break-all">{PERSONAL_INFO.gpgFingerprint}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">CAPABILITIES:</span>{' '}
              <span>Sign, Encrypt, Certify, Authenticate [SC]</span>
            </div>
          </div>

          {/* ASCII Key Block */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)]">
              <span>ASCII ARMORED BLOCK:</span>
              <span>FORMAT: RFC 4880</span>
            </div>
            <pre className="p-3 bg-[var(--terminal-bg)] text-[var(--terminal-text)] font-mono text-[11px] border border-[var(--border-strong)] overflow-x-auto select-all leading-tight">
              {GPG_ARMORED_PUBLIC_KEY}
            </pre>
          </div>

          {/* Verification Command Instruction */}
          <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[11px] space-y-1">
            <div className="font-bold text-[var(--text-primary)]">LOCAL KEY INSPECTION:</div>
            <code className="text-[var(--rm-accent-bright)] block bg-[var(--code-bg)] p-1.5 border border-[var(--border-color)]">
              gpg --show-keys thomas-kenny-{PERSONAL_INFO.gpgKeyId.replace(/\s+/g, '')}.asc
            </code>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-wrap justify-between items-center gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="retro-btn px-3 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'KEY COPIED!' : 'COPY TO CLIPBOARD'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="retro-btn px-3 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD .ASC</span>
            </button>
          </div>

          <button
            onClick={() => {
              retroAudio.playKeyclick();
              onClose();
            }}
            className="retro-btn px-4 py-1.5 font-bold cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
