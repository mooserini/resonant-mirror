import { ASCII_ART_BANNER, ASCII_EMBLEM } from '../components/Logo';

describe('Logo Component & 80s ASCII Art Representation', () => {
  test('ASCII_ART_BANNER contains CP437 block characters representing THE RESONANT MIRROR', () => {
    expect(ASCII_ART_BANNER).toBeDefined();
    expect(typeof ASCII_ART_BANNER).toBe('string');
    expect(ASCII_ART_BANNER.length).toBeGreaterThan(100);
    // Verifies block drawing glyphs
    expect(ASCII_ART_BANNER).toContain('█');
    expect(ASCII_ART_BANNER).toContain('╗');
    expect(ASCII_ART_BANNER).toContain('╝');
  });

  test('ASCII_EMBLEM contains Hermes House archival register text', () => {
    expect(ASCII_EMBLEM).toBeDefined();
    expect(ASCII_EMBLEM).toContain('HERMES HOUSE');
    expect(ASCII_EMBLEM).toContain('THE RESONANT MIRROR');
    expect(ASCII_EMBLEM).toContain('AT&T PC6300');
  });

  test('ASCII_EMBLEM preserves the first-line indentation', () => {
    const [head, face] = ASCII_EMBLEM.split('\n');
    expect(head).toBe('               .---.');
    expect(face).toBe('              /     \\');
  });
});
