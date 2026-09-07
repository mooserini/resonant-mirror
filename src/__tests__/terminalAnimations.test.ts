import {
  SPINNING_GLOBE_FRAMES,
  LOADING_CURSOR_FRAMES,
  DISK_SEEK_FRAMES,
  ANIMATION_REGISTRY,
  TerminalAnimationHelper,
  getAnimationForCommand,
} from '../utils/terminalAnimations';

describe('DOS Terminal Animation Helper & ASCII Frame Sequences', () => {
  describe('ASCII Art Frame Sets', () => {
    test('SPINNING_GLOBE_FRAMES contains 3 rotating wireframe frames', () => {
      expect(SPINNING_GLOBE_FRAMES).toHaveLength(3);
      expect(SPINNING_GLOBE_FRAMES[0]).toContain('ORBITAL ROTATION: 000°');
      expect(SPINNING_GLOBE_FRAMES[1]).toContain('ORBITAL ROTATION: 120°');
      expect(SPINNING_GLOBE_FRAMES[2]).toContain('ORBITAL ROTATION: 240°');
    });

    test('LOADING_CURSOR_FRAMES contains 4 rotating cursor/bus frames', () => {
      expect(LOADING_CURSOR_FRAMES).toHaveLength(4);
      expect(LOADING_CURSOR_FRAMES[0]).toContain('[ | ]');
      expect(LOADING_CURSOR_FRAMES[1]).toContain('[ / ]');
      expect(LOADING_CURSOR_FRAMES[2]).toContain('[ ─ ]');
      expect(LOADING_CURSOR_FRAMES[3]).toContain('[ \\ ]');
    });

    test('DISK_SEEK_FRAMES contains 3 ST-225 cylinder seek frames', () => {
      expect(DISK_SEEK_FRAMES).toHaveLength(3);
      expect(DISK_SEEK_FRAMES[0]).toContain('CYL: 042');
      expect(DISK_SEEK_FRAMES[1]).toContain('CYL: 188');
      expect(DISK_SEEK_FRAMES[2]).toContain('CYL: 306');
    });
  });

  describe('TerminalAnimationHelper Class', () => {
    test('cycles through frames sequentially and loops around', () => {
      const helper = new TerminalAnimationHelper('globe');
      expect(helper.getType()).toBe('globe');
      expect(helper.getFrameCount()).toBe(3);
      expect(helper.getFrameIndex()).toBe(0);
      expect(helper.getCurrentFrame()).toBe(SPINNING_GLOBE_FRAMES[0]);

      // Step to frame 1
      const frame1 = helper.nextFrame();
      expect(frame1).toBe(SPINNING_GLOBE_FRAMES[1]);
      expect(helper.getFrameIndex()).toBe(1);

      // Step to frame 2
      const frame2 = helper.nextFrame();
      expect(frame2).toBe(SPINNING_GLOBE_FRAMES[2]);
      expect(helper.getFrameIndex()).toBe(2);

      // Loops back to frame 0
      const loopFrame = helper.nextFrame();
      expect(loopFrame).toBe(SPINNING_GLOBE_FRAMES[0]);
      expect(helper.getFrameIndex()).toBe(0);
    });

    test('setType switches animation mode and resets frame index', () => {
      const helper = new TerminalAnimationHelper('globe');
      helper.nextFrame();
      expect(helper.getFrameIndex()).toBe(1);

      helper.setType('cursor');
      expect(helper.getType()).toBe('cursor');
      expect(helper.getFrameIndex()).toBe(0);
      expect(helper.getCurrentFrame()).toBe(LOADING_CURSOR_FRAMES[0]);
      expect(helper.getFrameCount()).toBe(4);
    });

    test('reset restores frame index to 0', () => {
      const helper = new TerminalAnimationHelper('disk');
      helper.nextFrame();
      helper.nextFrame();
      expect(helper.getFrameIndex()).toBe(2);

      helper.reset();
      expect(helper.getFrameIndex()).toBe(0);
      expect(helper.getCurrentFrame()).toBe(DISK_SEEK_FRAMES[0]);
    });
  });

  describe('getAnimationForCommand mapping', () => {
    test('routes network and identity commands to globe animation', () => {
      expect(getAnimationForCommand('whois')).toBe('globe');
      expect(getAnimationForCommand('WHOIS')).toBe('globe');
      expect(getAnimationForCommand('gpg')).toBe('globe');
      expect(getAnimationForCommand('orcid')).toBe('globe');
      expect(getAnimationForCommand('fido')).toBe('globe');
      expect(getAnimationForCommand('matrix')).toBe('globe');
    });

    test('routes disk and file catalog commands to disk seek animation', () => {
      expect(getAnimationForCommand('dir')).toBe('disk');
      expect(getAnimationForCommand('DIR /w')).toBe('disk');
      expect(getAnimationForCommand('type CONFIG.SYS')).toBe('disk');
      expect(getAnimationForCommand('stats')).toBe('disk');
      expect(getAnimationForCommand('sysinfo')).toBe('disk');
      expect(getAnimationForCommand('projects')).toBe('disk');
      expect(getAnimationForCommand('skills')).toBe('disk');
    });

    test('routes general commands to loading cursor animation', () => {
      expect(getAnimationForCommand('help')).toBe('cursor');
      expect(getAnimationForCommand('ver')).toBe('cursor');
      expect(getAnimationForCommand('theme dark')).toBe('cursor');
      expect(getAnimationForCommand('unknown_cmd')).toBe('cursor');
    });
  });

  describe('ANIMATION_REGISTRY', () => {
    test('contains valid intervals and frame collections for all modes', () => {
      expect(ANIMATION_REGISTRY.globe.intervalMs).toBeGreaterThan(50);
      expect(ANIMATION_REGISTRY.cursor.intervalMs).toBeGreaterThan(50);
      expect(ANIMATION_REGISTRY.disk.intervalMs).toBeGreaterThan(50);

      expect(ANIMATION_REGISTRY.globe.frames.length).toBeGreaterThanOrEqual(3);
      expect(ANIMATION_REGISTRY.cursor.frames.length).toBeGreaterThanOrEqual(3);
      expect(ANIMATION_REGISTRY.disk.frames.length).toBeGreaterThanOrEqual(3);
    });
  });
});
