import {
  evaluateCommandForEasterEggs,
  getAllAchievements,
  resetAchievements,
  formatAchievementsScorecard,
  ACHIEVEMENTS_CATALOG,
} from '../utils/easterEggs';

describe('Retro Easter Eggs & Achievements System', () => {
  beforeEach(() => {
    resetAchievements();
  });

  test('catalog contains 10 distinct retro-themed achievements', () => {
    expect(ACHIEVEMENTS_CATALOG).toHaveLength(10);
    const ids = ACHIEVEMENTS_CATALOG.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });

  describe('Secret Keyword Easter Eggs', () => {
    test('xyzzy / plugh unlocks Colossal Cave Adventurer', () => {
      const unlocked = evaluateCommandForEasterEggs('xyzzy', []);
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('adv-1976');
      expect(unlocked[0].title).toBe('COLOSSAL CAVE ADVENTURER');

      // Subsequent call does not duplicate
      const secondCall = evaluateCommandForEasterEggs('plugh', []);
      expect(secondCall).toHaveLength(0);
    });

    test('joshua / wargames unlocks NORAD Defense Override', () => {
      const unlocked = evaluateCommandForEasterEggs('joshua', []);
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('wargames-1983');
      expect(unlocked[0].title).toBe('NORAD DEFENSE OVERRIDE');
    });

    test('iddqd / idkfa unlocks Degoo Electronics God Mode', () => {
      const unlocked = evaluateCommandForEasterEggs('iddqd', []);
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('doom-1993');
      expect(unlocked[0].title).toBe('DEGOO ELECTRONICS GOD MODE');
    });

    test('hack / hack the planet unlocks Gibson Supercomputer Infiltrator', () => {
      const unlocked = evaluateCommandForEasterEggs('hack the planet', []);
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('hack-1995');
      expect(unlocked[0].title).toBe('GIBSON SUPERCOMPUTER INFILTRATOR');
    });

    test('konami code command unlocks Konami Code Veteran', () => {
      const unlocked = evaluateCommandForEasterEggs('konami', []);
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('konami-1986');
      expect(unlocked[0].title).toBe('KONAMI CODE VETERAN');
    });
  });

  describe('Multi-Step Command Sequences', () => {
    test('lineage sequence (whois + orcid + gpg) unlocks Hermes Archive Auditor', () => {
      // Typing whois, then orcid, then gpg
      const step1 = evaluateCommandForEasterEggs('whois', []);
      expect(step1).toHaveLength(0);

      const step2 = evaluateCommandForEasterEggs('orcid', ['whois']);
      expect(step2).toHaveLength(0);

      const step3 = evaluateCommandForEasterEggs('gpg', ['whois', 'orcid']);
      expect(step3).toHaveLength(1);
      expect(step3[0].id).toBe('seq-lineage');
      expect(step3[0].title).toBe('HERMES ARCHIVE AUDITOR');
    });

    test('hardware sequence (stats + beep) unlocks 8086 Hardware Whisperer', () => {
      const step1 = evaluateCommandForEasterEggs('stats', []);
      expect(step1).toHaveLength(0);

      const step2 = evaluateCommandForEasterEggs('beep', ['stats']);
      expect(step2).toHaveLength(1);
      expect(step2[0].id).toBe('seq-hardware');
      expect(step2[0].title).toBe('8086 HARDWARE WHISPERER');
    });

    test('autoexec sequence (dir + type config.sys) unlocks Autoexec Commander', () => {
      const step1 = evaluateCommandForEasterEggs('dir', []);
      expect(step1).toHaveLength(0);

      const step2 = evaluateCommandForEasterEggs('type CONFIG.SYS', ['dir']);
      expect(step2).toHaveLength(1);
      expect(step2[0].id).toBe('seq-autoexec');
      expect(step2[0].title).toBe('AUTOEXEC COMMANDER');
    });

    test('phosphor sequence (anim globe + anim cursor + anim disk) unlocks Tri-Phosphor Synesthete', () => {
      const unlocked = evaluateCommandForEasterEggs('anim disk', ['anim globe', 'anim cursor']);
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('seq-phosphor');
      expect(unlocked[0].title).toBe('TRI-PHOSPHOR SYNESTHETE');
    });

    test('matrix sequence (cls + matrix) unlocks Phosphor Cascade Diver', () => {
      const unlocked = evaluateCommandForEasterEggs('matrix', ['cls']);
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('seq-matrix');
      expect(unlocked[0].title).toBe('PHOSPHOR CASCADE DIVER');
    });
  });

  describe('Scorecard & Persistence', () => {
    test('formatAchievementsScorecard produces valid ASCII progress dashboard', () => {
      // Initially all locked
      let card = formatAchievementsScorecard();
      expect(card).toContain('STATUS: 0/10 UNLOCKED');
      expect(card).toContain('[░ LOCKED ░]');

      // Unlock one
      evaluateCommandForEasterEggs('xyzzy', []);
      card = formatAchievementsScorecard();
      expect(card).toContain('STATUS: 1/10 UNLOCKED');
      expect(card).toContain('[★ UNLOCKED]');
      expect(card).toContain('COLOSSAL CAVE ADVENTURER');
    });

    test('getAllAchievements reflects unlocked state', () => {
      evaluateCommandForEasterEggs('joshua', []);
      const all = getAllAchievements();
      const wargames = all.find((a) => a.id === 'wargames-1983');
      expect(wargames?.isUnlocked).toBe(true);
      expect(wargames?.unlockedAt).toBeDefined();

      const doom = all.find((a) => a.id === 'doom-1993');
      expect(doom?.isUnlocked).toBe(false);
    });
  });
});
