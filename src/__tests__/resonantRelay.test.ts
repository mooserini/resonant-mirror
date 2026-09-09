import { getRelayProfile, listRelayMessages, registerRelayHandle, sendRelayMessage } from '../services/resonantRelay';
import { executeTerminalCommand } from '../utils/terminalCommands';

beforeEach(() => {
  Object.defineProperty(global, 'window', { configurable: true, value: { dispatchEvent: jest.fn() } });
  Object.defineProperty(global, 'CustomEvent', { configurable: true, value: class extends Event {} });
});
afterEach(() => jest.restoreAllMocks());

test('registers only the chosen handle and explicit disclosure', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ profile: { handle: 'MirrorGuest', hasConversation: false, acceptedAt: '2026-09-09T12:00:00Z' } }), { status: 201 }));
  expect((await registerRelayHandle('MirrorGuest', true)).handle).toBe('MirrorGuest');
  expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({ handle: 'MirrorGuest', acceptedDisclosure: true });
});

test('anonymous dispatch is explicit and uses a fresh idempotency key', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ accepted: true }), { status: 201 }));
  await sendRelayMessage({ message: 'Hello there', callsign: 'NightOwl', acceptedDisclosure: true });
  const payload = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
  expect(payload).toMatchObject({ message: 'Hello there', callsign: 'NightOwl', acceptedDisclosure: true });
  expect(payload.requestId).toMatch(/^[0-9a-f-]{36}$/);
  expect(fetchMock.mock.calls[0][1]?.credentials).toBe('same-origin');
});

test('profile and message reads stay on the same-origin portfolio API', async () => {
  const fetchMock = jest.spyOn(global, 'fetch')
    .mockResolvedValueOnce(new Response(JSON.stringify({ isAuthenticated: false, profile: null })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ messages: [], nextCursor: null })));
  await getRelayProfile();
  await listRelayMessages('1547202057637994999');
  expect(fetchMock.mock.calls[0][0]).toBe('/portfolio-api/relay/profile');
  expect(fetchMock.mock.calls[1][0]).toBe('/portfolio-api/relay/messages?after=1547202057637994999');
});

test('CHAT and RELAY commands open the Resonant Relay', () => {
  const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
  const context = { theme: 'dark' as const, setTheme: jest.fn(), fidoSession: null, onReboot: jest.fn(), onOpenRefinement: jest.fn(), onClose: jest.fn() };
  for (const command of ['CHAT', 'RELAY']) {
    const result = executeTerminalCommand(command, context);
    expect(result[0].text).toContain('RESONANT RELAY');
  }
  expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'open-resonant-relay' }));
});
