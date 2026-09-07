export interface GoogleChatSpace {
  name: string; // e.g., "spaces/AAAAAAAAAAA"
  type?: 'ROOM' | 'DM' | 'GROUP_CHAT' | 'SPACE' | string;
  spaceType?: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE';
  displayName?: string;
  singleUserBotDm?: boolean;
  threaded?: boolean;
  spaceDetails?: {
    description?: string;
    guidelines?: string;
  };
  spaceHistoryState?: 'HISTORY_OFF' | 'HISTORY_ON';
  membershipCount?: {
    joinedDirectHumanUserCount?: number;
    joinedGroupCount?: number;
  };
}

export interface GoogleChatMessage {
  name: string; // e.g., "spaces/AAAAAAAAAAA/messages/BBBBBBBBBBB"
  text?: string;
  sender?: {
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    type?: 'HUMAN' | 'BOT' | string;
  };
  createTime?: string;
  formattedText?: string;
  thread?: {
    name?: string;
  };
}

export interface GoogleChatApiResponse<T> {
  data?: T;
  error?: string;
}

const CHAT_BASE_URL = 'https://chat.googleapis.com/v1';

/**
 * Lists all Google Chat spaces accessible by the authenticated user.
 */
export async function listGoogleChatSpaces(
  accessToken: string
): Promise<{ spaces: GoogleChatSpace[]; error?: string }> {
  try {
    const response = await fetch(`${CHAT_BASE_URL}/spaces`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData?.error?.message ||
        `HTTP ${response.status}: ${response.statusText}`;
      return { spaces: [], error: message };
    }

    const data = await response.json();
    return { spaces: data.spaces || [] };
  } catch (err: any) {
    return { spaces: [], error: err.message || 'Network request failed' };
  }
}

/**
 * Fetches messages within a designated space.
 */
export async function listGoogleChatMessages(
  spaceName: string,
  accessToken: string,
  pageSize = 30
): Promise<{ messages: GoogleChatMessage[]; error?: string }> {
  try {
    const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
    const url = new URL(`${CHAT_BASE_URL}/${cleanSpaceName}/messages`);
    url.searchParams.set('pageSize', pageSize.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData?.error?.message ||
        `HTTP ${response.status}: ${response.statusText}`;
      return { messages: [], error: message };
    }

    const data = await response.json();
    return { messages: data.messages || [] };
  } catch (err: any) {
    return { messages: [], error: err.message || 'Network request failed' };
  }
}

/**
 * Dispatches a new text message to a specific Google Chat space.
 */
export async function sendGoogleChatMessage(
  spaceName: string,
  text: string,
  accessToken: string
): Promise<{ message?: GoogleChatMessage; error?: string }> {
  try {
    const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
    const response = await fetch(`${CHAT_BASE_URL}/${cleanSpaceName}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData?.error?.message ||
        `HTTP ${response.status}: ${response.statusText}`;
      return { error: message };
    }

    const data = await response.json();
    return { message: data };
  } catch (err: any) {
    return { error: err.message || 'Failed to dispatch message' };
  }
}

/**
 * Creates a brand new Google Chat Space.
 */
export async function createGoogleChatSpace(
  displayName: string,
  accessToken: string
): Promise<{ space?: GoogleChatSpace; error?: string }> {
  try {
    const response = await fetch(`${CHAT_BASE_URL}/spaces`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceType: 'SPACE',
        displayName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData?.error?.message ||
        `HTTP ${response.status}: ${response.statusText}`;
      return { error: message };
    }

    const data = await response.json();
    return { space: data };
  } catch (err: any) {
    return { error: err.message || 'Failed to create space' };
  }
}
