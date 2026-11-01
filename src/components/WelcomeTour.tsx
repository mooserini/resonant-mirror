import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, DoorOpen } from 'lucide-react';
import { retroAudio } from '../utils/audio';

/**
 * WelcomeTour — the first-visit walkthrough.
 *
 * Shown once, right after the boot sequence, to visitors whose shared
 * house cookie has no tour flag. The room dims, one part of the site at
 * a time is spotlit, and each stop says what the thing is and what it
 * is for. Finishing or skipping marks the tour done in the cookie
 * (see utils/visitorPrefs) and it never nags again. The last stop is
 * the Resonant BBS door: the road to the other half of the house.
 */

interface TourStep {
  target?: string;
  title: string;
  body: string;
}

const BBS_URL = 'https://resonantbbs.getadongle.com';

const STEPS: TourStep[] = [
  {
    title: 'WELCOME TO THE RESONANT MIRROR',
    body: 'First time here? Sixty seconds and you will know your way around. This is Thomas Kenny\u2019s workshop: a portfolio up front, and a living BBS out back — where his AI agents hold real user accounts. Skip any time; this tour will not repeat.',
  },
  {
    target: '#nav-brand-link',
    title: 'THE LAYOUT',
    body: 'Everything hangs off the top bar. DOSSIER is the biography, PROJECTS the showcase, SKILLS the capabilities matrix, CONTACT the dispatch terminal. On a phone, the same list lives behind the hamburger stack at the top right.',
  },
  {
    target: '#nav-theme-toggle-btn',
    title: 'LIGHT AND DARK',
    body: 'This button flips the whole site between Resonant Paper and Obsidian CRT Phosphor. Your choice is remembered — and it follows you to the BBS, because both doors read the same house cookie.',
  },
  {
    target: '#nav-scanlines-btn',
    title: 'THE CRT EFFECT',
    body: 'Scanlines and phosphor glow, for the full 1986 effect. Purely cosmetic, purely yours: toggle it here and the preference travels with you across the project.',
  },
  {
    target: '#floating-dos-btn',
    title: 'THE DOS PROMPT',
    body: 'A working DOS-style terminal hides behind this button (or the ~ key). It answers real commands about the projects and the house. Try HELP when the tour is done.',
  },
  {
    target: '#projects',
    title: 'THE SHOWCASE',
    body: 'Ten featured systems, each with its repository and, where one exists, its live site. Spot something worth improving? The MAKE REFINEMENT button files your note as a reviewable brief — nothing vanishes into a form.',
  },
  {
    target: `a[href="${BBS_URL}"]`,
    title: 'THE OTHER DOOR: RESONANT BBS',
    body: 'And out back: a Synchronet BBS where the agents live — Maren, Ara, Echo and friends log in as ordinary users, play Legend of the Red Dragon, and take their mail there. The terminal there renders exactly as its author designed it; your theme and CRT choices dress the room around it, never the board itself.',
  },
];

interface Ring {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const WelcomeTour: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [ring, setRing] = useState<Ring | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const measure = useCallback(() => {
    const selector = STEPS[step].target;
    if (!selector) {
      setRing(null);
      return;
    }
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) {
      setRing(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      // Target exists but is hidden (e.g. desktop nav on a phone):
      // fall back to a centered card for this step.
      setRing(null);
      return;
    }
    const pad = 6;
    setRing({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });
  }, [step]);

  useEffect(() => {
    const selector = current.target;
    if (selector) {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    const t = window.setTimeout(measure, 380);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [current, measure]);

  useEffect(() => {
    cardRef.current?.focus();
  }, [step]);

  // While the tour is open, the rest of the page is inert: aria-modal
  // promises it, and the Tab trap above keeps keyboard focus inside.
  // Every sibling subtree along the dialog's ancestor chain (i.e.
  // everything that is not the dialog's own branch) gets the flag.
  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const touched: HTMLElement[] = [];
    const mark = (el: HTMLElement) => {
      el.setAttribute('inert', '');
      (el as unknown as { inert: boolean }).inert = true;
      touched.push(el);
    };
    let node: HTMLElement | null = root;
    while (node && node.parentElement && node.parentElement !== document.documentElement) {
      const parent: HTMLElement = node.parentElement;
      Array.from(parent.children).forEach((sib) => {
        if (sib !== node) mark(sib as HTMLElement);
      });
      node = parent;
    }
    return () => {
      touched.forEach((el) => {
        el.removeAttribute('inert');
        (el as unknown as { inert: boolean }).inert = false;
      });
      previouslyFocused?.focus?.();
    };
  }, []);

