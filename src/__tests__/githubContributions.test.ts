import { validateCalendar, summarizeContributions, PHOSPHOR_PALETTES } from '../utils/githubContributions';

function calendar() {
  return {
    fetchedAt: '2026-09-09T01:15:00Z',
    totalContributions: 8,
    days: Array.from({ length: 367 }, (_, i) => ({
      date: new Date(Date.UTC(2025, 8, 7 + i)).toISOString().slice(0, 10),
      count: i >= 363 ? 2 : 0,
      level: (i >= 363 ? 1 : 0) as 0 | 1,
    })),
  };
}

test('retains GitHub counts and levels, includes partial weeks, and derives metrics', () => {
  const { days, summary } = summarizeContributions(validateCalendar(calendar()));
  expect(days).toHaveLength(367);
  expect(days[366]).toEqual({ date: '2026-09-08', count: 2, level: 1, weekday: 2, weekIndex: 52 });
  expect(summary).toEqual({ totalContributions: 8, activeDaysCount: 4, currentStreak: 4,
    longestStreak: 4, busiestDay: { date: '2026-09-05', count: 2 } });
});

test('an inactive last day ends the displayed streak without inventing future days', () => {
  const data = calendar(); data.days[366].count = 0; data.days[366].level = 0; data.totalContributions = 6;
  const { summary } = summarizeContributions(validateCalendar(data));
  expect(summary.currentStreak).toBe(0);
  expect(summary.longestStreak).toBe(3);
});

test('accepts a verified all-zero calendar', () => {
  const data = calendar(); data.days.forEach(day => { day.count = 0; day.level = 0; }); data.totalContributions = 0;
  expect(summarizeContributions(validateCalendar(data)).summary.totalContributions).toBe(0);
});

test.each(['missing', 'duplicate', 'negative', 'level', 'date', 'total', 'empty'])('rejects %s source data instead of displaying fabricated activity', fault => {
  const data = calendar();
  if (fault === 'missing') data.days.splice(100, 1);
  if (fault === 'duplicate') data.days[100] = data.days[99];
  if (fault === 'negative') data.days[100].count = -1;
  if (fault === 'level') data.days[100].level = 1;
  if (fault === 'date') data.days[100].date = '2025-02-30';
  if (fault === 'total') data.totalContributions++;
  if (fault === 'empty') data.days = [];
  expect(() => validateCalendar(data)).toThrow();
});

test('preserves all four CRT palettes', () => {
  Object.values(PHOSPHOR_PALETTES).forEach(palette => {
    expect(palette.colors).toHaveLength(5);
    expect(palette.lightColors).toHaveLength(5);
    expect(palette.lightLabelColor).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
