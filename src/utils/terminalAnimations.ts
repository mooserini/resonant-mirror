export type TerminalAnimationType = 'globe' | 'cursor' | 'disk';

/**
 * 80s-Style Spinning Globe ASCII Art Frames (3-frame rotation)
 * Simulates wireframe vector globe latitude/longitude meridian lines rotating.
 */
export const SPINNING_GLOBE_FRAMES: string[] = [
`     .-------.
   /   | (o)   \\
  |  ( |  )  |  |   [AT&T PC6300 BUS SEEK]
   \\   | (o)   /    ORBITAL ROTATION: 000°
     '-------'`,

`     .-------.
   /  ---=---  \\
  |  =========  |   [AT&T PC6300 BUS SEEK]
   \\  ---=---  /    ORBITAL ROTATION: 120°
     '-------'`,

`     .-------.
   /   (o) |   \\
  |  |  (  | )  |   [AT&T PC6300 BUS SEEK]
   \\   (o) |   /    ORBITAL ROTATION: 240°
     '-------'`
];

/**
 * 80s Loading Cursor / Segment Indicator ASCII Art Frames (4-frame cycle)
 */
export const LOADING_CURSOR_FRAMES: string[] = [
`  [ | ] PROCESSING BUS COMMAND...
  ┌───────────────────────────┐
  │ █░░░░░░░░░░░░░░░░░░░░░░░░ │ 08MHz CLOCK
  └───────────────────────────┘`,

`  [ / ] ACCESSING 8086 REGISTERS...
  ┌───────────────────────────┐
  │ ████████░░░░░░░░░░░░░░░░░ │ 08MHz CLOCK
  └───────────────────────────┘`,

`  [ ─ ] PARSING CP437 BUFFER...
  ┌───────────────────────────┐
  │ ████████████████░░░░░░░░░ │ 08MHz CLOCK
  └───────────────────────────┘`,

`  [ \\ ] VERIFYING CHECKSUM CRC...
  ┌───────────────────────────┐
  │ █████████████████████████ │ 08MHz CLOCK
  └───────────────────────────┘`
];

/**
 * 80s MFM Hard Disk Head Seek & Cluster Read Frames (3-frame cycle)
 */
export const DISK_SEEK_FRAMES: string[] = [
`  SEAGATE ST-225 [ CYL: 042 / HD: 0 ]
  SEEK [░░░░░░░░░░░░░░░░] DRIVE C: STEPPING MOTOR ACTIVE`,

`  SEAGATE ST-225 [ CYL: 188 / HD: 2 ]
  READ [████████░░░░░░░░] READING SECTOR INTERLEAVE 3:1`,

`  SEAGATE ST-225 [ CYL: 306 / HD: 3 ]
  SYNC [████████████████] DATA BUFFER LOADED INTO 640K RAM`
];

export interface AnimationConfig {
  type: TerminalAnimationType;
  label: string;
  intervalMs: number;
  frames: string[];
}

export const ANIMATION_REGISTRY: Record<TerminalAnimationType, AnimationConfig> = {
  globe: {
    type: 'globe',
    label: 'SPINNING GLOBE',
    intervalMs: 140,
    frames: SPINNING_GLOBE_FRAMES,
  },
  cursor: {
    type: 'cursor',
    label: 'LOADING CURSOR',
    intervalMs: 120,
    frames: LOADING_CURSOR_FRAMES,
  },
  disk: {
    type: 'disk',
    label: 'DISK MFM SEEK',
    intervalMs: 150,
    frames: DISK_SEEK_FRAMES,
  },
};

/**
 * Determine the most appropriate animation type based on the entered DOS command.
 */
export function getAnimationForCommand(command: string): TerminalAnimationType {
  const normalized = command.trim().toLowerCase();

  // Network, identity, and global lookup commands get the spinning globe
  if (
    normalized.startsWith('whois') || 
    normalized.startsWith('orcid') || 
    normalized.startsWith('gpg') || 
    normalized.startsWith('fido') ||
    normalized.startsWith('matrix')
  ) {
    return 'globe';
  }

  // Disk, storage, and catalog commands get the MFM disk head seek
  if (
    normalized.startsWith('dir') || 
    normalized.startsWith('type') || 
    normalized.startsWith('stats') || 
    normalized.startsWith('sysinfo') ||
    normalized.startsWith('projects') ||
    normalized.startsWith('skills')
  ) {
    return 'disk';
  }

  // All other commands default to the rotating loading cursor
  return 'cursor';
}

/**
 * Animation helper utility for stepping through frames of an ASCII animation sequence.
 */
export class TerminalAnimationHelper {
  private currentFrameIndex: number = 0;
  private animationType: TerminalAnimationType;

  constructor(initialType: TerminalAnimationType = 'globe') {
    this.animationType = initialType;
    this.currentFrameIndex = 0;
  }

  public setType(type: TerminalAnimationType): void {
    this.animationType = type;
    this.currentFrameIndex = 0;
  }

  public getType(): TerminalAnimationType {
    return this.animationType;
  }

  public getFrames(): string[] {
    return ANIMATION_REGISTRY[this.animationType].frames;
  }

  public getCurrentFrame(): string {
    const frames = this.getFrames();
    return frames[this.currentFrameIndex % frames.length];
  }

  public getFrameIndex(): number {
    return this.currentFrameIndex;
  }

  public getFrameCount(): number {
    return this.getFrames().length;
  }

  public nextFrame(): string {
    const frames = this.getFrames();
    this.currentFrameIndex = (this.currentFrameIndex + 1) % frames.length;
    return frames[this.currentFrameIndex];
  }

  public reset(): void {
    this.currentFrameIndex = 0;
  }
}
