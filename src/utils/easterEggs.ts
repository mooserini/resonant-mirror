import { Achievement } from '../types';

export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  {
    id: 'seq-lineage',
    title: 'HERMES ARCHIVE AUDITOR',
    badge: '🔏',
    description: 'Audited the complete identity vector: WHOIS dossier, ORCID researcher index, and GPG master key.',
    category: 'cryptography',
    points: 150,
  },
  {
    id: 'seq-hardware',
    title: '8086 HARDWARE WHISPERER',
    badge: '⚡',
    description: 'Queried Intel 8086 diagnostics and sounded the 890Hz square-wave diagnostic speaker tone.',
    category: 'hardware',
    points: 75,
  },
  {
    id: 'seq-autoexec',
    title: 'AUTOEXEC COMMANDER',
    badge: '💾',
    description: 'Inspected FAT12 directory entries and dumped the system bootstrap configuration batch files.',
    category: 'retro',
    points: 100,
  },
  {
    id: 'seq-phosphor',
    title: 'TRI-PHOSPHOR SYNESTHETE',
    badge: '📺',
    description: 'Stepped the 80s electron raster beam across all 3 ASCII frame engines: Globe, Cursor, and Disk Seek.',
    category: 'retro',
    points: 125,
  },
  {
    id: 'seq-matrix',
    title: 'PHOSPHOR CASCADE DIVER',
    badge: '🟢',
    description: 'Cleared the frame buffer and initiated a full 640x400 Mode 06h green phosphor memory register cascade.',
    category: 'exploration',
    points: 80,
  },
  {
    id: 'adv-1976',
    title: 'COLOSSAL CAVE ADVENTURER',
    badge: '⚔️',
    description: 'Uttered the mystic word "XYZZY". A hollow voice murmurs from deep within the subterranean caverns.',
    category: 'secret',
    points: 50,
  },
  {
    id: 'wargames-1983',
    title: 'NORAD DEFENSE OVERRIDE',
    badge: '☢️',
    description: 'Invoked the Falken backdoor "JOSHUA". A strange game: the only winning move is not to play.',
    category: 'secret',
    points: 100,
  },
  {
    id: 'doom-1993',
    title: 'DEGOO ELECTRONICS GOD MODE',
    badge: '💀',
    description: 'Invoked IDDQD / IDKFA. Degoo electronics invulnerability and high-energy ammo caches enabled.',
    category: 'secret',
    points: 100,
  },
  {
    id: 'hack-1995',
    title: 'GIBSON SUPERCOMPUTER INFILTRATOR',
    badge: '🕶️',
    description: 'Mess with the best, die like the rest. Commenced cyberdeck root penetration on port 0x3F8.',
    category: 'secret',
    points: 100,
  },
  {
    id: 'konami-1986',
    title: 'KONAMI CODE VETERAN',
    badge: '🕹️',
    description: '↑ ↑ ↓ ↓ ← → ← → B A. 30 extra system lives allocated to base 640KB RAM registers.',
    category: 'secret',
    points: 100,
  },
];

const STORAGE_KEY = 'hermes_unlocked_achievements';

// Memory fallback for environments without localStorage or SSR
let memoryStore: Record<string, string> = {};

export function getUnlockedAchievementsMap(): Record<string, string> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...memoryStore };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return { ...memoryStore };
  }
}

export function saveUnlockedAchievementsMap(map: Record<string, string>): void {
  memoryStore = { ...map };
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Storage quota or disabled
    }
  }
}

export function getAllAchievements(): (Achievement & { isUnlocked: boolean })[] {
  const map = getUnlockedAchievementsMap();
  return ACHIEVEMENTS_CATALOG.map((a) => ({
    ...a,
    isUnlocked: Boolean(map[a.id]),
    unlockedAt: map[a.id],
  }));
}

export function unlockAchievement(id: string): Achievement | null {
  const catalogItem = ACHIEVEMENTS_CATALOG.find((a) => a.id === id);
  if (!catalogItem) return null;

  const map = getUnlockedAchievementsMap();
  if (map[id]) {
    // Already unlocked
    return null;
  }

  const now = new Date().toISOString();
  map[id] = now;
  saveUnlockedAchievementsMap(map);

  return {
    ...catalogItem,
    unlockedAt: now,
  };
}

