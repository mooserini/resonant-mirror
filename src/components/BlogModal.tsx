import React, { useState } from 'react';
import { BookOpen, X, Calendar, Clock, ExternalLink, ArrowLeft } from 'lucide-react';
import { BLOG_POSTS, PERSONAL_INFO } from '../data/portfolioData';
import { BlogPost } from '../types';
import { retroAudio } from '../utils/audio';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlogModal: React.FC<BlogModalProps> = ({ isOpen, onClose }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-mono text-xs sm:text-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-modal-title"
    >
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-strong)] w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Top Rainbow Accent */}
        <div className="rainbow-border-top h-[3px] w-full" />

        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <BookOpen className="w-4 h-4 text-[var(--rm-emphasis)]" />
            <span id="blog-modal-title">THE RESONANT MIRROR — DISPATCHES &amp; ESSAYS</span>
          </div>
          <button
            onClick={() => {
              retroAudio.playKeyclick();
              onClose();
            }}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Close Blog Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {selectedPost ? (
            /* Single Post View */
            <div className="space-y-4">
              <button
                onClick={() => {
                  retroAudio.playKeyclick();
                  setSelectedPost(null);
                }}
                className="retro-btn px-3 py-1 text-xs flex items-center gap-1.5 cursor-pointer font-bold mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>[ BACK TO DISPATCHES INDEX ]</span>
              </button>

              <div className="border-b border-[var(--border-color)] pb-3">
                <span className="text-[10px] text-[var(--rm-emphasis)] font-bold uppercase tracking-wider block">
                  {selectedPost.category} // DISPATCH ID: {selectedPost.id.toUpperCase()}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mt-1">
                  {selectedPost.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedPost.readTime}
                  </span>
                  <span>AUTHOR: {PERSONAL_INFO.name}</span>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                {selectedPost.content.map((p, idx) => (
                  <p key={idx} className="indent-4 sm:indent-6">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            /* Post List View */
            <div className="space-y-4">
              <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                Archive of essays on autonomous systems continuity, CGA font archaeology, and sovereign cryptography by Thomas Kenny.
              </div>

              <div className="space-y-3">
                {BLOG_POSTS.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      retroAudio.playKeyclick();
                      setSelectedPost(post);
                    }}
                    className="p-4 bg-[var(--bg-primary)] border-2 border-[var(--border-strong)] hover:border-[var(--rm-emphasis)] cursor-pointer transition-colors space-y-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] text-[var(--rm-emphasis)] font-bold uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {post.date} • {post.readTime}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] hover:text-[var(--rm-accent-bright)]">
                      {post.title}
                    </h4>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {post.summary}
                    </p>

                    <div className="text-[11px] font-bold text-[var(--rm-accent-bright)] pt-1">
                      [ READ FULL DISPATCH &gt;&gt; ]
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-between items-center text-xs">
          <a
            href={PERSONAL_INFO.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => retroAudio.playKeyclick()}
            className="text-[var(--rm-accent-bright)] hover:underline flex items-center gap-1 font-bold"
          >
            <span>DISPATCHES PERMALINK ({PERSONAL_INFO.blogUrl})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => {
              retroAudio.playKeyclick();
              onClose();
            }}
            className="retro-btn px-4 py-1.5 font-bold cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
