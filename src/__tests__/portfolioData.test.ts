import { 
  PERSONAL_INFO, 
  PROJECTS, 
  SKILL_CATEGORIES, 
  BLOG_POSTS, 
  BOOT_SEQUENCE_STEPS,
  GPG_ARMORED_PUBLIC_KEY
} from '../data/portfolioData';

describe('Portfolio Static Data & Integrity', () => {
  test('PERSONAL_INFO contains expected verified credentials', () => {
    expect(PERSONAL_INFO.name).toBe('Thomas Kenny');
    expect(PERSONAL_INFO.email).toBe('tom@getadongle.com');
    expect(PERSONAL_INFO.orcid).toBe('0009-0000-9987-6106');
    expect(PERSONAL_INFO.gpgKeyId).toBe('17B5 86FD 7394 2305');
    expect(PERSONAL_INFO.gpgFingerprint).toBe('E7B3 223E A0F0 3348 C674 7EBA 17B5 86FD 7394 2305');
    expect(PERSONAL_INFO.githubUrl).toContain('mooserini');
  });

  test('GPG armored key block has valid header and checksum markers', () => {
    expect(GPG_ARMORED_PUBLIC_KEY).toContain('-----BEGIN PGP PUBLIC KEY BLOCK-----');
    expect(GPG_ARMORED_PUBLIC_KEY).toContain('-----END PGP PUBLIC KEY BLOCK-----');
    expect(GPG_ARMORED_PUBLIC_KEY).toContain('=mMJH');
  });

  test('project sources point to specific repositories or contributions, not profile placeholders', () => {
    expect(new Set(PROJECTS.map(p => p.id)).size).toBe(PROJECTS.length);
    for (const project of PROJECTS) {
      const source = new URL(project.repoUrl);
      expect(source.protocol).toBe('https:');
      expect(source.hostname).toBe('github.com');
      if (project.sourceKind === 'repository') {
        expect(source.pathname).toMatch(/^\/mooserini\/[^/]+$/);
      } else {
        expect(source.pathname).toMatch(/^\/[^/]+\/[^/]+\/(pull|commit)\/[^/]+$/);
      }
    }
  });

  test('SKILL_CATEGORIES covers 5 essential technical domains', () => {
    expect(SKILL_CATEGORIES.length).toBe(5);
    const titles = SKILL_CATEGORIES.map((c) => c.title);
    expect(titles).toContain('Systems & Architecture');
    expect(titles).toContain('Security & Cryptography');
    expect(titles).toContain('Retro & Visual Craftsmanship');
  });

  test('BOOT_SEQUENCE_STEPS has valid sequencing and text steps', () => {
    expect(BOOT_SEQUENCE_STEPS.length).toBeGreaterThanOrEqual(8);
    expect(BOOT_SEQUENCE_STEPS[0].text).toContain('AT&T Personal Computer 6300');
    expect(BOOT_SEQUENCE_STEPS[BOOT_SEQUENCE_STEPS.length - 1].text).toContain('ALL SYSTEMS NOMINAL');
  });
});
