import React from 'react';
import { 
  Github, 
  Linkedin, 
  BookOpen, 
  Key, 
  Mail, 
  ArrowUp, 
  ShieldCheck, 
  Rss,
  ExternalLink,
  Terminal,
  Wrench
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { retroAudio } from '../utils/audio';

interface FooterProps {
  onOpenGpg: () => void;
  onOpenBlog: () => void;
  onOpenRefinement?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGpg, onOpenBlog, onOpenRefinement }) => {
  const scrollToTop = () => {
    retroAudio.playKeyclick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer-credentials" className="mt-16 border-t-2 border-[var(--border-strong)] bg-[var(--bg-secondary)] font-mono text-xs text-[var(--text-secondary)]">
      
      {/* Signature Rainbow Border */}
      <div className="rainbow-border-top h-[3px] w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Philosophy */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <img
                src="/resonant-mirror-crest.png"
                alt="Resonant Mirror"
                className="w-6 h-6 object-contain"
              />
              <span className="font-bold text-[var(--text-primary)] text-sm tracking-wider">
                THE RESONANT MIRROR
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              Archival systems architecture, agentic memory lineage, and authentic CGA bitstream typography.
            </p>
            <div className="text-[10px] text-[var(--rm-status)]">
              NODE: HERMES-09 // ONLINE
            </div>
          </div>

          {/* Column 2: Cryptographic Identity & GPG */}
          <div className="space-y-2">
            <div className="font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[var(--rm-headings)]" />
              <span>GPG CRYPTOGRAPHIC KEY</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div>
                <span className="text-[var(--text-muted)]">KEY ID:</span>{' '}
                <span className="font-bold text-[var(--text-primary)]">{PERSONAL_INFO.gpgKeyId}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">FINGERPRINT:</span>
                <span className="text-[10px] break-all text-[var(--text-primary)] font-bold">
                  {PERSONAL_INFO.gpgFingerprint}
                </span>
              </div>
              <button
                onClick={() => {
                  retroAudio.playKeyclick();
                  onOpenGpg();
                }}
                className="mt-1 retro-btn px-2 py-1 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>[ INSPECT &amp; COPY PUBLIC KEY ]</span>
              </button>
            </div>
          </div>

          {/* Column 3: Academic & Scholarly ORCID */}
          <div className="space-y-2">
            <div className="font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--rm-status)]" />
              <span>SCHOLARLY ORCID IDENTITY</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="text-[var(--text-muted)]">REGISTERED RESEARCHER:</div>
              <a
                href={PERSONAL_INFO.orcidUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => retroAudio.playKeyclick()}
                className="text-[var(--rm-accent-bright)] font-bold hover:underline flex items-center gap-1 text-xs"
              >
                <span>{PERSONAL_INFO.orcid}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-[10px] text-[var(--text-muted)] pt-1">
                Persistent digital identifier for peer-reviewed state continuity &amp; publications.
              </p>
            </div>
          </div>

          {/* Column 4: Personal Blog & Professional Profiles */}
          <div className="space-y-2">
            <div className="font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[var(--rm-emphasis)]" />
              <span>BLOG &amp; PROFILES</span>
            </div>
            
            <div className="space-y-1.5 text-[11px]">
              <div>
                <button
                  onClick={() => {
                    retroAudio.playKeyclick();
                    onOpenBlog();
                  }}
                  className="text-[var(--text-primary)] hover:text-[var(--rm-emphasis)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <span>&gt; READ BLOG DISPATCHES</span>
                </button>
              </div>

              <div>
                <a
                  href={PERSONAL_INFO.huggingFaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => retroAudio.playKeyclick()}
                  className="text-[var(--text-primary)] hover:text-[var(--rm-accent-bright)] hover:underline flex items-center gap-1 font-bold"
                  title="Hugging Face Public Model & Weight Hub"
                >
                  <span>&gt; HUGGING FACE (@{PERSONAL_INFO.huggingFaceHandle})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <a
                  href={PERSONAL_INFO.blogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-secondary)] hover:text-[var(--rm-accent-bright)] hover:underline flex items-center gap-1"
                >
                  <span>&gt; {PERSONAL_INFO.blogUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Social Icon Links */}
              <div className="pt-2 flex items-center gap-2.5">
                <a
                  href={PERSONAL_INFO.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => retroAudio.playKeyclick()}
                  className="p-1.5 border border-[var(--border-strong)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors cursor-pointer"
                  title="GitHub Profile (@mooserini)"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>

                <a
                  href={PERSONAL_INFO.huggingFaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => retroAudio.playKeyclick()}
                  className="p-1.5 border border-[var(--rm-accent-bright)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--rm-accent-bright)] transition-colors cursor-pointer font-bold text-xs"
                  title="Hugging Face Models & Checkpoints (@mooserini)"
                  aria-label="Hugging Face Profile"
                >
                  <span>🤗</span>
                </a>

                <a
                  href={PERSONAL_INFO.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => retroAudio.playKeyclick()}
                  className="p-1.5 border border-[var(--border-strong)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors cursor-pointer"
                  title="LinkedIn Profile"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>

                <a
                  href={`mailto:${PERSONAL_INFO.email}`}
                  onClick={() => retroAudio.playKeyclick()}
                  className="p-1.5 border border-[var(--border-strong)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors cursor-pointer"
                  title={`Direct Email (${PERSONAL_INFO.email})`}
                  aria-label="Direct Email"
                >
                  <Mail className="w-4 h-4" />
                </a>

                <button
                  onClick={() => {
                    retroAudio.playKeyclick();
                    onOpenBlog();
                  }}
                  className="p-1.5 border border-[var(--border-strong)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors cursor-pointer"
                  title="RSS Dispatches Reader"
                  aria-label="RSS Reader"
                >
                  <Rss className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Hardware Diagnostics */}
        <div className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-muted)]">
          <div className="text-center sm:text-left space-y-1">
            <div>
              &copy; {new Date().getFullYear()} {PERSONAL_INFO.name} ({PERSONAL_INFO.brandName}). All rights reserved.
            </div>
            <div className="text-[10px]">
              TYPOGRAPHY: <a href="https://int10h.org/oldschool-pc-fonts/fontlist/font?att_pc6300" target="_blank" rel="noopener noreferrer" className="hover:underline text-[var(--text-secondary)]">Ac437 AT&amp;T PC6300 CGA</a> (int10h.org) • FONT EMBEDDED
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
                title="Enter operator refinement loop to stage revisions or generate AI Studio prompts"
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
