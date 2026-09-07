import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  KeyRound, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Tv, 
  Menu, 
  X,
  ShieldCheck,
  Terminal,
  Wrench,
  Radio,
  WifiOff,
  MessageSquare
} from 'lucide-react';
import { FidoSession } from '../types';
import { retroAudio } from '../utils/audio';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  scanlines: boolean;
  onToggleScanlines: () => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
  onReboot: () => void;
  onOpenFido: () => void;
  onOpenTerminal: () => void;
  onOpenRefinement?: () => void;
  onOpenModemDiagnostics?: () => void;
  onOpenChat?: () => void;
  isOffline?: boolean;
  fidoSession: FidoSession | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  scanlines,
  onToggleScanlines,
  audioMuted,
  onToggleAudio,
  onReboot,
  onOpenFido,
  onOpenTerminal,
  onOpenRefinement,
  onOpenModemDiagnostics,
  onOpenChat,
  isOffline = false,
  fidoSession,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'DOSSIER', href: '#biography' },
    { label: 'PROJECTS', href: '#projects' },
    { label: 'SKILLS', href: '#skills' },
    { label: 'CONTACT', href: '#contact' },
    { label: 'KEY RING', href: '#footer-credentials' },
  ];

  const handleNavClick = () => {
    retroAudio.playKeyclick();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-card)] border-b-2 border-[var(--border-strong)] backdrop-blur-md transition-colors">
      {/* Top Rainbow Accent Line from user's signature styling */}
      <div className="rainbow-border-top h-[3px] w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo & Brand Identity */}
          <a 
            href="#" 
            onClick={handleNavClick}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            id="nav-brand-link"
          >
            <img 
              src="/resonant-mirror-crest.png" 
              alt="Resonant Mirror Crest" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-wider text-[var(--text-primary)]">
                THE RESONANT MIRROR
              </span>
              <span className="text-[10px] text-[var(--text-muted)] tracking-widest uppercase">
                THOMAS KENNY // AT&amp;T PC6300
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs tracking-wider" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={handleNavClick}
                className="text-[var(--text-secondary)] hover:text-[var(--rm-accent-bright)] font-semibold transition-colors hover:underline decoration-2 underline-offset-4"
                id={`nav-link-${link.label.toLowerCase()}`}
              >
                [{link.label}]
              </a>
            ))}
          </nav>

          {/* Action Toolbar */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Make Refinement Button */}
            {onOpenRefinement && (
              <button
                id="nav-refine-btn"
                onClick={() => {
                  retroAudio.playKeyclick();
                  onOpenRefinement();
                }}
                className="px-2.5 py-1 text-xs border border-[var(--rm-status)] bg-[var(--rm-status)]/15 hover:bg-[var(--rm-status)] hover:text-black text-[var(--rm-status)] flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
                title="Enter operator session to stage refinements and generate AI Studio iteration prompts"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>REFINE</span>
              </button>
            )}

            {/* FIDO Session Button */}
            <button
              id="nav-fido-btn"
              onClick={() => {
                retroAudio.playKeyclick();
                onOpenFido();
              }}
              className={`px-2.5 py-1 text-xs border flex items-center gap-1.5 transition-all cursor-pointer ${
                fidoSession?.isAuthenticated
                  ? 'border-[#00aa00] bg-[#00aa00]/15 text-[#00aa00] font-bold'
                  : 'border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
              title={fidoSession?.isAuthenticated ? 'FIDO2 Session Verified' : 'Authenticate with FIDO2 / WebAuthn Passkey'}
            >
              {fidoSession?.isAuthenticated ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00aa00]" />
                  <span>FIDO2: ACTIVE</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>FIDO2 AUTH</span>
                </>
              )}
            </button>

            {/* Modem / Telemetry Status Button */}
            {onOpenModemDiagnostics && (
              <button
                id="nav-modem-btn"
                onClick={() => {
                  retroAudio.playKeyclick();
                  onOpenModemDiagnostics();
                }}
                className={`px-2 py-1 text-xs border flex items-center gap-1.5 font-bold cursor-pointer transition-colors ${
                  isOffline
                    ? 'border-[#ff5555] bg-[#ff5555]/20 text-[#ff5555] animate-pulse'
                    : 'border-[var(--border-strong)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                }`}
                title={isOffline ? 'Connection Error: Check Modem (Click to run retro diagnostic code generator)' : 'Check Modem / Telemetry Subsystem'}
                aria-label="Modem Subsystem Status"
              >
                {isOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-[#ff5555]" />
                    <span>MODEM: ERR</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5 text-[var(--rm-status)]" />
                    <span className="hidden xl:inline">MODEM</span>
                  </>
                )}
              </button>
            )}

            {/* Google Chat Client Interface Button */}
            {onOpenChat && (
              <button
                id="nav-chat-btn"
                onClick={() => {
                  retroAudio.playKeyclick();
                  onOpenChat();
                }}
                className="px-2 py-1 text-xs border border-[var(--rm-headings)] bg-[var(--rm-headings)]/15 hover:bg-[var(--rm-headings)]/25 text-[var(--rm-headings)] flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
                title="Open Google Chat Subsystem (Spaces & Dispatches)"
                aria-label="Open Google Chat"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CHAT</span>
              </button>
            )}

            {/* 80s DOS Prompt Console Button */}
            <button
              id="nav-terminal-btn"
              onClick={() => {
                retroAudio.playKeyclick();
                onOpenTerminal();
              }}
              className="px-2 py-1 text-xs border border-[var(--border-strong)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--rm-status)] flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
              title="Open Hidden 80s DOS Terminal Console (~ or `)"
              aria-label="Open 80s DOS Terminal"
            >
              <Terminal className="w-3.5 h-3.5 text-[var(--rm-status)]" />
              <span>DOS (~)</span>
            </button>

            {/* Dark / Light Scheme Flip */}
            <button
              id="nav-theme-toggle-btn"
              onClick={() => {
                retroAudio.playKeyclick();
                onToggleTheme();
              }}
              className="p-1.5 border border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode (Resonant Paper)' : 'Switch to Dark Mode (Obsidian CRT Phosphor)'}
              aria-label="Toggle Color Scheme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[var(--rm-headings)]" />}
            </button>

            {/* CRT Scanline Filter Toggle */}
            <button
              id="nav-scanlines-btn"
              onClick={() => {
                retroAudio.playKeyclick();
                onToggleScanlines();
              }}
              className={`p-1.5 border transition-colors cursor-pointer ${
                scanlines
                  ? 'border-[var(--rm-accent-bright)] bg-[var(--rm-accent-bright)]/20 text-[var(--rm-accent-bright)]'
                  : 'border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'
              }`}
              title="Toggle CRT Scanline Overlay"
              aria-label="Toggle Scanlines"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Retro PC Speaker Sound Toggle */}
            <button
              id="nav-audio-btn"
              onClick={onToggleAudio}
              className={`p-1.5 border transition-colors cursor-pointer ${
                !audioMuted
                  ? 'border-[var(--rm-status)] bg-[var(--rm-status)]/20 text-[var(--rm-status)]'
                  : 'border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'
              }`}
              title={audioMuted ? 'Unmute PC Speaker Beeps' : 'Mute PC Speaker Beeps'}
              aria-label="Toggle PC Speaker Sound"
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[var(--rm-status)]" />}
            </button>

            {/* Replay Boot Sequence */}
            <button
              id="nav-reboot-btn"
              onClick={() => {
                retroAudio.playKeyclick();
                onReboot();
              }}
              className="p-1.5 border border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
              title="Replay PC6300 BIOS Boot Sequence"
              aria-label="Reboot System"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              id="nav-theme-mobile-btn"
              onClick={onToggleTheme}
              className="p-1.5 border border-[var(--border-strong)] text-[var(--text-primary)]"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 border border-[var(--border-strong)] text-[var(--text-primary)] cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[var(--border-color)] py-3 px-2 space-y-2 bg-[var(--bg-card)]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={handleNavClick}
                className="block px-3 py-2 text-sm text-[var(--text-primary)] border border-transparent hover:border-[var(--border-strong)] hover:bg-[var(--bg-secondary)] font-semibold"
              >
                &gt; {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap gap-2">
              {onOpenRefinement && (
                <button
                  onClick={() => {
                    onOpenRefinement();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs border border-[var(--rm-status)] bg-[var(--rm-status)]/20 flex items-center justify-center gap-2 text-[var(--rm-status)] font-bold cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-[var(--rm-status)]" />
                  <span>MAKE REFINEMENT / ITERATE</span>
                </button>
              )}
              {onOpenModemDiagnostics && (
                <button
                  onClick={() => {
                    onOpenModemDiagnostics();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs border flex items-center justify-center gap-2 font-bold cursor-pointer ${
                    isOffline
                      ? 'border-[#ff5555] bg-[#ff5555]/20 text-[#ff5555] animate-pulse'
                      : 'border-[var(--border-strong)] text-[var(--text-secondary)] bg-[var(--bg-secondary)]'
                  }`}
                >
                  {isOffline ? <WifiOff className="w-4 h-4 text-[#ff5555]" /> : <Radio className="w-4 h-4 text-[var(--rm-status)]" />}
                  <span>{isOffline ? 'MODEM ERROR: RUN DIAGNOSTICS' : 'CHECK MODEM / TELEMETRY'}</span>
                </button>
              )}
              {onOpenChat && (
                <button
                  onClick={() => {
                    onOpenChat();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs border border-[var(--rm-headings)] bg-[var(--rm-headings)]/20 flex items-center justify-center gap-2 text-[var(--rm-headings)] font-bold cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[var(--rm-headings)]" />
                  <span>GOOGLE CHAT SUBSYSTEM</span>
                </button>
              )}
              <button
                onClick={() => {
                  onOpenTerminal();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-xs border border-[var(--border-strong)] flex items-center justify-center gap-2 text-[var(--rm-status)] font-bold bg-[var(--bg-secondary)]"
              >
                <Terminal className="w-4 h-4 text-[var(--rm-status)]" />
                <span>OPEN 80s DOS TERMINAL</span>
              </button>
              <button
                onClick={() => {
                  onOpenFido();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-xs border border-[var(--border-strong)] flex items-center justify-center gap-2 text-[var(--text-primary)]"
              >
                <KeyRound className="w-4 h-4" />
                <span>{fidoSession?.isAuthenticated ? 'FIDO2: ACTIVE SESSION' : 'AUTHENTICATE FIDO2'}</span>
              </button>
              <div className="flex w-full gap-2 justify-between">
                <button
                  onClick={onToggleScanlines}
                  className="flex-1 px-2 py-1 text-xs border border-[var(--border-strong)] text-center"
                >
                  SCANLINES: {scanlines ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={onToggleAudio}
                  className="flex-1 px-2 py-1 text-xs border border-[var(--border-strong)] text-center"
                >
                  AUDIO: {!audioMuted ? 'ON' : 'MUTED'}
                </button>
                <button
                  onClick={() => {
                    onReboot();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-[var(--border-strong)] text-center"
                >
                  REBOOT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
