export interface Project {
  id: string;
  title: string;
  codename: string;
  category: 'systems' | 'retro' | 'security' | 'ai';
  summary: string;
  description: string;
  year: string;
  tags: string[];
  metrics?: string;
  link?: string;
  repoUrl?: string;
  featured: boolean;
  retroOutput?: string;
}

export interface SkillCategory {
  title: string;
  description: string;
  iconName: string;
  skills: {
    name: string;
    level: number; // 1-100
    details: string;
    badge?: string;
  }[];
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  summary: string;
  content: string[];
}

export interface FidoSession {
  isAuthenticated: boolean;
  credentialId?: string;
  algorithm?: string;
  authenticatorType?: 'platform' | 'cross-platform' | 'hardware-sim';
  userHandle?: string;
  timestamp?: number;
  securityLevel?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  encryptWithGpg: boolean;
}

export interface ContactReceipt {
  success: boolean;
  confirmationId: string;
  timestamp: string;
  message: string;
  mailtoUrl: string;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  text: string;
  timestamp?: string;
}

export interface Achievement {
  id: string;
  title: string;
  badge: string;
  description: string;
  category: 'hardware' | 'cryptography' | 'retro' | 'exploration' | 'secret';
  points: number;
  unlockedAt?: string;
}

export interface RefinementItem {
  id: string;
  userId: string;
  category: 'project' | 'huggingface' | 'skill' | 'bio' | 'easteregg' | 'general';
  title: string;
  details: string;
  priority: 'normal' | 'high' | 'immediate';
  status: 'staged' | 'iterated';
  createdAt: string;
}

export interface RefinementSession {
  isAuthenticated: boolean;
  userId: string;
  sessionId: string;
  startedAt: string;
  authMethod: 'userId-passkey' | 'fido2-hardware';
}

export type HeatmapPhosphorMode = 'green' | 'amber' | 'white' | 'cga';

export interface ContributionDay {
  date: string;       // YYYY-MM-DD
  count: number;      // commit count
  level: 0 | 1 | 2 | 3 | 4; // intensity tier
  weekday: number;    // 0 = Sunday, 6 = Saturday
  weekIndex: number;  // 0 to 52
  repoHint?: string;  // sample repo touched
}

export interface ContributionSummary {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  busiestDay: { date: string; count: number };
  activeDaysCount: number;
}