export function resetAchievements(): void {
  memoryStore = {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

/**
 * Command sequence tracker & evaluator
 * Inspects the current command along with past history to uncover Easter Eggs
 */
export function evaluateCommandForEasterEggs(
  rawCommand: string,
  history: string[]
): Achievement[] {
  const cmd = rawCommand.trim().toLowerCase();
  const normalizedHistory = history.map((h) => h.trim().toLowerCase());
  const fullSeq = [...normalizedHistory, cmd];
  const lastFive = fullSeq.slice(-5);
  const lastTen = fullSeq.slice(-10);

  const newlyUnlocked: Achievement[] = [];

  const tryUnlock = (id: string) => {
    const achievement = unlockAchievement(id);
    if (achievement) {
      newlyUnlocked.push(achievement);
    }
  };

  // 1. Direct Secret Keywords
  if (cmd === 'xyzzy' || cmd === 'plugh') {
    tryUnlock('adv-1976');
  }

  if (cmd === 'joshua' || cmd === 'wargames' || cmd === 'falken') {
    tryUnlock('wargames-1983');
  }

  if (cmd === 'iddqd' || cmd === 'idkfa') {
    tryUnlock('doom-1993');
  }

  if (
    cmd === 'hack' ||
    cmd === 'hack the planet' ||
    cmd === 'zero cool' ||
    cmd === 'crash override'
  ) {
    tryUnlock('hack-1995');
  }

  if (cmd === 'konami' || cmd === 'uuddlrlrba') {
    tryUnlock('konami-1986');
  }

  // 2. Sequence Triggers
  // Lineage: contains 'whois', 'orcid', and 'gpg' in recent 10 commands
  const hasWhois = lastTen.some((c) => c.startsWith('whois'));
  const hasOrcid = lastTen.some((c) => c.startsWith('orcid'));
  const hasGpg = lastTen.some((c) => c.startsWith('gpg'));
  if (hasWhois && hasOrcid && hasGpg) {
    tryUnlock('seq-lineage');
  }

  // Hardware: 'stats' followed by 'beep' in the last 4 commands
  const hasStats = lastFive.some((c) => c.startsWith('stats') || c.startsWith('sysinfo'));
  const hasBeep = lastFive.some((c) => c.startsWith('beep'));
  if (hasStats && hasBeep) {
    tryUnlock('seq-hardware');
  }

  // Autoexec: 'dir' followed by 'type config.sys' or 'type autoexec.bat'
  const hasDir = lastFive.some((c) => c.startsWith('dir'));
  const hasTypeBoot = lastFive.some(
    (c) =>
      c.includes('type config.sys') ||
      c.includes('type autoexec.bat') ||
      c.includes('type biography.txt')
  );
  if (hasDir && hasTypeBoot) {
    tryUnlock('seq-autoexec');
  }

  // Phosphor: user checked or ran all 3 anim modes
  const hasGlobe = lastTen.some((c) => c.includes('anim globe') || c === 'globe');
  const hasCursor = lastTen.some((c) => c.includes('anim cursor') || c === 'cursor');
  const hasDisk = lastTen.some((c) => c.includes('anim disk') || c === 'disk');
  if (hasGlobe && hasCursor && hasDisk) {
    tryUnlock('seq-phosphor');
  }

  // Matrix: 'cls' followed by 'matrix'
  const hasCls = lastFive.some((c) => c === 'cls' || c === 'clear');
  const hasMatrix = lastFive.some((c) => c === 'matrix');
  if (hasCls && hasMatrix) {
    tryUnlock('seq-matrix');
  }

  return newlyUnlocked;
}

/**
 * Formats a terminal-friendly ASCII scorecard for the ACHIEVEMENTS command
 */
export function formatAchievementsScorecard(): string {
  const list = getAllAchievements();
  const unlockedCount = list.filter((a) => a.isUnlocked).length;
  const totalCount = list.length;
  const totalPoints = list.reduce((acc, a) => (a.isUnlocked ? acc + a.points : acc), 0);
  const maxPoints = list.reduce((acc, a) => acc + a.points, 0);

  const percent = Math.round((unlockedCount / totalCount) * 100);
  const filledBars = Math.round((percent / 100) * 24);
  const emptyBars = 24 - filledBars;
  const progressBar = `[${'█'.repeat(filledBars)}${'░'.repeat(emptyBars)}] ${percent}%`;

  const header = `╔══════════════════════════════════════════════════════════════════════╗
║             AT&T PC6300 RETRO EASTER EGG & ACHIEVEMENTS              ║
╚══════════════════════════════════════════════════════════════════════╝
STATUS: ${unlockedCount}/${totalCount} UNLOCKED   SCORE: ${totalPoints}/${maxPoints} PTS
PROGRESS: ${progressBar}
────────────────────────────────────────────────────────────────────────`;

  const items = list
    .map((item) => {
      const mark = item.isUnlocked ? '[★ UNLOCKED]' : '[░ LOCKED ░]';
      const dateStr = item.unlockedAt
        ? ` (${new Date(item.unlockedAt).toLocaleDateString()})`
        : '';
      const badge = item.badge;
      const title = `${badge} ${item.title} - ${item.points} PTS`;
      const desc = item.isUnlocked
        ? item.description
        : 'Classified sequence. Experiment with DOS command combinations to uncover.';
      return `${mark} ${title}${dateStr}\n         ${desc}`;
    })
    .join('\n\n');

  const footer = `────────────────────────────────────────────────────────────────────────
HINT: Type secret keywords or combine commands (e.g. STATS+BEEP, WHOIS+GPG+ORCID).
Interactive toast will alert whenever a new achievement register triggers.`;

  return `${header}\n\n${items}\n\n${footer}`;
}
