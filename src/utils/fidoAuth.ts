import type { FidoSession, RefinementSession } from '../types';
import { portfolioRequest, getVerifiedSession, endVerifiedSession, announceAuthChange } from './portfolioAuth';
let displayedSession: FidoSession | null = null;
export function isWebAuthnAvailable() { return typeof window !== 'undefined' && typeof window.PublicKeyCredential === 'function' && !!navigator.credentials; }
// Old browser storage is deliberately not an authentication authority.
export function getCurrentFidoSession(): FidoSession | null { return displayedSession; }
function display(session: RefinementSession | null): FidoSession | null {
  displayedSession = session?.authMethod === 'passkey' ? { isAuthenticated: true, credentialId: session.credentialId || undefined, authenticatorType: 'passkey', userHandle: session.displayName, timestamp: Date.parse(session.authenticatedAt), securityLevel: 'Passkey verified by the site', algorithm: 'WebAuthn signature verified' } : null;
  return displayedSession;
}
export async function refreshFidoSession() { try { return display(await getVerifiedSession()); } catch { return display(null); } }
export async function clearFidoSession() { await endVerifiedSession(); displayedSession = null; }
export function generateCryptographicChallenge(): string { return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join(''); }
function requireWebAuthn() { if (!isWebAuthnAvailable()) throw new Error('Passkeys are unavailable in this browser. Use Google sign-in instead.'); }
function readableFailure(error: unknown): Error {
  if (error && typeof error === 'object' && 'name' in error && (error.name === 'NotAllowedError' || error.name === 'AbortError')) return new Error('Passkey request cancelled or timed out. Authentication was not completed.');
  return error instanceof Error ? error : new Error('Passkey request failed. Authentication was not completed.');
}
export async function registerVerifiedPasskey(displayName: string): Promise<RefinementSession> {
  requireWebAuthn();
  try {
    const { startRegistration } = await import('@simplewebauthn/browser');
    const { options } = await portfolioRequest<{ options: Parameters<typeof startRegistration>[0]['optionsJSON'] }>('/auth/register/options', { displayName });
    const credential = await startRegistration({ optionsJSON: options });
    const { session } = await portfolioRequest<{ session: RefinementSession }>('/auth/register/verify', { credential });
    display(session); announceAuthChange(); return session;
  } catch (error) { throw readableFailure(error); }
}
export async function authenticateVerifiedPasskey(): Promise<RefinementSession> {
  requireWebAuthn();
  try {
    const { startAuthentication } = await import('@simplewebauthn/browser');
    const { options } = await portfolioRequest<{ options: Parameters<typeof startAuthentication>[0]['optionsJSON'] }>('/auth/login/options', {});
    const credential = await startAuthentication({ optionsJSON: options });
    const { session } = await portfolioRequest<{ session: RefinementSession }>('/auth/login/verify', { credential });
    display(session); announceAuthChange(); return session;
  } catch (error) { throw readableFailure(error); }
}
export async function performFidoRegistration(name: string) { return display(await registerVerifiedPasskey(name))!; }
export async function performFidoAuthentication(_name?: string) { return display(await authenticateVerifiedPasskey())!; }
