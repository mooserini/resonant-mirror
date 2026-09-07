import {
  listGoogleChatSpaces,
  listGoogleChatMessages,
  sendGoogleChatMessage,
  createGoogleChatSpace,
} from '../services/googleChatService';
import { CHAT_SCOPES } from '../services/googleChatAuth';
import { executeTerminalCommand } from '../utils/terminalCommands';

describe('Google Chat Subsystem & Workspace Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    if (typeof (global as any).window === 'undefined') {
      (global as any).window = {
        dispatchEvent: jest.fn(),
      };
      (global as any).CustomEvent = class {
        type: string;
        constructor(type: string) {
          this.type = type;
        }
      };
    }
  });

  test('should declare standard Google Chat OAuth scopes matching Workspace security policies', () => {
    expect(CHAT_SCOPES).toBeDefined();
    expect(CHAT_SCOPES).toContain('https://www.googleapis.com/auth/chat.spaces');
    expect(CHAT_SCOPES).toContain('https://www.googleapis.com/auth/chat.messages');
    expect(CHAT_SCOPES).toContain('https://www.googleapis.com/auth/chat.memberships');
  });

  describe('REST API Services', () => {
    test('should fetch spaces successfully with authorization bearer token', async () => {
      const mockSpaces = [
        {
          name: 'spaces/AAAA1234567',
          displayName: 'Resonant Mirror Chat',
          spaceType: 'SPACE',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ spaces: mockSpaces }),
      });

      const result = await listGoogleChatSpaces('mock-oauth-token');
      expect(result.spaces).toHaveLength(1);
      expect(result.spaces[0].displayName).toBe('Resonant Mirror Chat');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://chat.googleapis.com/v1/spaces',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-oauth-token',
          }),
        })
      );
    });

    test('should fetch messages from a designated space', async () => {
      const mockMessages = [
        {
          name: 'spaces/AAAA1234567/messages/MSG001',
          text: 'Hello from 1980s Retro Terminal!',
          sender: { displayName: 'Thomas Kenny' },
          createTime: '2026-09-07T12:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      });

      const result = await listGoogleChatMessages('spaces/AAAA1234567', 'mock-oauth-token');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].text).toBe('Hello from 1980s Retro Terminal!');
    });

    test('should dispatch a chat message with payload and return created message', async () => {
      const mockCreated = {
        name: 'spaces/AAAA1234567/messages/MSG999',
        text: 'Incoming transmission from AT&T PC6300',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreated,
      });

      const result = await sendGoogleChatMessage(
        'spaces/AAAA1234567',
        'Incoming transmission from AT&T PC6300',
        'mock-oauth-token'
      );

      expect(result.message?.name).toBe('spaces/AAAA1234567/messages/MSG999');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://chat.googleapis.com/v1/spaces/AAAA1234567/messages',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ text: 'Incoming transmission from AT&T PC6300' }),
        })
      );
    });

    test('should provision a new space via createGoogleChatSpace', async () => {
      const mockNewSpace = {
        name: 'spaces/BBBB9876543',
        displayName: 'Retro Dev Lounge',
        spaceType: 'SPACE',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewSpace,
      });

      const result = await createGoogleChatSpace('Retro Dev Lounge', 'mock-oauth-token');
      expect(result.space?.displayName).toBe('Retro Dev Lounge');
    });

    test('should handle API HTTP errors gracefully without crashing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: { message: 'The caller does not have permission' } }),
      });

      const result = await listGoogleChatSpaces('invalid-token');
      expect(result.spaces).toEqual([]);
      expect(result.error).toContain('The caller does not have permission');
    });
  });

  describe('DOS Terminal Integration for CHAT', () => {
    test('should handle CHAT / GOOGLECHAT commands and dispatch open event', () => {
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

      const context = {
        theme: 'dark' as const,
        setTheme: jest.fn(),
        fidoSession: null,
        onReboot: jest.fn(),
        onOpenRefinement: jest.fn(),
        onClose: jest.fn(),
      };

      const result = executeTerminalCommand('CHAT', context);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].text).toContain('GOOGLE CHAT SUBSYSTEM');
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
      dispatchSpy.mockRestore();
    });
  });
});
