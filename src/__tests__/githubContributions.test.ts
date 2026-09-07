import { generateContributionData, PHOSPHOR_PALETTES } from '../utils/githubContributions';

describe('GitHub Contributions & Monochrome Heatmap Service', () => {
  test('should provide valid phosphor palettes for all 4 display modes', () => {
    const modes = ['green', 'amber', 'white', 'cga'] as const;
    modes.forEach((mode) => {
      const palette = PHOSPHOR_PALETTES[mode];
      expect(palette).toBeDefined();
      expect(palette.colors).toHaveLength(5); // levels 0..4
      expect(palette.bgRaster).toBeDefined();
      expect(palette.accentGlow).toBeDefined();
    });
  });

  test('should generate exactly 364 days (52 full weeks) of contributions', () => {
    const { days, summary } = generateContributionData();
    expect(days).toHaveLength(364);
    expect(summary.totalContributions).toBeGreaterThan(0);
    expect(summary.activeDaysCount).toBeGreaterThan(0);
    expect(summary.longestStreak).toBeGreaterThanOrEqual(summary.currentStreak);
  });

  test('should contain valid intensity levels 0 through 4', () => {
    const { days } = generateContributionData();
    const levels = new Set(days.map((d) => d.level));
    expect(levels.has(0)).toBe(true);
    expect(levels.has(1)).toBe(true);
    expect(levels.has(2)).toBe(true);
    expect(levels.has(3)).toBe(true);
    expect(levels.has(4)).toBe(true);
  });

  test('should associate active days with repository hints', () => {
    const { days } = generateContributionData();
    const activeDays = days.filter((d) => d.count > 0);
    expect(activeDays.length).toBeGreaterThan(50);
    activeDays.forEach((day) => {
      expect(day.repoHint).toBeDefined();
      expect(typeof day.repoHint).toBe('string');
    });
  });

  test('should record busiest day metrics', () => {
    const { summary } = generateContributionData();
    expect(summary.busiestDay.count).toBeGreaterThan(10);
    expect(summary.busiestDay.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
