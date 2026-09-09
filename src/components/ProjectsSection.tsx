import React, { useState } from 'react';
import { ExternalLink, Github, FolderGit2 } from 'lucide-react';
import { PROJECTS } from '../data/portfolioData';
import { retroAudio } from '../utils/audio';
import { GithubHeatmap } from './GithubHeatmap';

export const ProjectsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'ALL REGISTERS' },
    { id: 'systems', label: 'SYSTEMS & AGENTS' },
    { id: 'security', label: 'SECURITY' },
    { id: 'retro', label: 'RETRO & CGA' },
    { id: 'ai', label: 'AI & AGENTS' },
    { id: 'web', label: 'WEB & VISUALS' },
  ];

  const filteredProjects = activeCategory === 'all' 
    ? PROJECTS 
    : PROJECTS.filter((p) => p.category === activeCategory);

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
              Public repositories and specific contributions. Follow each source to inspect the work without signing in.
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

                </div>

                {/* Card Footer Actions */}
                <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-3">
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => retroAudio.playKeyclick()}
                        className="retro-btn px-2.5 py-1 flex items-center gap-1.5 cursor-pointer font-bold"
                        title={`Inspect ${project.title} on GitHub`}
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>{project.sourceKind === 'contribution' ? 'PUBLIC PULL REQUEST' : 'PUBLIC REPOSITORY'}</span>
                      </a>
                    )}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => retroAudio.playKeyclick()}
                        className="retro-btn px-2.5 py-1 flex items-center gap-1.5 cursor-pointer"
                        title="View the public site"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>LIVE SITE</span>
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
