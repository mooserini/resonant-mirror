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
    expect(PERSONAL_INFO.gpgKeyId).toBe('F3BE 037D 8488 31E9');
    expect(PERSONAL_INFO.gpgFingerprint).toBe('6033 90B2 EF80 46D6 7DCA FC2C F3BE 037D 8488 31E9');
    expect(PERSONAL_INFO.githubUrl).toContain('mooserini');
  });

  test('GPG armored key block has valid header and checksum markers', () => {
    expect(GPG_ARMORED_PUBLIC_KEY).toContain('-----BEGIN PGP PUBLIC KEY BLOCK-----');
    expect(GPG_ARMORED_PUBLIC_KEY).toContain('-----END PGP PUBLIC KEY BLOCK-----');
    expect(GPG_ARMORED_PUBLIC_KEY).toContain('=7WbX');
  });

  test('PROJECTS array contains Hermes Audit and MD to PDF generator', () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(4);
    const hermes = PROJECTS.find((p) => p.id === 'hermes-audit');
    expect(hermes).toBeDefined();
    expect(hermes?.category).toBe('systems');

    const mdPdf = PROJECTS.find((p) => p.id === 'md-pdf-generator');
    expect(mdPdf).toBeDefined();
    expect(mdPdf?.category).toBe('retro');
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