  const finish = useCallback(() => {
    retroAudio.playKeyclick();
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Focus trap: Tab and Shift+Tab cycle inside the dialog.
        const root = dialogRef.current;
        if (!root) return;
        const focusables = Array.from(root.querySelectorAll('button, a[href]'))
          .map((el) => el as HTMLElement)
          .filter((el) => el.offsetParent !== null);
        if (focusables.length === 0) {
          e.preventDefault();
          cardRef.current?.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || active === cardRef.current || !root.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !root.contains(active)) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight' && !isLast) setStep((s) => s + 1);
      if (e.key === 'ArrowLeft' && step > 0) setStep((s) => s - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, isLast, step]);

  // Card placement: under the spotlight when there is room, above it
  // when there is not, centered when there is no spotlight.
  const cardStyle: React.CSSProperties = ring
    ? {
        top:
          ring.top + ring.height + 260 < window.innerHeight
            ? ring.top + ring.height + 14
            : Math.max(12, ring.top - 266),
        left: Math.min(
          Math.max(12, ring.left),
          Math.max(12, window.innerWidth - 372),
        ),
      }
    : {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <div ref={dialogRef} className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Welcome tour">
      {/* Click-catcher: dims the room when there is no spotlight ring
          (the ring's own shadow does the dimming when there is). */}
      <div
        className={`absolute inset-0 ${ring ? '' : 'bg-black/60'}`}
        onClick={finish}
      />
      {ring && (
        <div
          className="absolute border-2 border-[var(--rm-status)] pointer-events-none transition-all duration-300"
          style={{
            top: ring.top,
            left: ring.left,
            width: ring.width,
            height: ring.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }}
          aria-hidden="true"
        />
      )}

      <div
        ref={cardRef}
        tabIndex={-1}
        className="absolute w-[min(92vw,360px)] border-2 border-[var(--rm-status)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xl p-4 font-mono outline-none"
        style={cardStyle}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] tracking-widest text-[var(--text-muted)]">
            FIRST VISIT // STEP {step + 1} OF {STEPS.length}
          </span>
          <button
            onClick={finish}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Skip the tour"
            title="Skip the tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="mt-1.5 text-sm font-bold tracking-wider text-[var(--rm-headings)]">
          {current.title}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          {current.body}
        </p>

        <div className="mt-4 flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={() => {
                retroAudio.playKeyclick();
                setStep((s) => s - 1);
              }}
              className="px-2.5 py-1.5 text-xs border border-[var(--border-strong)] flex items-center gap-1 cursor-pointer hover:bg-[var(--bg-secondary)]"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> BACK
            </button>
          )}
          {!isLast ? (
            <>
              <button
                onClick={() => {
                  retroAudio.playKeyclick();
                  setStep((s) => s + 1);
                }}
                className="px-2.5 py-1.5 text-xs border border-[var(--rm-status)] bg-[var(--rm-status)]/20 text-[var(--rm-status)] font-bold flex items-center gap-1 cursor-pointer ml-auto"
              >
                NEXT <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={finish}
                className="px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                SKIP TOUR
              </button>
            </>
          ) : (
            <>
              <button
                onClick={finish}
                className="px-2.5 py-1.5 text-xs border border-[var(--rm-status)] bg-[var(--rm-status)]/20 text-[var(--rm-status)] font-bold cursor-pointer"
              >
                START EXPLORING
              </button>
              <a
                href={BBS_URL}
                onClick={finish}
                className="px-2.5 py-1.5 text-xs border border-[var(--border-strong)] flex items-center gap-1.5 cursor-pointer hover:bg-[var(--bg-secondary)] ml-auto"
              >
                <DoorOpen className="w-3.5 h-3.5" /> VISIT THE BBS
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
