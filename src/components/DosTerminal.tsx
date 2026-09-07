import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  X, 
  Maximize2, 
  Minimize2, 
  Minus, 
  HelpCircle,
  Cpu,
  UserCheck,
  Sparkles,
  Trophy
} from 'lucide-react';
import { TerminalLine, FidoSession, Achievement } from '../types';
import { executeTerminalCommand, CommandContext } from '../utils/terminalCommands';
import { 
  TerminalAnimationHelper, 
  TerminalAnimationType, 
  ANIMATION_REGISTRY, 
  getAnimationForCommand 
} from '../utils/terminalAnimations';
import { retroAudio } from '../utils/audio';
import { evaluateCommandForEasterEggs } from '../utils/easterEggs';
import { AchievementToast } from './AchievementToast';

interface DosTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fidoSession: FidoSession | null;
  onReboot: () => void;
}

export const DosTerminal: React.FC<DosTerminalProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  fidoSession,
  onReboot,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Easter Egg & Achievement Toast State
  const [unlockedToasts, setUnlockedToasts] = useState<Achievement[]>([]);

  // Animation Helper States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCmd, setProcessingCmd] = useState('');
  const [activeAnimType, setActiveAnimType] = useState<TerminalAnimationType>('globe');
  const [activeAnimFrame, setActiveAnimFrame] = useState('');

  const animHelperRef = useRef<TerminalAnimationHelper>(new TerminalAnimationHelper('globe'));
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: `AT&T Personal Computer 6300 ROM BIOS v1.43
MS-DOS Version 3.30 (Revision B)
Copyright (C) 1981, 1987 Microsoft Corp. / Olivetti
Hermes Archival Subsystem v2.4 (CGA 640x400 Mode 06h)`,
    },
    {
      id: 'init-2',
      type: 'output',
      text: `Type "HELP", "WHOIS", or "STATS" to query system information.
Available commands: HELP, WHOIS, STATS, DIR, TYPE, PROJECTS, SKILLS, VER, ANIM, BADGES, GPG, ORCID, FIDO, THEME, BEEP, CLS, REBOOT, EXIT.`,
    },
  ]);

  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clean up animation timer on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom whenever lines change, processing changes, or modal opens
  useEffect(() => {
    if (isOpen) {
      outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (!isProcessing) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    }
  }, [isOpen, lines, isProcessing, activeAnimFrame]);

  // Global ESC key listener to dismiss terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (animTimerRef.current) {
          clearInterval(animTimerRef.current);
        }
        setIsProcessing(false);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCommandSubmit = (commandText: string, forcedAnimType?: TerminalAnimationType) => {
    if (isProcessing) return;

    const trimmed = commandText.trim();
    if (!trimmed) {
      // Just print prompt line
      setLines((prev) => [
        ...prev,
        { id: Math.random().toString(), type: 'input', text: 'C:\\RESONANT>' },
      ]);
      return;
    }

    retroAudio.playKeyclick();

    // Add to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const promptLine: TerminalLine = {
      id: Math.random().toString(),
      type: 'input',
      text: `C:\\RESONANT> ${trimmed}`,
    };

    // Check for Easter Eggs & command sequence achievements!
    const newlyUnlocked = evaluateCommandForEasterEggs(trimmed, history);
    if (newlyUnlocked.length > 0) {
      retroAudio.playAchievementFanfare();
      setUnlockedToasts((prev) => [...prev, ...newlyUnlocked]);
    }

    if (trimmed.toLowerCase() === 'cls' || trimmed.toLowerCase() === 'clear') {
      const initialSystemText = `AT&T Personal Computer 6300 MS-DOS Version 3.30\nType 'HELP', 'WHOIS', or 'STATS' for system information.`;
      const achievementNotice = newlyUnlocked.length > 0
        ? newlyUnlocked.map((a) => `\n★ EASTER EGG UNLOCKED: [${a.badge} ${a.title}] (+${a.points} PTS) ★\n  "${a.description}"`).join('\n')
        : '';

      setLines([
        {
          id: Math.random().toString(),
          type: 'system',
          text: initialSystemText + achievementNotice,
        },
      ]);
      setInputVal('');
      return;
    }

    // Set immediate prompt line into buffer
    setLines((prev) => [...prev, promptLine]);
    setInputVal('');

    // Configure Animation Helper
    const animType = forcedAnimType || getAnimationForCommand(trimmed);
    const helper = animHelperRef.current;
    helper.setType(animType);
    helper.reset();

    setIsProcessing(true);
    setProcessingCmd(trimmed);
    setActiveAnimType(animType);
    setActiveAnimFrame(helper.getCurrentFrame());

    // Cycle through 2-3+ ASCII art frames while terminal is 'processing'
    let ticks = 0;
    const maxTicks = 4; // Cycles through frames for ~500-600ms simulated 80s processing
    const intervalMs = ANIMATION_REGISTRY[animType].intervalMs;

    if (animTimerRef.current) {
      clearInterval(animTimerRef.current);
    }

    animTimerRef.current = setInterval(() => {
      ticks += 1;
      const nextFrame = helper.nextFrame();
      setActiveAnimFrame(nextFrame);

      if (ticks >= maxTicks) {
        if (animTimerRef.current) {
          clearInterval(animTimerRef.current);
          animTimerRef.current = null;
        }

        const context: CommandContext = {
          theme,
          setTheme,
          fidoSession,
          onReboot,
          onClose,
        };

        const outputLines = executeTerminalCommand(trimmed, context);

        let finalOutputLines = outputLines;
        if (newlyUnlocked.length > 0) {
          const achBannerLines: TerminalLine[] = newlyUnlocked.map((a) => ({
            id: Math.random().toString(),
            type: 'success',
            text: `★ EASTER EGG UNLOCKED: [${a.badge} ${a.title}] (+${a.points} PTS) ★\n  "${a.description}"`,
          }));
          finalOutputLines = [...achBannerLines, ...outputLines];
        }

        setLines((prev) => [...prev, ...finalOutputLines]);
        setIsProcessing(false);
        setProcessingCmd('');
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }, intervalMs);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommandSubmit(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length > 0 && historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx < history.length) {
          setHistoryIdx(nextIdx);
          setInputVal(history[nextIdx]);
        } else {
          setHistoryIdx(-1);
          setInputVal('');
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete common commands
      const current = inputVal.toLowerCase().trim();
      const candidates = [
        'help', 'whois', 'stats', 'sysinfo', 'dir', 'type', 'projects',
        'skills', 'ver', 'anim', 'badges', 'achievements', 'gpg', 'orcid', 'fido',
        'theme', 'beep', 'matrix', 'cls', 'reboot', 'exit', 'xyzzy', 'joshua', 'iddqd', 'hack', 'konami'
      ];
      const match = candidates.find((c) => c.startsWith(current));
      if (match) {
        setInputVal(match);
      }
    } else {
      // Play subtle keyclick on typing
      retroAudio.playKeyclick();
    }
  };

  const quickCommands = ['help', 'whois', 'stats', 'dir', 'badges', 'ver', 'cls'];
  const animPresets: { label: string; type: TerminalAnimationType; cmd: string }[] = [
    { label: 'GLOBE', type: 'globe', cmd: 'whois' },
    { label: 'CURSOR', type: 'cursor', cmd: 'ver' },
    { label: 'DISK', type: 'disk', cmd: 'dir' },
  ];

  return (
    <>
      {/* Retro Achievement Notification Toast Overlay (remains visible even if terminal closes) */}
      <AchievementToast
        achievements={unlockedToasts}
        onDismiss={(id) => setUnlockedToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dos-terminal-title"
        >
          <div 
            className={`bg-[#050608] border-4 border-[#333] shadow-2xl flex flex-col font-mono relative transition-all ${
              isFullScreen 
                ? 'w-full h-full max-w-none max-h-none border-0' 
                : 'w-full max-w-4xl h-[85vh] max-h-[700px]'
            }`}
            style={{
              boxShadow: '0 0 35px rgba(0, 255, 102, 0.15)',
            }}
          >
            {/* DOS Window Chrome Bar */}
            <div className="bg-[#1c1d21] border-b-2 border-[#333] px-3 py-2 flex justify-between items-center select-none text-xs text-gray-300">
              <div className="flex items-center gap-2 font-bold tracking-wider text-[#a0f0a0]">
                <TerminalIcon className="w-4 h-4 text-[#00ff66]" />
                <span id="dos-terminal-title">AT&amp;T PC6300 MS-DOS 3.30 — COMMAND.COM</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Quick action chips */}
                <div className="hidden sm:flex items-center gap-1 mr-2">
                  {quickCommands.map((cmd) => (
                    <button
                      key={cmd}
                      disabled={isProcessing}
                      onClick={() => handleCommandSubmit(cmd)}
                      className={`px-1.5 py-0.5 text-[10px] border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        cmd === 'badges'
                          ? 'bg-[#291e04] hover:bg-[#3d2e07] text-[#ffc844] border-[#a87400] font-bold flex items-center gap-0.5'
                          : 'bg-[#2a2b30] hover:bg-[#3b3c44] text-[#b8f5b8] border-[#444]'
                      }`}
                      title={`Run command: ${cmd}`}
                    >
                      {cmd === 'badges' && <Trophy className="w-2.5 h-2.5 text-[#ffd700]" />}
                      <span>{cmd}</span>
                    </button>
                  ))}
                </div>

                {/* Direct Animation Trigger Buttons */}
                <div className="hidden md:flex items-center gap-1 mr-2 border-l border-[#444] pl-2">
                  <span className="text-[9px] text-gray-400">ANIM:</span>
                  {animPresets.map((preset) => (
                    <button
                      key={preset.type}
                      disabled={isProcessing}
                      onClick={() => handleCommandSubmit(preset.cmd, preset.type)}
                      className="px-1.5 py-0.5 text-[9px] bg-[#1a2e1d] hover:bg-[#25462a] text-[#55ff99] border border-[#00aa44] cursor-pointer disabled:opacity-40"
                      title={`Test 80s ASCII ${preset.label} animation`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Minimize / Maximize / Close Window Controls */}
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1 hover:bg-[#333] text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title={isFullScreen ? 'Restore Window' : 'Full Screen Terminal'}
                  aria-label="Toggle Fullscreen"
                >
                  {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    retroAudio.playKeyclick();
                    onClose();
                  }}
                  className="p-1 hover:bg-red-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Close DOS Console (ESC)"
                  aria-label="Close Terminal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

        {/* Scanlines Effect inside terminal */}
        <div className="scanlines-overlay pointer-events-none absolute inset-0 z-10 opacity-40" />

        {/* Console Buffer Output Area */}
        <div 
          className="flex-1 p-4 overflow-y-auto font-mono text-xs sm:text-sm text-[#00ff66] bg-[#000000] space-y-2 leading-relaxed z-0 select-text"
          onClick={() => {
            if (!isProcessing) inputRef.current?.focus();
          }}
        >
          {lines.map((line) => {
            if (line.type === 'input') {
              return (
                <div key={line.id} className="text-[#aaffaa] font-bold">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'system') {
              return (
                <div key={line.id} className="text-[#88ff88] whitespace-pre-wrap border-b border-[#004411] pb-2 mb-2">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'error') {
              return (
                <div key={line.id} className="text-[#ff5555] whitespace-pre-wrap font-bold">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'success') {
              return (
                <div key={line.id} className="text-[#55ffff] whitespace-pre-wrap font-bold">
                  {line.text}
                </div>
              );
            }
            return (
              <div key={line.id} className="text-[#00ff66] whitespace-pre-wrap font-normal">
                {line.text}
              </div>
            );
          })}

          {/* 80s ASCII Art Animation Frame Display while 'Processing' */}
          {isProcessing && (
            <div 
              className="my-3 p-3.5 border-2 border-[#00aa44] bg-[#021808] text-[#00ff66] rounded-sm shadow-[0_0_15px_rgba(0,255,102,0.2)]"
              id="terminal-processing-frame"
              aria-live="polite"
              aria-label="Processing command ASCII animation"
            >
              <div className="flex items-center justify-between text-xs text-[#88ffaa] border-b border-[#005522] pb-1.5 mb-2.5 select-none">
                <div className="flex items-center gap-2 font-bold tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping" />
                  <span>BUS BUSY: EXECUTING &quot;{processingCmd.toUpperCase()}&quot;</span>
                </div>
                <div className="text-[10px] px-1.5 py-0.5 bg-[#03260c] border border-[#006622] text-[#44ff88] font-bold">
                  {ANIMATION_REGISTRY[activeAnimType].label}
                </div>
              </div>

              {/* Cycling ASCII Art Frame */}
              <pre 
                className="font-mono text-xs sm:text-sm text-[#00ff66] whitespace-pre leading-snug py-1 font-bold tracking-normal select-none"
                style={{
                  textShadow: '0 0 8px rgba(0, 255, 102, 0.8), 0 0 2px #00ff66',
                }}
              >
                {activeAnimFrame}
              </pre>

              <div className="mt-2.5 pt-1.5 border-t border-[#003d18] text-[10px] text-[#33bb66] flex justify-between items-center select-none font-mono">
                <span>PORT 0x3F8 // INTERRUPT IRQ4</span>
                <span className="font-bold animate-pulse text-[#66ff99]">
                  CLOCK CYCLE: FRAME {(animHelperRef.current.getFrameIndex() % animHelperRef.current.getFrameCount()) + 1} / {animHelperRef.current.getFrameCount()}
                </span>
              </div>
            </div>
          )}

          {/* Active Command Input Line */}
          <div className="flex items-center text-[#aaffaa] pt-1">
            <span className="select-none font-bold mr-2 text-[#00ff66]">
              {isProcessing ? 'BUSY>' : 'C:\\RESONANT>'}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={isProcessing ? 'BUS ACTIVE: Processing instruction cycles...' : inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              className={`flex-1 bg-transparent font-mono text-xs sm:text-sm focus:outline-none border-none caret-[#00ff66] ${
                isProcessing ? 'text-[#44aa66] italic cursor-wait' : 'text-[#00ff66]'
              }`}
              aria-label="DOS Command Line Input"
            />
            <span className={`cga-cursor inline-block w-2 h-4 bg-[#00ff66] ml-0.5 select-none ${isProcessing ? 'animate-ping' : 'animate-pulse'}`} />
          </div>

          <div ref={outputEndRef} />
        </div>

        {/* Footer Status Line */}
        <div className="bg-[#121316] border-t-2 border-[#26272b] px-3 py-1.5 flex flex-wrap justify-between items-center text-[10px] text-gray-400 select-none z-20">
          <div className="flex items-center gap-3">
            <span>DRIVE C: 348 KB FREE</span>
            <span>•</span>
            <span>PRESS [TAB] TO COMPLETE</span>
            <span>•</span>
            <span>TYPE &apos;EXIT&apos; OR [ESC] TO CLOSE</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#00ff66]">MODE: 80x25 COLOR</span>
            <span>•</span>
            <span>COM1: 9600 BAUD</span>
          </div>
        </div>

      </div>
    </div>
      )}
    </>
  );
};
