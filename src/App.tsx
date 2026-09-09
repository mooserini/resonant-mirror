import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBio } from './components/HeroBio';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsMatrix } from './components/SkillsMatrix';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BootSequence } from './components/BootSequence';
import { FidoModal } from './components/FidoModal';
import { GpgModal } from './components/GpgModal';
import { BlogModal } from './components/BlogModal';
import { DosTerminal } from './components/DosTerminal';
import { RefinementModal } from './components/RefinementModal';
import { OfflineFallback } from './components/OfflineFallback';
import { GoogleChatModal } from './components/GoogleChatModal';
import { Wrench, WifiOff } from 'lucide-react';
import { FidoSession } from './types';
import { getCurrentFidoSession, refreshFidoSession } from './utils/fidoAuth';
import { retroAudio } from './utils/audio';

export default function App() {
  const [booting, setBooting] = useState<boolean>(() => {
    // Show boot sequence on first load of session
    if (typeof window !== 'undefined') {
      const booted = sessionStorage.getItem('rm_has_booted');
      return !booted;
    }
    return true;
  });

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });
  const [showOfflineFallback, setShowOfflineFallback] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });
  const [isManualOfflineTest, setIsManualOfflineTest] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rm_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [scanlines, setScanlines] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rm_scanlines') === 'true';
    }
    return false;
  });

  const [audioMuted, setAudioMuted] = useState<boolean>(true);
  const [fidoSession, setFidoSession] = useState<FidoSession | null>(() => getCurrentFidoSession());
  useEffect(() => {
    const refresh = () => { void refreshFidoSession().then(setFidoSession); };
    refresh();
    window.addEventListener('portfolio-auth-changed', refresh);
    window.addEventListener('focus', refresh);
    const timer = setInterval(refresh, 60000);
    return () => { window.removeEventListener('portfolio-auth-changed', refresh); window.removeEventListener('focus', refresh); clearInterval(timer); };
  }, []);
  const [isFidoModalOpen, setIsFidoModalOpen] = useState(false);
  const [isGpgModalOpen, setIsGpgModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isRefinementModalOpen, setIsRefinementModalOpen] = useState(false);

  useEffect(() => {
    const openLinkedDispatches = () => {
      if (window.location.hash === '#dispatches') setIsBlogModalOpen(true);
    };
    openLinkedDispatches();
    window.addEventListener('hashchange', openLinkedDispatches);
    return () => window.removeEventListener('hashchange', openLinkedDispatches);
  }, []);

  // Global hotkey: press ` or ~ to toggle hidden DOS terminal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (e.key === '`' || e.key === '~') {
        if (!isInput || isTerminalOpen) {
          e.preventDefault();
          setIsTerminalOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTerminalOpen]);

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rm_theme', theme);
  }, [theme]);

  // Persist scanline preference
  useEffect(() => {
    localStorage.setItem('rm_scanlines', String(scanlines));
  }, [scanlines]);

  // Monitor network connectivity & modem diagnostics event
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineFallback(false);
      setIsManualOfflineTest(false);
      retroAudio.playBootSuccess();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineFallback(true);
      setIsManualOfflineTest(false);
      retroAudio.playModemError();
    };

    const handleOpenModemEvent = () => {
      setIsManualOfflineTest(true);
      setShowOfflineFallback(true);
    };

    const handleOpenChatEvent = () => {
      setIsChatModalOpen(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('open-modem-diagnostics', handleOpenModemEvent);
    window.addEventListener('open-google-chat', handleOpenChatEvent);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('open-modem-diagnostics', handleOpenModemEvent);
      window.removeEventListener('open-google-chat', handleOpenChatEvent);
    };
  }, []);

  const handleOpenModemDiagnostics = () => {
    setIsManualOfflineTest(true);
    setShowOfflineFallback(true);
  };

  const handleBootComplete = () => {
    sessionStorage.setItem('rm_has_booted', 'true');
    setBooting(false);
  };

  const handleReboot = () => {
    sessionStorage.removeItem('rm_has_booted');
    setBooting(true);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleScanlines = () => {
    setScanlines((prev) => !prev);
  };

  const handleToggleAudio = () => {
    const isMuted = retroAudio.toggleMute();
    setAudioMuted(isMuted);
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-[var(--rm-headings)] selection:text-[var(--rm-heading-text)]">
      {/* Optional Retro CRT Scanlines Overlay */}
      {scanlines && (
        <div 
          className="scanlines-overlay fixed inset-0 z-30 pointer-events-none" 
          aria-hidden="true" 
        />
      )}

      {/* Boot Sequence Animation */}
      {booting ? (
        <BootSequence onComplete={handleBootComplete} />
      ) : (
        <>
          {/* Main Navigation */}
          <Navbar
            theme={theme}
            onToggleTheme={handleToggleTheme}
            scanlines={scanlines}
            onToggleScanlines={handleToggleScanlines}
            audioMuted={audioMuted}
            onToggleAudio={handleToggleAudio}
            onReboot={handleReboot}
            onOpenFido={() => setIsFidoModalOpen(true)}
            onOpenTerminal={() => setIsTerminalOpen(true)}
            onOpenRefinement={() => setIsRefinementModalOpen(true)}
            onOpenModemDiagnostics={handleOpenModemDiagnostics}
            onOpenChat={() => setIsChatModalOpen(true)}
            isOffline={isOffline}
            fidoSession={fidoSession}
          />

          {/* Persistent Offline Warning Banner when fallback dismissed */}
          {isOffline && !showOfflineFallback && (
            <div 
              onClick={handleOpenModemDiagnostics}
              className="bg-[#ff5555] text-black px-4 py-1.5 text-center font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#ff7777] transition-colors z-30 sticky top-0 shadow-md select-none"
              title="Click to re-open retro modem diagnostic code generator"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>*** MODEM OFFLINE: NO CARRIER DETECTED (0x7E14) — CLICK FOR DIAGNOSTICS ***</span>
            </div>
          )}

          {/* Core Page Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <HeroBio
              theme={theme}
              onOpenGpg={() => setIsGpgModalOpen(true)}
              onOpenFido={() => setIsFidoModalOpen(true)}
              onOpenRefinement={() => setIsRefinementModalOpen(true)}
            />

            <ProjectsSection theme={theme} />

            <SkillsMatrix />

            <ContactSection />
          </main>

          {/* Footer */}
          <Footer
            onOpenGpg={() => setIsGpgModalOpen(true)}
            onOpenRefinement={() => setIsRefinementModalOpen(true)}
          />

          {/* Floating Actions: Make Refinement + Retro DOS Prompt */}
          <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
            <button
              onClick={() => {
                retroAudio.playKeyclick();
                setIsRefinementModalOpen(true);
              }}
              className="px-3 py-2 border-2 border-[var(--rm-status)] bg-[var(--bg-card)] text-[var(--rm-status)] font-mono text-xs font-bold shadow-2xl hover:bg-[var(--rm-status)] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer"
              title="Notice something to add? Enter authenticated session loop to refine and iterate"
              id="floating-refine-btn"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>[ MAKE REFINEMENT ]</span>
            </button>

            <button
              onClick={() => {
                retroAudio.playKeyclick();
                setIsTerminalOpen(true);
              }}
              className="px-3 py-2 border-2 border-[var(--rm-status)] bg-[var(--bg-card)] text-[var(--rm-status)] font-mono text-xs font-bold shadow-2xl hover:bg-[var(--rm-status)] hover:text-black transition-all flex items-center gap-2 cursor-pointer group"
              title="Open Hidden 80s DOS Terminal Prompt (` or ~)"
              id="floating-dos-btn"
            >
              <span className="w-2 h-2 bg-[var(--rm-status)] rounded-full animate-ping group-hover:bg-black" />
              <span>&gt;_ DOS PROMPT [~]</span>
            </button>
          </div>

          {/* Interactive Modals */}
          <DosTerminal
            isOpen={isTerminalOpen}
            onClose={() => setIsTerminalOpen(false)}
            theme={theme}
            setTheme={setTheme}
            fidoSession={fidoSession}
            onReboot={handleReboot}
          />

          <RefinementModal
            isOpen={isRefinementModalOpen}
            onClose={() => setIsRefinementModalOpen(false)}
            onOpenTerminal={() => setIsTerminalOpen(true)}
          />

          <FidoModal
            isOpen={isFidoModalOpen}
            onClose={() => setIsFidoModalOpen(false)}
            session={fidoSession}
            onSessionChange={(s) => setFidoSession(s)}
          />

          <GpgModal
            isOpen={isGpgModalOpen}
            onClose={() => setIsGpgModalOpen(false)}
          />

          <BlogModal
            isOpen={isBlogModalOpen}
            onClose={() => setIsBlogModalOpen(false)}
          />

          {/* Google Chat Subsystem Modal */}
          <GoogleChatModal
            isOpen={isChatModalOpen}
            onClose={() => setIsChatModalOpen(false)}
            onOpenTerminal={() => setIsTerminalOpen(true)}
          />

          {/* Retro 1980s Modem Offline Fallback & Diagnostic Generator */}
          <OfflineFallback
            isOffline={showOfflineFallback}
            isManualTest={isManualOfflineTest}
            onDismiss={() => setShowOfflineFallback(false)}
            onRetryConnection={() => {
              const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
              setIsOffline(!online);
            }}
          />
        </>
      )}
    </div>
  );
}
