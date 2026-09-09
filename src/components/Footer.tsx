import React from 'react';
import { ArrowUp, Wrench } from 'lucide-react';
import { ProfileCredentialCards } from './ProfileCredentialCards';
import { PERSONAL_INFO } from '../data/portfolioData';
import { retroAudio } from '../utils/audio';

interface FooterProps {
  onOpenGpg: () => void;
  onOpenRefinement?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGpg, onOpenRefinement }) => {
  const scrollToTop = () => {
    retroAudio.playKeyclick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer-credentials" className="mt-16 border-t-2 border-[var(--border-strong)] bg-[var(--bg-secondary)] font-mono text-xs text-[var(--text-secondary)]">
      
      {/* Signature Rainbow Border */}
      <div className="rainbow-border-top h-[3px] w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/resonant-mirror-crest.png" alt="" className="w-8 h-8 object-contain" />
            <div>
              <h2 className="font-bold text-[var(--text-primary)] text-sm tracking-wider">PROFILES &amp; CREDENTIALS</h2>
              <p className="text-[11px] text-[var(--text-secondary)]">{PERSONAL_INFO.name} • {PERSONAL_INFO.alias} • {PERSONAL_INFO.brandName}</p>
            </div>
          </div>
          <ProfileCredentialCards onOpenGpg={onOpenGpg} />
          <p className="text-[10px] break-words text-[var(--text-secondary)]">
            GPG FINGERPRINT: {PERSONAL_INFO.gpgFingerprint}
          </p>
        </div>

        {/* Bottom Bar: Copyright & Hardware Diagnostics */}
        <div className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-muted)]">
          <div className="text-center sm:text-left space-y-1">
            <div>
              &copy; {new Date().getFullYear()} {PERSONAL_INFO.name} ({PERSONAL_INFO.brandName}). All rights reserved.
            </div>
            <div className="text-[10px]">
              TYPOGRAPHY: <a href="https://int10h.org/oldschool-pc-fonts/fontlist/font?att_pc6300" target="_blank" rel="noopener noreferrer" className="hover:underline text-[var(--text-secondary)]">Web AT&amp;T PC6300</a> by <a href="https://github.com/viler-int10h" target="_blank" rel="noopener noreferrer" className="hover:underline text-[var(--text-secondary)]">VileR</a> (int10h.org) • CC BY-SA 4.0
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRefinement && (
              <button
                onClick={() => {
                  retroAudio.playKeyclick();
                  onOpenRefinement();
                }}
                className="retro-btn px-3 py-1.5 flex items-center gap-1.5 cursor-pointer font-bold bg-[var(--rm-status)]/20 text-[var(--rm-status)] border-[var(--rm-status)] hover:bg-[var(--rm-status)] hover:text-black transition-colors"
                aria-label="Enter refinement session"
                title="Sign in to propose a change and prepare a brief for your chosen assistant"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>[ MAKE REFINEMENT ]</span>
              </button>
            )}

            <button
              onClick={scrollToTop}
              className="retro-btn px-3 py-1.5 flex items-center gap-1.5 cursor-pointer font-bold"
              aria-label="Scroll to top of page"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>[ RETURN TO APEX ]</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
