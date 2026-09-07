import React, { useState } from 'react';
import { 
  Terminal, 
  ExternalLink, 
  Github, 
  FolderGit2, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Project } from '../types';
import { PROJECTS } from '../data/portfolioData';
import { retroAudio } from '../utils/audio';
import { GithubHeatmap } from './GithubHeatmap';

export const ProjectsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedOutputId, setExpandedOutputId] = useState<string | null>('hermes-audit');

  const categories = [
    { id: 'all', label: 'ALL REGISTERS' },
    { id: 'systems', label: 'SYSTEMS & AGENTS' },
    { id: 'security', label: 'SECURITY & FIDO' },
    { id: 'retro', label: 'RETRO & CGA' },
    { id: 'ai', label: 'NEURAL / LLM' },
  ];

  const filteredProjects = activeCategory === 'all' 
    ? PROJECTS 
    : PROJECTS.filter((p) => p.category === activeCategory);

  const toggleOutput = (id: string) => {
    retroAudio.playKeyclick();
    setExpandedOutputId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="projects" className="py-8 sm:py-12">
      <div className="space-y-6">
        
        {/* Section Header */}
        <div className="border-b-2 border-[var(--border-strong)] pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--rm-accent-bright)] uppercase tracking-wider">
              <FolderGit2 className="w-4 h-4" />
              <span>SECTION 02: EXECUTABLE DIRECTORY</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-1">
              PROJECTS &amp; SYSTEMS SHOWCASE
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono mt-1">
              Verified repositories, cryptographic continuity engines, and retro graphics tools.
            </p>
          </div>

          <div className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-secondary)] px-3 py-1.5 border border-[var(--border-color)]">
            DISPLAYING: {filteredProjects.length} / {PROJECTS.length} RECORDS
          </div>
        </div>

        {/* 1980s Monochrome D3 GitHub Contribution Heatmap */}
        <GithubHeatmap />

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project Categories">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  retroAudio.playKeyclick();
                  setActiveCategory(cat.id);
                }}
                className={`px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                  isActive
                    ? 'border-[var(--rm-headings)] bg-[var(--rm-headings)] text-[var(--rm-heading-text)] shadow-sm'
                    : 'border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
                id={`filter-btn-${cat.id}`}
              >
                [{cat.label}]
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const isOutputOpen = expandedOutputId === project.id;
            return (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                className="bg-[var(--bg-card)] border-2 border-[var(--border-strong)] flex flex-col justify-between shadow-md relative hover:border-[var(--rm-headings)] transition-colors"
              >
                {/* Rainbow accent if featured */}
                {project.featured && (
                  <div className="rainbow-border-top h-[2px] w-full" />
                )}

                {/* Card Header */}
                <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/70">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[var(--rm-headings)] font-bold block">
                        CODENAME: {project.codename} // {project.year}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-1">
                        {project.title}
                      </h3>
                    </div>
                    {project.featured && (
                      <span className="px-2 py-0.5 text-[10px] bg-[var(--rm-emphasis)] text-white font-mono font-bold tracking-wider uppercase border border-purple-300">
                        FEATURED
                      </span>
                    )}
                  </div>

                  {project.metrics && (
                    <div className="mt-2.5 text-[11px] font-mono text-[var(--rm-status)] bg-[var(--bg-primary)] px-2.5 py-1 border border-[var(--border-color)] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{project.metrics}</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1">
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-mono">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] bg-[var(--code-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Expandable Retro Console Output */}
                  {project.retroOutput && (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleOutput(project.id)}
                        className="text-[11px] font-mono text-[var(--rm-accent-bright)] hover:underline flex items-center gap-1 cursor-pointer"
                        aria-expanded={isOutputOpen}
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>
                          {isOutputOpen ? 'HIDE RETRO CONSOLE EMULATION' : 'VIEW RETRO CONSOLE EMULATION'}
                        </span>
                        {isOutputOpen ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {isOutputOpen && (
                        <div className="mt-2 p-3 bg-[var(--terminal-bg)] text-[var(--terminal-text)] font-mono text-xs border border-[var(--border-strong)] rounded-none shadow-inner overflow-x-auto leading-relaxed">
                          <div className="text-[10px] text-gray-400 border-b border-gray-700 pb-1 mb-1.5 flex justify-between">
                            <span>AT&amp;T PC6300 V2.2 // DOS 3.3 CONSOLE</span>
                            <span>COM1: 9600 BAUD</span>
                          </div>
                          <pre className="whitespace-pre-wrap">{project.retroOutput}</pre>
                          <span className="cga-cursor bg-[var(--terminal-text)]"></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => retroAudio.playKeyclick()}
                        className="retro-btn px-2.5 py-1 flex items-center gap-1.5 cursor-pointer font-bold"
                        title="View GitHub Repository"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>SRC REPO</span>
                      </a>
                    )}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => retroAudio.playKeyclick()}
                        className="retro-btn px-2.5 py-1 flex items-center gap-1.5 cursor-pointer"
                        title="Open Documentation or Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>SPEC / LIVE</span>
                      </a>
                    )}
                  </div>

                  <span className="text-[10px] text-[var(--text-muted)]">
                    ID: {project.id.toUpperCase()}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
