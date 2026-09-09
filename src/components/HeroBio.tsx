import React from 'react';
import { Terminal, Shield, ExternalLink, Mail, Key, Wrench, Bot } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { retroAudio } from '../utils/audio';
import { Logo } from './Logo';
import { ProfileCredentialCards } from './ProfileCredentialCards';

interface HeroBioProps {
  theme: 'light' | 'dark';
  onOpenGpg: () => void;
  onOpenFido: () => void;
  onOpenRefinement?: () => void;
}

export const HeroBio: React.FC<HeroBioProps> = ({ theme, onOpenGpg, onOpenRefinement }) => {
  return (
    <section id="biography" className="py-8 sm:py-12">
      {/* 80s ASCII Art Representation of The Resonant Mirror */}
      <Logo theme={theme} />

      {/* Archival Dossier Paper Card */}
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-strong)] shadow-xl relative overflow-hidden">
        
        {/* Top Rainbow Accent Line from user's signature styling */}
        <div className="rainbow-border-top h-[3px] w-full" />

        {/* Document Header (Mirrors Markdown to PDF Header) */}
        <div className="p-6 sm:p-8 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Public profile portrait, kept in sync with GitHub */}
            <div className="flex-shrink-0 relative group">
              <div className="w-28 h-28 sm:w-36 sm:h-36 p-2 bg-[var(--bg-primary)] border-2 border-[var(--border-strong)] flex items-center justify-center shadow-inner">
                <img
                  src={PERSONAL_INFO.avatarUrl}
                  alt={`${PERSONAL_INFO.name}'s avatar`}
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="block text-center text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase">
                @{PERSONAL_INFO.githubHandle}
              </span>
            </div>

            {/* Document Title & Subject Dossier */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 text-[11px] border border-[var(--border-strong)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-mono">
                <span>SECURITY LEVEL: VERIFIED SOVEREIGN</span>
                <span>•</span>
                <span className="text-[var(--rm-status)]">STATUS: ACTIVE</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                {PERSONAL_INFO.name}
              </h1>

              <div className="text-sm sm:text-base text-[var(--rm-identity-accent)] font-semibold tracking-wide">
                <span>ALIASES: {PERSONAL_INFO.alias}</span>
                <span className="mx-2">•</span>
                <span>BRAND: {PERSONAL_INFO.brandName}</span>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
                {PERSONAL_INFO.role}
              </p>

              {/* Sub-header Rainbow Border Accent */}
              <div className="rainbow-border-subtle h-[2px] w-full max-w-md my-3" />

              <ProfileCredentialCards onOpenGpg={onOpenGpg} />

              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a
                  href="/red-door"
                  onClick={() => retroAudio.playKeyclick()}
                  className="retro-btn px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                  id="hero-play-red-door"
                  aria-describedby="red-door-entry-hint"
                >
                  <Terminal className="w-4 h-4 text-[var(--rm-status)]" aria-hidden="true" />
                  <span>[ PLAY RED DOOR BBS ]</span>
                </a>
                <p id="red-door-entry-hint" className="text-xs text-[var(--text-secondary)]">
                  At the terminal, type <code>reddoor</code> to enter the game.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Dossier Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="border-l-4 border-[var(--border-strong)] pl-4 py-1 bg-[var(--bg-secondary)]/50">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-wide">
              SECTION 01: ARCHITECTURAL MANDATE &amp; BACKGROUND
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              RECORD HASH: 0x9025_RES_MIRROR_CONTINUITY
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm md:text-base leading-relaxed text-[var(--text-secondary)] font-mono">
            {PERSONAL_INFO.bioParagraphs.map((paragraph, idx) => (
              <p key={idx} className="indent-4 sm:indent-6">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Retro Callout Banner */}
          <div className="p-4 border-2 border-[var(--border-strong)] bg-[var(--bg-secondary)] relative">
            <div className="flex items-start gap-3">
              <Terminal className="w-5 h-5 text-[var(--rm-status)] flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs font-mono">
                <div className="text-[var(--text-primary)] font-bold">
                  AUTONOMIC LINEAGE NOTE:
                </div>
                <p className="text-[var(--text-secondary)]">
                  &ldquo;Systems must remain verifiable across cold boots. The beauty of the CGA-era architecture was strict determinism: 16 colors, fixed clock frequencies, and bounded memory buffers. We bring that exact architectural discipline to modern autonomous agent clusters.&rdquo;
                </p>
                <div className="text-[var(--text-muted)] pt-1">
                  — Thomas Kenny (mooserini), Resonant Mirror Dispatch #26
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="#projects"
              onClick={() => retroAudio.playKeyclick()}
              className="retro-btn px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              id="hero-explore-projects-btn"
            >
              <span>[ EXPLORE ARCHIVED PROJECTS ]</span>
            </a>

            <a
              href={PERSONAL_INFO.huggingFaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => retroAudio.playKeyclick()}
              className="retro-btn px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer border-[var(--rm-accent-bright)] text-[var(--rm-accent-bright)] hover:bg-[var(--rm-accent-bright)]/15"
              id="hero-huggingface-btn"
              title={`View ${PERSONAL_INFO.name}'s public Hugging Face profile (@${PERSONAL_INFO.huggingFaceHandle})`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>[ HUGGING FACE (@{PERSONAL_INFO.huggingFaceHandle}) ]</span>
            </a>

            <button
              onClick={() => {
                retroAudio.playKeyclick();
                onOpenGpg();
              }}
              className="retro-btn px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              id="hero-inspect-gpg-btn"
            >
              <Key className="w-4 h-4 text-[var(--rm-headings)]" />
              <span>[ INSPECT GPG PUBLIC KEY ]</span>
            </button>

            {onOpenRefinement && (
              <button
                onClick={() => {
                  retroAudio.playKeyclick();
                  onOpenRefinement();
                }}
                className="retro-btn px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer bg-[var(--rm-status)] text-black hover:opacity-90 shadow-md"
                id="hero-make-refinement-btn"
                title="Notice something to add? Enter authenticated refinement loop to iterate"
              >
                <Wrench className="w-4 h-4 text-black" />
                <span>[ MAKE REFINEMENT ]</span>
              </button>
            )}

            <a
              href="#contact"
              onClick={() => retroAudio.playKeyclick()}
              className="retro-btn px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              id="hero-transmit-dispatch-btn"
            >
              <Mail className="w-4 h-4 text-[var(--rm-accent-bright)]" />
              <span>[ TRANSMIT DISPATCH ]</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
