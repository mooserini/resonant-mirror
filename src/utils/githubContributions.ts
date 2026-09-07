import { ContributionDay, ContributionSummary, HeatmapPhosphorMode } from '../types';

export const PHOSPHOR_PALETTES: Record<HeatmapPhosphorMode, {
  name: string;
  code: string;
  wavelength: string;
  colors: [string, string, string, string, string]; // levels 0..4
  accentGlow: string;
  bgRaster: string;
  borderColor: string;
  labelColor: string;
}> = {
  green: {
    name: 'P1 GREEN PHOSPHOR',
    code: 'IBM 5151 (525nm)',
    wavelength: '525 nm',
    colors: ['#0d1c10', '#144621', '#237b3b', '#39bc59', '#55ff77'],
    accentGlow: 'rgba(85, 255, 119, 0.45)',
    bgRaster: '#060d08',
    borderColor: '#237b3b',
    labelColor: '#39bc59',
  },
  amber: {
    name: 'P3 AMBER PHOSPHOR',
    code: 'MDA 12" (590nm)',
    wavelength: '590 nm',
    colors: ['#1c1304', '#4c2e08', '#865510', '#c9851c', '#ffb533'],
    accentGlow: 'rgba(255, 181, 51, 0.45)',
    bgRaster: '#0d0902',
    borderColor: '#865510',
    labelColor: '#c9851c',
  },
  white: {
    name: 'P4 WHITE PHOSPHOR',
    code: 'PAPER WHITE (400-700nm)',
    wavelength: 'White / Broad',
    colors: ['#121212', '#363636', '#6e6e6e', '#aaaaaa', '#efefef'],
    accentGlow: 'rgba(240, 240, 240, 0.4)',
    bgRaster: '#080808',
    borderColor: '#6e6e6e',
    labelColor: '#aaaaaa',
  },
  cga: {
    name: 'CGA CYAN / AZURE',
    code: 'RGBI COLOR 03/11',
    wavelength: '480 nm',
    colors: ['#07141f', '#0f3856', '#1a6598', '#2a98dd', '#55ffff'],
    accentGlow: 'rgba(85, 255, 255, 0.45)',
    bgRaster: '#030a10',
    borderColor: '#1a6598',
    labelColor: '#2a98dd',
  },
};

const REPO_NAMES = [
  'mooserini/hermes-house-kernel',
  'mooserini/resmirror-cga-engine',
  'mooserini/fido2-firmware-layer',
  'mooserini/qwen-kv-cache-allocator',
  'mooserini/hf-mooserini-models',
  'mooserini/sendblue-imessage-bridge',
  'mooserini/bitwarden-gpg-sync',
];

/**
 * Deterministically generates ~52 weeks (364 days) of contribution history
 * with realistic commit spikes, streaks, and weekends.
 */
export function generateContributionData(referenceDate = new Date('2026-09-07T12:00:00')): {
  days: ContributionDay[];
  summary: ContributionSummary;
} {
  const days: ContributionDay[] = [];
  const totalWeeks = 52;
  const totalDays = totalWeeks * 7; // 364 days

  // Compute start date so referenceDate is at the end of the 52-week grid
  const refDayOfWeek = referenceDate.getDay(); // 0 = Sun, 6 = Sat
  const endDate = new Date(referenceDate);
  endDate.setHours(0, 0, 0, 0);

  // We align to full weeks: ending on the current week's Saturday
  const daysToEndOfWeek = 6 - refDayOfWeek;
  const gridEnd = new Date(endDate);
  gridEnd.setDate(endDate.getDate() + daysToEndOfWeek);

  const gridStart = new Date(gridEnd);
  gridStart.setDate(gridEnd.getDate() - (totalDays - 1));

  let totalCommits = 0;
  let activeDaysCount = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let busiest = { date: '', count: 0 };

  // Pseudo-random deterministic generator based on seed
  let seed = 90251984;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const cur = new Date(gridStart);
  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = cur.getDay();
    const weekIndex = Math.floor(i / 7);
    const dateStr = cur.toISOString().split('T')[0];

    // Determine probability and count based on day of week and periodic waves
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const wave = Math.sin(i / 14) * 0.3 + Math.cos(i / 29) * 0.2; // Seasonal activity surges
    const rand = pseudoRandom();

    let count = 0;
    const activityThreshold = isWeekend ? 0.45 : 0.22;

    if (rand + wave > activityThreshold) {
      if (rand > 0.94) {
        count = Math.floor(pseudoRandom() * 12) + 12; // Peak sprint: 12-24 commits
      } else if (rand > 0.78) {
        count = Math.floor(pseudoRandom() * 6) + 6; // High day: 6-11 commits
      } else if (rand > 0.45) {
        count = Math.floor(pseudoRandom() * 4) + 2; // Medium day: 2-5 commits
      } else {
        count = 1; // Light day: 1 commit
      }
    }

    // Do not show future commits if cur > referenceDate
    if (cur > referenceDate) {
      count = 0;
    }

    // Map count to level 0..4
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 12) level = 4;
    else if (count >= 7) level = 3;
    else if (count >= 3) level = 2;
    else if (count >= 1) level = 1;

    const repoHint = count > 0 ? REPO_NAMES[Math.floor(pseudoRandom() * REPO_NAMES.length)] : undefined;

    days.push({
      date: dateStr,
      count,
      level,
      weekday: dayOfWeek,
      weekIndex,
      repoHint,
    });

    if (count > 0) {
      totalCommits += count;
      activeDaysCount++;
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      if (count > busiest.count) {
        busiest = { date: dateStr, count };
      }
    } else {
      tempStreak = 0;
    }

    cur.setDate(cur.getDate() + 1);
  }

  // Calculate current streak from the end backwards
  for (let i = days.length - 1; i >= 0; i--) {
    if (new Date(days[i].date) > referenceDate) continue;
    if (days[i].count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    days,
    summary: {
      totalContributions: totalCommits,
      currentStreak,
      longestStreak,
      busiestDay: busiest,
      activeDaysCount,
    },
  };
}
