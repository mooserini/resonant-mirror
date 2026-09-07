import { RefinementItem, RefinementSession } from '../types';

const SESSION_KEY = 'rm_refinement_session_v1';
const LEDGER_KEY = 'rm_refinement_ledger_v1';

export function getCurrentRefinementSession(): RefinementSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RefinementSession;
  } catch {
    return null;
  }
}

export function saveRefinementSession(session: RefinementSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearRefinementSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function loginRefinementSession(
  rawUserId: string,
  authMethod: 'userId-passkey' | 'fido2-hardware' = 'userId-passkey'
): RefinementSession {
  const userId = rawUserId.trim() || 'mooserini';
  const sessionId = `REF-9025-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const session: RefinementSession = {
    isAuthenticated: true,
    userId,
    sessionId,
    startedAt: new Date().toISOString(),
    authMethod,
  };
  saveRefinementSession(session);
  return session;
}

export function getStagedRefinements(): RefinementItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RefinementItem[];
  } catch {
    return [];
  }
}

export function saveStagedRefinements(items: RefinementItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEDGER_KEY, JSON.stringify(items));
}

export function addRefinementItem(
  item: Omit<RefinementItem, 'id' | 'createdAt' | 'status'>
): RefinementItem {
  const newItem: RefinementItem = {
    ...item,
    id: `REF-ITEM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    status: 'staged',
    createdAt: new Date().toISOString(),
  };

  const existing = getStagedRefinements();
  const updated = [newItem, ...existing];
  saveStagedRefinements(updated);
  return newItem;
}

export function removeRefinementItem(id: string): void {
  const existing = getStagedRefinements();
  const filtered = existing.filter((item) => item.id !== id);
  saveStagedRefinements(filtered);
}

export function updateRefinementStatus(id: string, status: 'staged' | 'iterated'): void {
  const existing = getStagedRefinements();
  const updated = existing.map((item) => (item.id === id ? { ...item, status } : item));
  saveStagedRefinements(updated);
}

export function clearAllRefinements(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEDGER_KEY);
}

export function buildSingleIterationPrompt(item: RefinementItem): string {
  return `[ARCHITECT REFINEMENT ITERATION REQUEST]
Authenticated Operator / User ID: ${item.userId}
Refinement ID: ${item.id}
Category: ${item.category.toUpperCase()}
Title: ${item.title}
Priority: ${item.priority.toUpperCase()}
Timestamp: ${item.createdAt}

SPECIFICATION & DESIRED CHANGES:
${item.details}

Mandate: Please integrate this refinement into the Resonant Mirror codebase, maintaining 80s CGA typographic authenticity and ensuring all build and unit tests pass.`;
}

export function buildBatchIterationPrompt(items: RefinementItem[]): string {
  if (items.length === 0) return '';
  const header = `[BATCH ARCHITECT REFINEMENT ITERATIONS — ${items.length} ITEM(S) STAGED]
Operator: ${items[0].userId}
Generated: ${new Date().toISOString()}

`;

  const body = items
    .map(
      (item, idx) => `--- REFINEMENT #${idx + 1}: [${item.category.toUpperCase()}] ${item.title} (${item.priority.toUpperCase()} PRIORITY) ---
Item ID: ${item.id}
Specification:
${item.details}
`
    )
    .join('\n');

  const footer = `\nMandate: Apply all staged refinements above to the portfolio codebase, preserving styling and test integrity.`;
  return header + body + footer;
}
