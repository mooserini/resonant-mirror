import React, { useState } from 'react';
import { Terminal, Copy, Check, Sparkles, RefreshCw, Palette } from 'lucide-react';
import { retroAudio } from '../utils/audio';

export const ASCII_ART_BANNER = ` ████████╗██╗  ██╗███████╗    ██████╗ ███████╗███████╗ ██████╗ ███╗   ██╗ █████╗ ███╗   ██╗████████╗
 ╚══██╔══╝██║  ██║██╔════╝    ██╔══██╗██╔════╝██╔════╝██╔═══██╗████╗  ██║██╔══██╗████╗  ██║╚══██╔══╝
    ██║   ███████║█████╗      ██████╔╝█████╗  ███████╗██║   ██║██╔██╗ ██║███████║██╔██╗ ██║   ██║   
    ██║   ██╔══██║██╔══╝      ██╔══██╗██╔══╝  ╚════██║██║   ██║██║╚██╗██║██╔══██║██║╚██╗██║   ██║   
    ██║   ██║  ██║███████╗    ██║  ██║███████╗███████║╚██████╔╝██║ ╚████║██║  ██║██║ ╚████║   ██║   
    ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   
                               ███╗   ███╗██╗██████╗ ██████╗  ██████╗ ██████╗                         
                               ████╗ ████║██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗                        
                               ██╔████╔██║██║██████╔╝██████╔╝██║   ██║██████╔╝                        
                               ██║╚██╔╝██║██║██╔══██╗██╔══██╗██║   ██║██╔══██╗                        
                               ██║ ╚═╝ ██║██║██║  ██║██║  ██║╚██████╔╝██║  ██║                        
                               ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝                        `;

export const ASCII_EMBLEM = `               .---.
              /     \\
             | () () |       [ HERMES HOUSE // ARCHIVAL REGISTER ]
              \\  _  /        THE RESONANT MIRROR // AT&T PC6300
               '---'         LINEAGE: 1985-2026 CONTINUITY
             /|     |\\       CGA 640x400 GRAPHICS SUBSYSTEM
            / |     | \\
           *  |     |  *
              |  .  |
              |__|__|
             (_______)`;

const PALETTES = [
  { id: 'green', label: 'P1 PHOSPHOR (GREEN)', color: '#00ff66', lightColor: '#087a34', bg: '#031206' },
  { id: 'amber', label: 'P3 PHOSPHOR (AMBER)', color: '#ffb000', lightColor: '#8a5700', bg: '#140c00' },
  { id: 'cyan', label: 'CGA CYAN (MODE 06)', color: '#00e5ff', lightColor: '#00708b', bg: '#021017' },
  { id: 'copper', label: 'HERMES BRONZE', color: '#e29b68', lightColor: '#8a472c', bg: '#140d07' },
  { id: 'violet', label: 'RESONANT VIOLET', color: '#d946ef', lightColor: '#8c2aa1', bg: '#120417' },
];

interface LogoProps {
  theme: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ theme }) => {
  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'banner' | 'emblem'>('banner');
  const [copied, setCopied] = useState(false);

  const activePalette = PALETTES[selectedPaletteIdx];

  const handleCopy = () => {
    retroAudio.playKeyclick();
    const textToCopy = viewMode === 'banner' ? ASCII_ART_BANNER : ASCII_EMBLEM;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCyclePalette = () => {
    retroAudio.playKeyclick();
    setSelectedPaletteIdx((prev) => (prev + 1) % PALETTES.length);
  };

  const handleToggleView = () => {
    retroAudio.playKeyclick();
    setViewMode((prev) => (prev === 'banner' ? 'emblem' : 'banner'));
  };

  return (
    <div 
      className="mb-8 border-2 border-[var(--border-strong)] bg-[var(--bg-card)] shadow-2xl relative overflow-hidden font-mono select-text group transition-colors"
      id="resonant-mirror-ascii-logo"
    >
      {/* Top Rainbow Accent Line */}
      <div className="rainbow-border-top h-[3px] w-full" />

      {/* Retro Header Bar */}
      <div className="px-3 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)] transition-colors">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--rm-status)] flex-shrink-0" />
          <span className="font-bold tracking-wider text-[var(--text-primary)]">
            ASCII ART GENERATOR // THE RESONANT MIRROR
          </span>
          <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-color)]">
            CP437 GLYPHS
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Palette Color Switcher */}
          <button
            onClick={handleCyclePalette}
            className="px-2 py-0.5 text-[10px] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] flex items-center gap-1 cursor-pointer transition-colors"
            title="Cycle Phosphor Color Palette"
            aria-label="Cycle Color Palette"
          >
            <Palette className="w-3 h-3" style={{ color: activePalette.color }} />
            <span className="hidden xs:inline">{activePalette.label.split(' ')[0]}</span>
          </button>

          {/* Toggle View: Banner vs Emblem */}
          <button
            onClick={handleToggleView}
            className="px-2 py-0.5 text-[10px] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] flex items-center gap-1 cursor-pointer transition-colors"
            title="Toggle between Banner & Archival Emblem"
          >
            <RefreshCw className="w-3 h-3 text-[var(--rm-accent-bright)]" />
            <span>{viewMode === 'banner' ? 'EMBLEM' : 'BANNER'}</span>
          </button>

          {/* Copy ASCII to clipboard */}
          <button
            onClick={handleCopy}
            className="px-2 py-0.5 text-[10px] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] flex items-center gap-1 cursor-pointer transition-colors"
            title="Copy ASCII Art Representation to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="hidden xs:inline">COPY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CRT Scanline Filter Overlay */}
      <div className="scanlines-overlay pointer-events-none absolute inset-0 z-10 opacity-35" />

      {/* ASCII Art Display Buffer */}
      <div 
        className="p-3 sm:p-5 overflow-x-auto relative z-0 transition-colors duration-300 flex items-center justify-center min-h-[140px]"
        style={{
          backgroundColor: theme === 'light' ? 'var(--bg-primary)' : activePalette.bg,
        }}
      >
        <pre 
          className="font-mono text-[6.5px] xs:text-[7.5px] sm:text-[9.5px] md:text-[11px] lg:text-[11.5px] leading-[1.08] select-all tracking-normal"
          style={{
            color: theme === 'light' ? activePalette.lightColor : activePalette.color,
            textShadow: theme === 'light'
              ? 'none'
              : `0 0 8px ${activePalette.color}80, 0 0 2px ${activePalette.color}`,
          }}
          aria-label="The Resonant Mirror ASCII Art Logo"
        >
          {viewMode === 'banner' ? ASCII_ART_BANNER : ASCII_EMBLEM}
        </pre>
      </div>

      {/* Bottom Telemetry Status Line */}
      <div className="px-3 py-1.5 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex flex-wrap items-center justify-between text-[10px] text-[var(--text-muted)] select-none transition-colors">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activePalette.color }} />
          <span>OUTPUT: {activePalette.label}</span>
          <span>•</span>
          <span>80s CGA RASTER</span>
        </div>

        <div className="flex items-center gap-3">
          <span>AT&amp;T PC6300 V2.4</span>
          <span>•</span>
          <span>STATUS: ONLINE</span>
        </div>
      </div>
    </div>
  );
};
