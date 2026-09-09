import { addRefinementItem, getStagedRefinements, getLegacyDrafts, buildSingleIterationPrompt } from '../utils/refinementService';
import type { RefinementItem } from '../types';
const record: RefinementItem = { id: 'receipt-1', userId: 'verified-account', author: 'Visitor', role: 'visitor', category: 'general', title: 'Correct a link', details: 'Use the public repository.', priority: 'normal', status: 'submitted', createdAt: '2026-09-09T00:00:00Z', authentication: { method: 'passkey', verifiedAt: '2026-09-08T23:59:00Z', credentialId: 'key-1' }, contentHash: 'sha256' };
afterEach(() => jest.restoreAllMocks());
test('requires the server to accept the suggestion and returns its attribution', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ item: record }), { status: 201 }));
  const input = { title: record.title, details: record.details, category: record.category, priority: record.priority };
  expect(await addRefinementItem(input)).toEqual(record);
  expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual(input);
  expect(fetchMock.mock.calls[0][1]?.credentials).toBe('same-origin');
});
test('an unauthenticated response cannot become a local authenticated refinement', async () => {
  jest.spyOn(global, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ error: 'Sign in first' }), { status: 401 }));
  await expect(addRefinementItem({ title: 'A', details: 'B', category: 'general', priority: 'normal' })).rejects.toThrow('Sign in first');
  await expect(getStagedRefinements()).rejects.toThrow('Sign in first');
});
test('exports separate author, owner and chosen assistant plus the server receipt', () => {
  const brief = buildSingleIterationPrompt(record, 'Hermes');
  expect(brief).toContain('Site owner: Thomas Kenny');
  expect(brief).toContain('Assistant selected for handoff: Hermes');
  expect(brief).toContain('"userId": "verified-account"');
  expect(brief).toContain('"method": "passkey"');
  expect(brief).toContain('Visitor suggestions require the site owner');
  expect(brief).not.toContain('AI Studio');
});
test('preserves old browser drafts without treating them as server records', () => {
  const original = JSON.stringify([{ title: 'Old draft', userId: 'mooserini', isAuthenticated: true }]);
  const setItem = jest.fn();
  Object.defineProperty(global, 'localStorage', { configurable: true, value: { getItem: () => original, setItem } });
  expect(getLegacyDrafts()).toEqual(JSON.parse(original));
  expect(setItem).not.toHaveBeenCalled();
});
