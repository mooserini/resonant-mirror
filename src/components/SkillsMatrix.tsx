import React, { useState } from 'react';
import { 
  Server, 
  ShieldCheck, 
  Code2, 
  Cpu, 
  Monitor, 
  CheckCircle2,
  Wrench
} from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/portfolioData';
import { retroAudio } from '../utils/audio';

const iconMap: Record<string, React.ElementType> = {
  Server,
  ShieldCheck,
  Code2,
  Cpu,
  Monitor,
};

// Generates retro ASCII block meters: [██████████░░]
function renderAsciiMeter(level: number, totalBlocks: number = 14): string {
  const filled = Math.round((level / 100) * totalBlocks);
  const empty = totalBlocks - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export const SkillsMatrix: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);

  const handleCategoryClick = (idx: number) => {
    retroAudio.playKeyclick();
    setSelectedDomain((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="skills" className="py-8 sm:py-12">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="border-b-2 border-[var(--border-strong)] pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--rm-accent-bright)] uppercase tracking-wider">
            <Wrench className="w-4 h-4" />
            <span>SECTION 03: CAPABILITIES MATRIX</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-1">
            TECHNICAL PROFICIENCY &amp; DOMAINS
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono mt-1">
            System architectures, cryptographic protocols, neural inference pipelines, and legacy display hardware.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SKILL_CATEGORIES.map((category, idx) => {
            const Icon = iconMap[category.iconName] || Server;
            const isHighlighted = selectedDomain === idx;

            return (
              <div
                key={category.title}
                id={`skill-cat-${idx}`}
                onClick={() => handleCategoryClick(idx)}
                className={`bg-[var(--bg-card)] border-2 transition-all p-5 flex flex-col justify-between shadow-md cursor-pointer ${
                  isHighlighted 
                    ? 'border-[var(--rm-status)] ring-2 ring-[var(--rm-status)]/30' 
                    : 'border-[var(--border-strong)] hover:border-[var(--rm-headings)]'
                }`}
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3 mb-4">
                    <div className="p-2 border border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[var(--rm-headings)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
                        {category.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono line-clamp-1">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-4">
                    {category.skills.map((skill) => (
                      <div key={skill.name} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--rm-status)] flex-shrink-0" />
                            <span className="truncate max-w-[160px] sm:max-w-[180px]">{skill.name}</span>
                          </div>
                          {skill.badge ? (
                            <span className="text-[9px] px-1.5 py-0.2 bg-[var(--rm-headings)] text-[var(--rm-heading-text)] uppercase font-bold">
                              {skill.badge}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[var(--rm-headings)] font-bold">
                              {skill.level}%
                            </span>
                          )}
                        </div>

                        {/* ASCII Progress Bar */}
                        <div className="text-[11px] font-mono tracking-tighter text-[var(--rm-status)] flex items-center justify-between select-none">
                          <span className="truncate">[{renderAsciiMeter(skill.level)}]</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{skill.level}%</span>
                        </div>

                        <p className="text-[10px] text-[var(--text-secondary)] font-mono pl-5">
                          {skill.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer status */}
                <div className="mt-4 pt-2.5 border-t border-[var(--border-color)] text-[10px] font-mono text-[var(--text-muted)] flex justify-between">
                  <span>AUDITED STATE: OK</span>
                  <span>DOMAIN #{idx + 1}</span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
