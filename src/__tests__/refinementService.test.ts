import {
  getCurrentRefinementSession,
  loginRefinementSession,
  clearRefinementSession,
  getStagedRefinements,
  addRefinementItem,
  removeRefinementItem,
  clearAllRefinements,
  buildSingleIterationPrompt,
  buildBatchIterationPrompt,
} from '../utils/refinementService';

describe('Refinement Loop & Session Service', () => {
  let store: Record<string, string> = {};

  beforeAll(() => {
    const localStorageMock = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global, 'window', {
      value: { localStorage: localStorageMock },
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    store = {};
  });

  test('should return null when no session is active', () => {
    expect(getCurrentRefinementSession()).toBeNull();
  });

  test('should initialize and persist session on login with user ID', () => {
    const session = loginRefinementSession('mooserini');
    expect(session.isAuthenticated).toBe(true);
    expect(session.userId).toBe('mooserini');
    expect(session.sessionId).toContain('REF-9025-');
    expect(session.authMethod).toBe('userId-passkey');

    const retrieved = getCurrentRefinementSession();
    expect(retrieved?.userId).toBe('mooserini');
  });

  test('should fallback to mooserini when blank user ID is provided', () => {
    const session = loginRefinementSession('   ');
    expect(session.userId).toBe('mooserini');
  });

  test('should clear session on logout', () => {
    loginRefinementSession('mooserini');
    expect(getCurrentRefinementSession()).not.toBeNull();

    clearRefinementSession();
    expect(getCurrentRefinementSession()).toBeNull();
  });

  test('should stage refinement items to ledger', () => {
    const item = addRefinementItem({
      userId: 'mooserini',
      category: 'huggingface',
      title: 'Add Hermes Qwen weights to Hugging Face profile',
      details: 'Publish 4-bit and 8-bit GGUF quantized models under @mooserini',
      priority: 'high',
    });

    expect(item.id).toContain('REF-ITEM-');
    expect(item.status).toBe('staged');

    const staged = getStagedRefinements();
    expect(staged.length).toBe(1);
    expect(staged[0].title).toBe('Add Hermes Qwen weights to Hugging Face profile');
    expect(staged[0].category).toBe('huggingface');
  });

  test('should remove staged refinement item by id', () => {
    const item1 = addRefinementItem({
      userId: 'mooserini',
      category: 'project',
      title: 'Item 1',
      details: 'Details 1',
      priority: 'normal',
    });

    const item2 = addRefinementItem({
      userId: 'mooserini',
      category: 'skill',
      title: 'Item 2',
      details: 'Details 2',
      priority: 'immediate',
    });

    expect(getStagedRefinements().length).toBe(2);

    removeRefinementItem(item1.id);
    const remaining = getStagedRefinements();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(item2.id);
  });

  test('should clear all staged refinements', () => {
    addRefinementItem({
      userId: 'mooserini',
      category: 'general',
      title: 'Item',
      details: 'Details',
      priority: 'normal',
    });

    expect(getStagedRefinements().length).toBe(1);
    clearAllRefinements();
    expect(getStagedRefinements().length).toBe(0);
  });

  test('should construct formatted single and batch iteration prompts', () => {
    const item = addRefinementItem({
      userId: 'mooserini',
      category: 'huggingface',
      title: 'Model Checkpoint',
      details: 'Include safetensors weights',
      priority: 'high',
    });

    const singlePrompt = buildSingleIterationPrompt(item);
    expect(singlePrompt).toContain('[ARCHITECT REFINEMENT ITERATION REQUEST]');
    expect(singlePrompt).toContain('mooserini');
    expect(singlePrompt).toContain('HUGGINGFACE');
    expect(singlePrompt).toContain('Model Checkpoint');
    expect(singlePrompt).toContain('Include safetensors weights');

    const batchPrompt = buildBatchIterationPrompt([item]);
    expect(batchPrompt).toContain('[BATCH ARCHITECT REFINEMENT ITERATIONS — 1 ITEM(S) STAGED]');
    expect(batchPrompt).toContain('Model Checkpoint');
  });
});
