import type { RelayMessage, RelayProfile } from '../types';
import { announceAuthChange, portfolioRequest } from '../utils/portfolioAuth';

export async function getRelayProfile() {
  return portfolioRequest<{ isAuthenticated: boolean; profile: RelayProfile | null }>('/relay/profile');
}

export async function registerRelayHandle(handle: string, acceptedDisclosure: boolean) {
  const result = await portfolioRequest<{ profile: RelayProfile }>('/relay/handle', { handle, acceptedDisclosure });
  announceAuthChange();
  return result.profile;
}

export async function sendRelayMessage(input: { message: string; callsign?: string; acceptedDisclosure?: boolean }) {
  return portfolioRequest<{ accepted: true; duplicate?: boolean; message?: RelayMessage }>('/relay/messages', {
    ...input,
    requestId: crypto.randomUUID(),
  });
}

export async function listRelayMessages(after?: string | null) {
  const suffix = after ? `?after=${encodeURIComponent(after)}` : '';
  return portfolioRequest<{ messages: RelayMessage[]; nextCursor: string | null }>(`/relay/messages${suffix}`);
}
