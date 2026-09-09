import type { RefinementSession } from '../types';
export class PortfolioRequestError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function portfolioRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/portfolio-api${path}`, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  let data;
  try { data = await response.json(); } catch { throw new PortfolioRequestError('The site returned an unexpected response. Please try again.', response.status); }
  if (!response.ok) throw new PortfolioRequestError(data.error || 'The request failed.', response.status);
  return data as T;
}
export async function getVerifiedSession(): Promise<RefinementSession | null> {
  return (await portfolioRequest<{ session: RefinementSession | null }>('/auth/session')).session;
}
export function announceAuthChange() { window.dispatchEvent(new Event('portfolio-auth-changed')); }
export async function endVerifiedSession() { await portfolioRequest('/auth/logout', {}); announceAuthChange(); }
export async function signInWithGoogle(): Promise<RefinementSession> {
  // Separate Firebase app and in-memory persistence: site login requests no
  // Discord scopes and never exposes the relay bot credential to the browser.
  const [{ getApps, initializeApp }, { getAuth, setPersistence, inMemoryPersistence, GoogleAuthProvider, signInWithPopup, signOut }, { default: config }] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('../../firebase-applet-config.json')]);
  const app = getApps().find(a => a.name === 'portfolio-refinements') || initializeApp(config, 'portfolio-refinements');
  const auth = getAuth(app);
  await setPersistence(auth, inMemoryPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  try {
    const idToken = await result.user.getIdToken(true);
    const data = await portfolioRequest<{ session: RefinementSession }>('/auth/google', { idToken });
    announceAuthChange(); return data.session;
  } finally { await signOut(auth).catch(() => undefined); }
}
