/**
 * visitorPrefs — one shared cookie for the whole getadongle.com house.
 *
 * The portfolio (www.getadongle.com) and the Resonant BBS
 * (resonantbbs.getadongle.com) are two doors into one project. A cookie
 * scoped to the parent domain lets a visitor's choices follow them
 * through either door:
 *
 *   theme     — 'light' | 'dark'      (mirrors legacy localStorage rm_theme)
 *   scanlines — boolean               (mirrors legacy localStorage rm_scanlines)
 *   tour      — 'done' once the first-visit welcome wizard has been
 *               finished or dismissed; absent means "brand new here"
 *
 * Read precedence is cookie first, then the legacy localStorage keys,
 * so existing visitors keep the settings they already chose. Writes go
 * to the cookie and mirror back to localStorage for older code paths.
 */

export interface VisitorPrefs {
  v: 1;
  theme?: 'light' | 'dark';
  scanlines?: boolean;
  tour?: 'done';
}

const COOKIE_NAME = 'rm_prefs';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // one year

function cookieDomainAttribute(): string {
  if (typeof window === 'undefined') return '';
  // Exact host or a dot-boundary suffix only: a host that merely ends
  // in the string (evilgetadongle.com) must not match (CodeQL).
  const host = window.location.hostname;
  return host === 'getadongle.com' || host.endsWith('.getadongle.com')
    ? '; Domain=.getadongle.com'
    : '';
}

export function readVisitorPrefs(): VisitorPrefs {
  const prefs: VisitorPrefs = { v: 1 };
  if (typeof document !== 'undefined') {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (match) {
      try {
        const parsed = JSON.parse(
          decodeURIComponent(match.slice(COOKIE_NAME.length + 1)),
        ) as VisitorPrefs;
        if (parsed && typeof parsed === 'object') {
          if (parsed.theme === 'light' || parsed.theme === 'dark') prefs.theme = parsed.theme;
          if (typeof parsed.scanlines === 'boolean') prefs.scanlines = parsed.scanlines;
          if (parsed.tour === 'done') prefs.tour = 'done';
        }
      } catch {
        // A malformed cookie is treated as no cookie.
      }
    }
  }
  if (typeof window !== 'undefined') {
    if (prefs.theme === undefined) {
      const saved = window.localStorage.getItem('rm_theme');
      if (saved === 'dark' || saved === 'light') prefs.theme = saved;
    }
    if (prefs.scanlines === undefined) {
      const saved = window.localStorage.getItem('rm_scanlines');
      if (saved !== null) prefs.scanlines = saved === 'true';
    }
  }
  return prefs;
}

export function writeVisitorPrefs(patch: Partial<VisitorPrefs>): VisitorPrefs {
  const prefs = { ...readVisitorPrefs(), ...patch, v: 1 as const };
  if (typeof document !== 'undefined') {
    document.cookie =
      `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(prefs))}` +
      `; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax` +
      cookieDomainAttribute();
  }
  if (typeof window !== 'undefined') {
    if (prefs.theme !== undefined) window.localStorage.setItem('rm_theme', prefs.theme);
    if (prefs.scanlines !== undefined) {
      window.localStorage.setItem('rm_scanlines', String(prefs.scanlines));
    }
  }
  return prefs;
}

export function resolveInitialTheme(): 'light' | 'dark' {
  const { theme } = readVisitorPrefs();
  if (theme !== undefined) return theme;
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function resolveInitialScanlines(): boolean {
  return readVisitorPrefs().scanlines ?? false;
}

export function isTourDone(): boolean {
  return readVisitorPrefs().tour === 'done';
}

export function markTourDone(): void {
  writeVisitorPrefs({ tour: 'done' });
}
