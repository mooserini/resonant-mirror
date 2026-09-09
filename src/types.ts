export interface Project {
  id: string;
  title: string;
  codename: string;
  category: 'systems' | 'retro' | 'security' | 'ai' | 'web';
  summary: string;
  description: string;
  year: string;
  tags: string[];
  link?: string;
  repoUrl: string;
  sourceKind: 'repository' | 'contribution';
  featured: boolean;
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
  authenticatorType?: 'platform' | 'cross-platform' | 'passkey';
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

export interface RefinementSession {
  isAuthenticated: true;
  userId: string;
  displayName: string;
  role: 'owner' | 'visitor';
  authMethod: 'passkey' | 'google';
  credentialId: string | null;
  authenticatedAt: string;
  expiresAt: string;
}

export interface RefinementItem {
  id: string;
  userId: string;
  author: string;
  role: 'owner' | 'visitor';
  category: 'project' | 'huggingface' | 'skill' | 'bio' | 'easteregg' | 'general';
  title: string;
  details: string;
  priority: 'normal' | 'high' | 'immediate';
  status: 'submitted';
  createdAt: string;
  authentication: { method: 'passkey' | 'google'; verifiedAt: string; credentialId: string | null };
  contentHash: string;
}

export type HeatmapPhosphorMode = 'green' | 'amber' | 'white' | 'cga';

export interface ContributionDay {
  date: string;       // YYYY-MM-DD
  count: number;      // GitHub contribution count
  level: 0 | 1 | 2 | 3 | 4; // intensity tier
  weekday: number;    // 0 = Sunday, 6 = Saturday
  weekIndex: number;  // 0 to 52
}

export interface ContributionSummary {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  busiestDay: { date: string; count: number };
  activeDaysCount: number;
}

