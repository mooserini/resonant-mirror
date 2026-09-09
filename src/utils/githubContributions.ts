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

export interface PublicContributionCalendar {
  days: Pick<ContributionDay, 'date' | 'count' | 'level'>[];
  totalContributions: number;
  fetchedAt: string;
}

/** Validate source data before displaying it; missing days are not zero activity. */
export function validateCalendar(value: unknown): PublicContributionCalendar {
  if (!value || typeof value !== 'object') throw new Error('Missing calendar');
  const calendar = value as PublicContributionCalendar;
  if (!Array.isArray(calendar.days) || calendar.days.length < 365 || calendar.days.length > 371 ||
      !Number.isSafeInteger(calendar.totalContributions) || calendar.totalContributions < 0 ||
      typeof calendar.fetchedAt !== 'string' || !Number.isFinite(Date.parse(calendar.fetchedAt))) {
    throw new Error('Invalid calendar');
  }
  let previous = 0;
  let total = 0;
  for (const day of calendar.days) {
    if (!day || typeof day.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day.date)) throw new Error('Invalid day');
    const time = Date.parse(day.date + 'T00:00:00Z');
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== day.date ||
        (previous && time - previous !== 86400000) ||
        !Number.isSafeInteger(day.count) || day.count < 0 ||
        !Number.isInteger(day.level) || day.level < 0 || day.level > 4 ||
        (day.count === 0) !== (day.level === 0)) throw new Error('Invalid contribution day');
    previous = time;
    total += day.count;
  }
  if (total !== calendar.totalContributions) throw new Error('Calendar total mismatch');
  return calendar;
}

/** Preserve GitHub's dates and intensity tiers; derive metrics only from those days. */
export function summarizeContributions(calendar: PublicContributionCalendar): {
  days: ContributionDay[];
  summary: ContributionSummary;
} {
  const first = new Date(calendar.days[0].date + 'T00:00:00Z');
  const start = first.getTime() - first.getUTCDay() * 86400000;
  let streak = 0;
  let longestStreak = 0;
  let activeDaysCount = 0;
  let busiestDay = { date: '', count: 0 };
  const days = calendar.days.map(day => {
    const date = new Date(day.date + 'T00:00:00Z');
    streak = day.count > 0 ? streak + 1 : 0;
    longestStreak = Math.max(longestStreak, streak);
    if (day.count > 0) activeDaysCount++;
    if (day.count > busiestDay.count) busiestDay = { date: day.date, count: day.count };
    return { ...day, weekday: date.getUTCDay(), weekIndex: Math.floor((date.getTime() - start) / (7 * 86400000)) };
  });
  return { days, summary: { totalContributions: calendar.totalContributions, currentStreak: streak,
    longestStreak, activeDaysCount, busiestDay } };
}
