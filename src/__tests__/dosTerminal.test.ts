import { executeTerminalCommand, CommandContext } from '../utils/terminalCommands';

describe('Hidden 80s DOS Terminal Subsystem', () => {
  let mockTheme: 'light' | 'dark' = 'light';
  const mockSetTheme = jest.fn((t: 'light' | 'dark') => {
    mockTheme = t;
  });
  const mockOnReboot = jest.fn();
  const mockOnClose = jest.fn();

  const context: CommandContext = {
    theme: mockTheme,
    setTheme: mockSetTheme,
    fidoSession: {
      isAuthenticated: true,
      credentialId: 'RM-PASSKEY-8086',
      algorithm: 'ES256',
      securityLevel: 'FIDO2 Hardware Key',
      userHandle: 'thomas.kenny',
    },
    onReboot: mockOnReboot,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('help command returns full command list', () => {
    const lines = executeTerminalCommand('help', context);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[0].text).toContain('AT&T PC6300 DOS 3.30 COMMAND SUBSYSTEM');
    expect(lines[0].text).toContain('WHOIS');
    expect(lines[0].text).toContain('STATS');
    expect(lines[0].text).toContain('DIR');
  });

  test('whois command returns Thomas Kenny archival dossier', () => {
    const lines = executeTerminalCommand('whois', context);
    expect(lines.length).toBe(1);
    expect(lines[0].text).toContain('THOMAS KENNY');
    expect(lines[0].text).toContain('tom@getadongle.com');
    expect(lines[0].text).toContain('0009-0000-9987-6106');
    expect(lines[0].text).toContain('F3BE 037D 8488 31E9');
  });

  test('stats command returns 8086 CPU, 640KB RAM, and CGA video', () => {
    const lines = executeTerminalCommand('stats', context);
    expect(lines.length).toBe(1);
    expect(lines[0].text).toContain('Intel 8086-2 CPU @ 8.00 MHz');
    expect(lines[0].text).toContain('640 KB Total');
    expect(lines[0].text).toContain('CGA 640x400');
    expect(lines[0].text).toContain('Seagate ST-225');
  });

  test('dir command returns MS-DOS simulated directory', () => {
    const lines = executeTerminalCommand('dir', context);
    expect(lines.length).toBe(1);
    expect(lines[0].text).toContain('Directory of C:\\RESONANT');
    expect(lines[0].text).toContain('COMMAND  COM');
    expect(lines[0].text).toContain('HERMES   EXE');
    expect(lines[0].text).toContain('CONFIG   SYS');
    expect(lines[0].text).toContain('348160 bytes free');
  });

  test('type command reads simulated files', () => {
    const config = executeTerminalCommand('type CONFIG.SYS', context);
    expect(config[0].text).toContain('DEVICE=C:\\DOS\\ANSI.SYS');
    expect(config[0].text).toContain('BUFFERS=20');

    const missing = executeTerminalCommand('type NONEXISTENT.DAT', context);
    expect(missing[0].type).toBe('error');
    expect(missing[0].text).toContain('File not found');
  });

  test('ver command displays AT&T PC6300 ROM BIOS and MS-DOS version', () => {
    const lines = executeTerminalCommand('ver', context);
    expect(lines[0].text).toContain('AT&T Personal Computer 6300');
    expect(lines[0].text).toContain('MS-DOS Version 3.30');
  });

  test('anim command displays ASCII animation modes catalog or configures mode', () => {
    const catalog = executeTerminalCommand('anim', context);
    expect(catalog[0].text).toContain('ASCII ANIMATION HELPER SUBSYSTEM');
    expect(catalog[0].text).toContain('GLOBE');
    expect(catalog[0].text).toContain('CURSOR');
    expect(catalog[0].text).toContain('DISK');

    const config = executeTerminalCommand('anim globe', context);
    expect(config[0].type).toBe('success');
    expect(config[0].text).toContain('ASCII animation mode configured to "GLOBE"');
  });

  test('badges / achievements command returns formatted ASCII scorecard', () => {
    const lines = executeTerminalCommand('badges', context);
    expect(lines[0].type).toBe('output');
    expect(lines[0].text).toContain('AT&T PC6300 RETRO EASTER EGG & ACHIEVEMENTS');
    expect(lines[0].text).toContain('STATUS:');
    expect(lines[0].text).toContain('SCORE:');
  });

  test('secret easter egg commands produce authentic 80s responses', () => {
    const xyzzy = executeTerminalCommand('xyzzy', context);
    expect(xyzzy[0].type).toBe('success');
    expect(xyzzy[0].text).toContain('Colossal Cave');

    const joshua = executeTerminalCommand('joshua', context);
    expect(joshua[0].type).toBe('success');
    expect(joshua[0].text).toContain('PROFESSOR FALKEN');

    const doom = executeTerminalCommand('iddqd', context);
    expect(doom[0].type).toBe('success');
    expect(doom[0].text).toContain('GOD MODE ACTIVE');

    const konami = executeTerminalCommand('konami', context);
    expect(konami[0].type).toBe('success');
    expect(konami[0].text).toContain('30 EXTRA LIVES');
  });

  test('unknown command returns classic DOS error', () => {
    const lines = executeTerminalCommand('foobar', context);
    expect(lines[0].type).toBe('error');
    expect(lines[0].text).toContain('Bad command or file name: "foobar"');
  });

  test('exit command calls onClose', () => {
    executeTerminalCommand('exit', context);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
