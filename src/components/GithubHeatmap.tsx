import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Terminal, 
  Github, 
  Sparkles, 
  Tv, 
  Cpu, 
  Flame, 
  Calendar, 
  Activity, 
  ExternalLink,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ContributionDay, HeatmapPhosphorMode } from '../types';
import { 
  summarizeContributions, validateCalendar, type PublicContributionCalendar,
  PHOSPHOR_PALETTES 
} from '../utils/githubContributions';
import { PERSONAL_INFO } from '../data/portfolioData';
import { retroAudio } from '../utils/audio';

interface GithubHeatmapProps {
  theme: 'light' | 'dark';
  initialPhosphor?: HeatmapPhosphorMode;
}

export const GithubHeatmap: React.FC<GithubHeatmapProps> = ({
  theme,
  initialPhosphor = 'green',
}) => {
  const [phosphorMode, setPhosphorMode] = useState<HeatmapPhosphorMode>(initialPhosphor);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [calendar, setCalendar] = useState<PublicContributionCalendar | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch('/github-contributions.json', {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
        });
        if (!response.ok) throw new Error('Calendar unavailable');
        const next = validateCalendar(await response.json());
        if (!disposed) {
          setCalendar(next);
          setError(false);
          setHoveredDay(null);
          setSelectedDay(null);
        }
      } catch {
        if (!disposed) { setCalendar(null); setError(true); }
      }
    }
    setError(false);
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 15 * 60 * 1000);
    return () => { disposed = true; controller.abort(); window.clearInterval(interval); };
  }, [retry]);
  const { days, summary } = useMemo(() => calendar ? summarizeContributions(calendar) :
    { days: [], summary: null }, [calendar]);
  const weekCount = days.length ? days[days.length - 1].weekIndex + 1 : 0;
  const palette = PHOSPHOR_PALETTES[phosphorMode];
  const rasterColors = theme === 'light' ? palette.lightColors : palette.colors;
  const rasterLabelColor = theme === 'light' ? palette.lightLabelColor : palette.labelColor;

  // Helper weekday names
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // D3 Heatmap Rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const cellSize = 11;
    const cellGap = 2.5;
    const leftMargin = 38;
    const topMargin = 22;

    const g = svg.append('g').attr('transform', `translate(${leftMargin}, ${topMargin})`);

    // 1. Month Labels across the top
    const monthOffsets: { month: string; x: number }[] = [];
    let lastMonth = -1;

    days.forEach((d) => {
      const date = new Date(d.date);
      const m = date.getUTCMonth();
      if (m !== lastMonth && d.weekday === 0) {
        monthOffsets.push({
          month: monthNames[m],
          x: d.weekIndex * (cellSize + cellGap),
        });
        lastMonth = m;
      }
    });

    const monthGroup = g.append('g').attr('class', 'month-labels');
    monthOffsets.forEach((item) => {
      monthGroup
        .append('text')
        .attr('x', item.x)
        .attr('y', -7)
        .attr('fill', rasterLabelColor)
        .attr('font-size', '8.5px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'var(--font-cga), monospace')
        .attr('letter-spacing', '0.05em')
        .text(item.month);
    });

    // 2. Weekday Labels down the left (MON, WED, FRI)
    const weekdayGroup = g.append('g').attr('class', 'weekday-labels');
    const displayDays = [
      { label: 'MON', row: 1 },
      { label: 'WED', row: 3 },
      { label: 'FRI', row: 5 },
    ];

    displayDays.forEach((item) => {
      weekdayGroup
        .append('text')
        .attr('x', -8)
        .attr('y', item.row * (cellSize + cellGap) + cellSize - 2)
        .attr('text-anchor', 'end')
        .attr('fill', rasterLabelColor)
        .attr('font-size', '8px')
        .attr('font-family', 'var(--font-cga), monospace')
        .attr('font-weight', 'bold')
        .text(item.label);
    });

    // 3. Preserve the source calendar span, including partial weeks
    const cellsGroup = g.append('g').attr('class', 'heatmap-cells');

    const cellRects = cellsGroup
      .selectAll<SVGRectElement, ContributionDay>('rect')
      .data(days)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', (d: ContributionDay) => d.weekIndex * (cellSize + cellGap))
      .attr('y', (d: ContributionDay) => d.weekday * (cellSize + cellGap))
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 1)
      .attr('ry', 1)
      .attr('fill', (d: ContributionDay) => rasterColors[d.level])
      .attr('stroke', (d: ContributionDay) => (d.level === 0
        ? theme === 'light' ? 'rgba(74,52,42,0.18)' : 'rgba(255,255,255,0.06)'
        : 'rgba(0,0,0,0.4)'))
      .attr('stroke-width', 0.75)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.12s ease');

    cellRects.append('title').text((d: ContributionDay) => `${d.date}: ${d.count} contributions`);

    // Add subtle glow on high-level cells
    cellRects.filter((d: ContributionDay) => d.level >= 3)
      .style('filter', theme === 'light' ? 'none' : `drop-shadow(0 0 2px ${palette.accentGlow})`);

    // Mouse interactions
    cellRects
      .on('mouseenter', function (event: MouseEvent, d: ContributionDay) {
        d3.select(this)
          .attr('stroke', theme === 'light' ? palette.lightLabelColor : '#ffffff')
          .attr('stroke-width', 1.6);

        setHoveredDay(d);
        if (soundEnabled) {
          retroAudio.playKeyclick();
        }
      })
      .on('mouseleave', function (event: MouseEvent, d: ContributionDay) {
        d3.select(this)
          .attr('stroke', d.level === 0
            ? theme === 'light' ? 'rgba(74,52,42,0.18)' : 'rgba(255,255,255,0.06)'
            : 'rgba(0,0,0,0.4)')
          .attr('stroke-width', 0.75);

        setHoveredDay(null);
      })
      .on('click', function (event: MouseEvent, d: ContributionDay) {
        setSelectedDay((prev) => (prev?.date === d.date ? null : d));
        if (soundEnabled) {
          retroAudio.playKeyclick();
        }
      });

  }, [days, palette, rasterColors, rasterLabelColor, soundEnabled, theme]);

  const activeDisplayDay = hoveredDay || selectedDay;

  return (
    <div 
      ref={containerRef}
      id="github-monochrome-heatmap"
      className="bg-[var(--bg-card)] border-2 border-[var(--border-strong)] shadow-xl relative overflow-hidden font-mono"
    >
      {/* Rainbow Top Accent */}
      <div className="rainbow-border-top h-[3px] w-full" />

      {/* Monitor Chassis Header Bar */}
      <div className="p-3 sm:p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-black border border-[var(--border-strong)] text-[var(--rm-status)]">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-wide">
                IBM 5151 / MDA MONOCHROME MONITOR
              </span>
              <span className="text-[10px] px-1.5 py-0.2 border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)] hidden sm:inline-block">
                720×350 RASTER
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              GITHUB CONTRIBUTION MATRIX // <span className="font-bold text-[var(--rm-accent-bright)]">@{PERSONAL_INFO.githubHandle}</span>
            </div>
          </div>
        </div>

        {/* Chassis Controls & Hardware Status */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => {
              retroAudio.playKeyclick();
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-1.5 border text-xs cursor-pointer transition-colors ${
              soundEnabled
                ? 'border-[var(--rm-status)] bg-[var(--rm-status)]/15 text-[var(--rm-status)]'
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title={soundEnabled ? 'Raster Audio: ENABLED (Click to mute)' : 'Raster Audio: MUTED (Click to enable)'}
            aria-label="Toggle Raster Audio"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Scanlines toggle */}
          <button
            onClick={() => {
              retroAudio.playKeyclick();
              setScanlinesEnabled(!scanlinesEnabled);
            }}
            className={`px-2 py-1 text-[10px] font-bold border cursor-pointer transition-colors ${
              scanlinesEnabled
                ? 'border-[var(--rm-status)] bg-[var(--rm-status)]/15 text-[var(--rm-status)]'
                : 'border-[var(--border-color)] text-[var(--text-muted)]'
            }`}
            title="Toggle CRT raster scanlines"
          >
            CRT SCAN: {scanlinesEnabled ? 'ON' : 'OFF'}
          </button>

          {/* GitHub Source Link */}
          <a
            href={PERSONAL_INFO.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => retroAudio.playKeyclick()}
            className="retro-btn px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Open GitHub Profile"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VIEW GITHUB</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Phosphor Mode Selector Sub-bar */}
      <div className="px-3 sm:px-4 py-2 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--text-muted)] font-bold">PHOSPHOR EMISSION:</span>
          <div className="flex items-center gap-1">
            {(['green', 'amber', 'white', 'cga'] as const).map((mode) => {
              const pal = PHOSPHOR_PALETTES[mode];
              const isCurrent = phosphorMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => {
                    retroAudio.playKeyclick();
                    setPhosphorMode(mode);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold border transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-[var(--rm-status)] shadow-sm'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  style={{
                    backgroundColor: isCurrent ? `${pal.borderColor}25` : 'transparent',
                    color: isCurrent ? (theme === 'light' ? pal.lightLabelColor : pal.labelColor) : undefined,
                  }}
                >
                  [{mode.toUpperCase()}]
                </button>
              );
            })}
          </div>
        </div>

        {/* Hardware Status LEDs */}
        <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${calendar ? 'bg-[#00ff66]' : 'bg-[#ffb000]'}`} />
            <span>GITHUB: {error ? 'UNAVAILABLE' : calendar ? 'LOADED' : 'LOADING'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb000] animate-pulse" />
            <span>DMA BUS: IDLE</span>
          </div>
          <span className="hidden md:inline text-[9px] text-[var(--text-muted)]">
            {palette.code}
          </span>
        </div>
      </div>

      {/* CRT Screen Display Container */}
      <div 
        className="p-3 sm:p-5 relative"
        style={{
          backgroundColor: theme === 'light' ? 'var(--bg-primary)' : palette.bgRaster,
          color: rasterLabelColor,
        }}
      >
        {/* Optional Scanlines Layer */}
        {scanlinesEnabled && (
          <div 
            className="absolute inset-0 scanlines-overlay pointer-events-none z-10 opacity-75"
            style={{ mixBlendMode: theme === 'light' ? 'multiply' : 'screen' }}
          />
        )}

        <div role="status" className={`relative z-20 mb-3 text-[11px] ${theme === 'light' ? 'text-[var(--text-secondary)]' : 'text-white/80'}`}>
          {calendar ? (
            <>
              <a href="https://github.com/users/mooserini/contributions" target="_blank" rel="noopener noreferrer" className="underline">SOURCE: GITHUB PUBLIC CALENDAR</a>
              {' • FETCHED: '}{new Date(calendar.fetchedAt).toLocaleString()}
              {' • REFRESHES EVERY 15 MINUTES'}
            </>
          ) : error ? (
            <>GitHub contributions are unavailable. <button className="underline cursor-pointer" onClick={() => setRetry(value => value + 1)}>Retry</button>{' or '}<a href={PERSONAL_INFO.githubUrl} className="underline">view GitHub</a>.</>
          ) : 'Loading contributions from GitHub…'}
        </div>
        {summary && <>
        {/* Top Phosphor HUD Status line */}
        <div className={`flex flex-wrap justify-between items-center text-[10px] pb-2 border-b mb-3 relative z-20 ${theme === 'light' ? 'border-[var(--border-color)]' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <span className={`font-bold tracking-widest ${theme === 'light' ? 'text-[var(--text-primary)]' : 'text-white'}`}>&gt;&gt; VRAM HEATMAP RASTER</span>
            <span className="opacity-60">| {days[0].date} — {days[days.length - 1].date}</span>
          </div>
          <div className={`flex items-center gap-3 ${theme === 'light' ? 'text-[var(--text-secondary)]' : 'text-white/80'}`}>
            <span>CONTRIBUTIONS: <strong className={theme === 'light' ? 'text-[var(--text-primary)]' : 'text-white'}>{summary.totalContributions.toLocaleString()}</strong></span>
            <span title="Consecutive active days ending on the last date shown">STREAK: <strong className={theme === 'light' ? 'text-[var(--text-primary)]' : 'text-white'}>{summary.currentStreak} DAYS</strong></span>
            <span className="hidden sm:inline">LONGEST: <strong className={theme === 'light' ? 'text-[var(--text-primary)]' : 'text-white'}>{summary.longestStreak} DAYS</strong></span>
          </div>
        </div>

        {/* SVG Container (Responsive viewBox) */}
        <div className="w-full overflow-x-auto pb-1 relative z-20">
          <div className="min-w-[690px]">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${38 + weekCount * 13.5 + 5} 120`}
              className="w-full h-auto block"
              aria-label="GitHub contribution activity heatmap graph"
            />
          </div>
        </div>

        {/* CRT Real-Time Telemetry Readout Box */}
        <div className={`mt-3 p-2.5 border text-[11px] leading-relaxed relative z-20 ${theme === 'light' ? 'border-[var(--border-color)] bg-[var(--bg-secondary)]' : 'border-white/15 bg-black/40'}`}>
          {activeDisplayDay ? (
            <div className="space-y-1">
              <div className={`flex flex-wrap items-center justify-between gap-2 ${theme === 'light' ? 'text-[var(--text-primary)]' : 'text-white'}`}>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-[var(--rm-warn)]">&gt;&gt; REGISTRY CELL INSPECTION:</span>
                  <span>{activeDisplayDay.date} ({dayNames[activeDisplayDay.weekday]})</span>
                </div>
                <div className="text-[10px] opacity-75">
                  VRAM MATRIX: COL {activeDisplayDay.weekIndex + 1}/{weekCount} • ROW {activeDisplayDay.weekday + 1}/7
                </div>
              </div>

              <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] ${theme === 'light' ? 'text-[var(--text-secondary)]' : 'text-white/85'}`}>
                <div>
                  CONTRIBUTIONS: <strong className={theme === 'light' ? 'text-[var(--text-primary)]' : 'text-white'}>{activeDisplayDay.count}</strong>
                </div>
                <div>
                  INTENSITY TIER: <strong className={theme === 'light' ? 'text-[var(--text-primary)]' : 'text-white'}>LEVEL {activeDisplayDay.level}/4</strong>
                </div>
                <div>
                  CYCLE STATUS: <span className="text-[#55ff77]">{activeDisplayDay.count > 0 ? 'CONTRIBUTIONS_RECORDED' : 'NO_CONTRIBUTIONS'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex items-center justify-between text-[10px] ${theme === 'light' ? 'text-[var(--text-muted)]' : 'text-white/60'}`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 animate-ping inline-block ${theme === 'light' ? 'bg-[var(--text-muted)]' : 'bg-white/40'}`} />
                <span>HOVER OVER A DAY TO SEE ITS GITHUB CONTRIBUTIONS.</span>
              </div>
              <span className="hidden sm:inline opacity-60">CLICK CELL TO LOCK TELEMETRY READOUT</span>
            </div>
          )}
        </div>

        {/* CRT Footer Bar: Intensity Legend & Hardware Diagnostics */}
        <div className={`mt-3 pt-2 border-t flex flex-wrap items-center justify-between gap-3 text-[10px] relative z-20 ${theme === 'light' ? 'border-[var(--border-color)] text-[var(--text-secondary)]' : 'border-white/10 text-white/70'}`}>
          {/* Legend */}
          <div className="flex items-center gap-2">
            <span className={`font-bold ${theme === 'light' ? 'text-[var(--text-primary)]' : 'text-white/90'}`}>PHOSPHOR INTENSITY:</span>
            <div className="flex items-center gap-1.5">
              <span>LESS</span>
              {rasterColors.map((c, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-1"
                  title={`GitHub intensity level ${i} of 4`}
                >
                  <span 
                    className={`w-2.5 h-2.5 rounded-[1px] inline-block border ${theme === 'light' ? 'border-[var(--border-color)]' : 'border-white/20'}`}
                    style={{ backgroundColor: c }}
                  />
                  <span className="text-[9px] opacity-75">{i === 0 ? '0' : ''}</span>
                </div>
              ))}
              <span>MORE</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <span>BURST PEAK: <strong className={theme === 'light' ? 'text-[var(--text-primary)]' : 'text-white'}>{summary.busiestDay.count} CONTRIBUTIONS</strong> ({summary.busiestDay.date || 'none'})</span>
            <span className="hidden md:inline">ACTIVE DAYS: <strong className={theme === 'light' ? 'text-[var(--text-primary)]' : 'text-white'}>{summary.activeDaysCount} / {days.length}</strong></span>
          </div>
        </div>
        </>}
      </div>

      {/* Retro Chassis Bottom Rim */}
      <div className="p-2 sm:px-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--text-muted)] font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-[var(--rm-status)]" />
          <span>TERMINAL COMMAND: <strong className="text-[var(--text-primary)]">PROJECTS</strong> OR <strong className="text-[var(--text-primary)]">HF</strong> IN DOS CONSOLE</span>
        </div>
        <div>
          <span>D3.JS RASTER V4.2 • MONOCHROME CRT EMULATOR</span>
        </div>
      </div>

    </div>
  );
};
