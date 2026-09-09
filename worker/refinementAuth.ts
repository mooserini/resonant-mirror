import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse, type RegistrationResponseJSON, type AuthenticationResponseJSON, type AuthenticatorTransport } from '@simplewebauthn/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const SESSION = '__Host-rm_session';
const CEREMONY = '__Host-rm_ceremony';
const sessionLifetime = 12 * 60 * 60;
type Account = { id: string; display_name: string; google_uid: string | null; email: string | null; role: 'owner' | 'visitor' };
export type VerifiedSession = Account & { token_hash: string; method: 'passkey' | 'google'; credential_id: string | null; authenticated_at: number; expires_at: number };
type Ceremony = { kind: string; challenge: string; account_id: string | null; display_name: string | null; session_hash: string | null };
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const now = () => Math.floor(Date.now() / 1000);
const random = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
async function hash(value: string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join(''); }
function cookie(request: Request, name: string) { return request.headers.get('cookie')?.split(';').map(c => c.trim()).find(c => c.startsWith(`${name}=`))?.slice(name.length + 1) || ''; }
function setCookie(name: string, value: string, age: number) { return `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`; }
function response(body: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  cookies.forEach(c => headers.append('Set-Cookie', c));
  return new Response(JSON.stringify(body), { status, headers });
}
async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new HttpError(415, 'JSON is required.');
  if (!request.body) throw new HttpError(400, 'A request body is required.');
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 32768) { await reader.cancel(); throw new HttpError(413, 'Request is too large.'); } chunks.push(value); }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { const body = JSON.parse(new TextDecoder().decode(bytes)); if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error(); return body; }
  catch { throw new HttpError(400, 'Invalid JSON.'); }
}
function textField(value: unknown, max: number, label: string) { if (typeof value !== 'string' || !value.trim() || value.length > max) throw new HttpError(400, `${label} is required (up to ${max} characters).`); return value.trim(); }
export async function currentSession(request: Request, env: Env): Promise<VerifiedSession | null> {
  const token = cookie(request, SESSION); if (!/^[a-f0-9]{64}$/.test(token)) return null;
  return env.REFINEMENTS_DB.prepare('SELECT a.*, s.token_hash, s.method, s.credential_id, s.authenticated_at, s.expires_at FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>?').bind(await hash(token), now()).first<VerifiedSession>();
}
function publicSession(s: VerifiedSession) { return { isAuthenticated: true, userId: s.id, displayName: s.display_name, role: s.role, authMethod: s.method, credentialId: s.credential_id, authenticatedAt: new Date(s.authenticated_at * 1000).toISOString(), expiresAt: new Date(s.expires_at * 1000).toISOString() }; }
async function requireSession(request: Request, env: Env) { const s = await currentSession(request, env); if (!s) throw new HttpError(401, 'Sign in with a passkey or Google to continue.'); return s; }
async function issueSession(request: Request, env: Env, accountId: string, method: 'google' | 'passkey', credentialId: string | null) {
  const token = random(), t = now();
  const old = cookie(request, SESSION);
  await env.REFINEMENTS_DB.batch([
    env.REFINEMENTS_DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hash(old)),
    env.REFINEMENTS_DB.prepare('INSERT INTO sessions VALUES (?, ?, ?, ?, ?, ?)').bind(await hash(token), accountId, method, credentialId, t, t + sessionLifetime),
  ]);
  const account = await env.REFINEMENTS_DB.prepare('SELECT * FROM accounts WHERE id=?').bind(accountId).first<Account>();
  if (!account) throw new Error('Account missing');
  return response({ session: publicSession({ ...account, token_hash: '', method, credential_id: credentialId, authenticated_at: t, expires_at: t + sessionLifetime }) }, 200, [setCookie(SESSION, token, sessionLifetime), setCookie(CEREMONY, '', 0)]);
}
async function limit(request: Request, env: Env, group: string, maximum: number) {
  const t = now(), window = Math.floor(t / 600), ip = request.headers.get('CF-Connecting-IP') || 'local';
  const key = await hash(`${ip}:${group}:${window}`);
  const row = await env.REFINEMENTS_DB.prepare('INSERT INTO request_limits VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key, (window + 1) * 600).first<{ count: number }>();
  if (!row || row.count > maximum) throw new HttpError(429, 'Too many attempts. Please wait a few minutes and try again.');
}
async function makeCeremony(request: Request, env: Env, kind: string, challenge: string, accountId: string | null, displayName: string | null, sessionHash: string | null) {
  const token = random();
  await env.REFINEMENTS_DB.batch([
    env.REFINEMENTS_DB.prepare('DELETE FROM ceremonies WHERE token_hash=?').bind(await hash(cookie(request, CEREMONY))),
    env.REFINEMENTS_DB.prepare('INSERT INTO ceremonies VALUES (?, ?, ?, ?, ?, ?, ?)').bind(await hash(token), kind, challenge, accountId, displayName, sessionHash, now() + 300),
  ]);
  return setCookie(CEREMONY, token, 300);
}
async function consumeCeremony(request: Request, env: Env, kind: string) {
  const token = cookie(request, CEREMONY);
  if (!/^[a-f0-9]{64}$/.test(token)) throw new HttpError(400, 'Start a new passkey attempt.');
  // Atomic consumption prevents parallel verification/replay of the same challenge.
  const c = await env.REFINEMENTS_DB.prepare('DELETE FROM ceremonies WHERE token_hash=? AND expires_at>? RETURNING *').bind(await hash(token), now()).first<Ceremony>();
  if (!c || c.kind !== kind) throw new HttpError(400, 'This passkey attempt expired or was already used. Try again.');
  if (c.session_hash) { const s = await requireSession(request, env); if (s.token_hash !== c.session_hash || s.id !== c.account_id) throw new HttpError(401, 'The sign-in session changed. Start again.'); }
  return c;
}
export async function serveRefinements(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    const url = new URL(request.url), path = url.pathname.slice('/portfolio-api'.length);
    if (url.origin !== env.AUTH_ORIGIN) throw new HttpError(403, 'Use the portfolio sign-in origin.');
    if (!['GET', 'POST'].includes(request.method)) throw new HttpError(405, 'Method not allowed.');
    if (request.method === 'POST' && request.headers.get('origin') !== env.AUTH_ORIGIN) throw new HttpError(403, 'This request must come from the portfolio.');
    if (!env.REFINEMENTS_DB) throw new HttpError(503, 'Sign-in is not available yet.');
    if (request.method === 'GET' && path === '/auth/session') { const s = await currentSession(request, env); return response({ session: s ? publicSession(s) : null }); }
    if (request.method === 'GET' && path === '/refinements') {
      const s = await requireSession(request, env);
      const query = s.role === 'owner' ? env.REFINEMENTS_DB.prepare('SELECT payload FROM refinements ORDER BY created_at DESC LIMIT 200') : env.REFINEMENTS_DB.prepare('SELECT payload FROM refinements WHERE account_id=? ORDER BY created_at DESC LIMIT 200').bind(s.id);
      const { results } = await query.all<{ payload: string }>();
      return response({ items: results.map(r => JSON.parse(r.payload)) });
    }
    if (request.method !== 'POST') throw new HttpError(404, 'Not found.');
    await limit(request, env, path === '/refinements' ? 'suggestion' : 'auth', path === '/refinements' ? 20 : 60);
    ctx.waitUntil(env.REFINEMENTS_DB.batch([
      env.REFINEMENTS_DB.prepare('DELETE FROM ceremonies WHERE token_hash IN (SELECT token_hash FROM ceremonies WHERE expires_at<? LIMIT 100)').bind(now()),
      env.REFINEMENTS_DB.prepare('DELETE FROM sessions WHERE token_hash IN (SELECT token_hash FROM sessions WHERE expires_at<? LIMIT 100)').bind(now()),
      env.REFINEMENTS_DB.prepare('DELETE FROM request_limits WHERE key IN (SELECT key FROM request_limits WHERE expires_at<? LIMIT 100)').bind(now()),
    ]).catch(() => { console.warn('Authentication expiry cleanup failed'); }));
    const body = await readBody(request);
    if (path === '/auth/logout') {
      await env.REFINEMENTS_DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hash(cookie(request, SESSION))).run();
      return response({ session: null }, 200, [setCookie(SESSION, '', 0), setCookie(CEREMONY, '', 0)]);
    }
    if (path === '/auth/google') {
      const idToken = textField(body.idToken, 16000, 'Google sign-in token');
      let payload;
      try { ({ payload } = await jwtVerify(idToken, googleKeys, { algorithms: ['RS256'], issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`, audience: env.FIREBASE_PROJECT_ID, requiredClaims: ['sub', 'iat', 'exp', 'auth_time'] })); }
      catch { throw new HttpError(401, 'Google sign-in could not be verified. Please sign in again.'); }
      const firebase = payload.firebase as { sign_in_provider?: string } | undefined;
      if (!payload.sub || payload.sub.length > 128 || payload.email_verified !== true || typeof payload.email !== 'string' || firebase?.sign_in_provider !== 'google.com' || typeof payload.auth_time !== 'number' || payload.auth_time > now() + 60 || payload.auth_time < now() - 600 || typeof payload.iat !== 'number' || payload.iat > now() + 60) throw new HttpError(401, 'A fresh, verified Google sign-in is required.');
      let account = await env.REFINEMENTS_DB.prepare('SELECT * FROM accounts WHERE google_uid=?').bind(payload.sub).first<Account>();
      if (!account) {
        const owner = await env.REFINEMENTS_DB.prepare("SELECT id FROM accounts WHERE role='owner'").first();
        const isOwner = !owner && !!env.OWNER_GOOGLE_EMAIL && payload.email.toLowerCase() === env.OWNER_GOOGLE_EMAIL.toLowerCase();
        const id = crypto.randomUUID();
        const name = isOwner ? 'Thomas Kenny' : 'Visitor';
        // A visitor's Google subject binds the account. Their provider name and
        // email are deliberately not retained or exposed by the portfolio.
        await env.REFINEMENTS_DB.prepare('INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(google_uid) DO NOTHING').bind(id, name, payload.sub, isOwner ? payload.email : null, isOwner ? 'owner' : 'visitor', now()).run();
        account = await env.REFINEMENTS_DB.prepare('SELECT * FROM accounts WHERE google_uid=?').bind(payload.sub).first<Account>();
      }
      return issueSession(request, env, account!.id, 'google', null);
    }
    if (path === '/auth/register/options') {
      const s = await currentSession(request, env);
      if (s && s.authenticated_at < now() - 600) throw new HttpError(401, 'Sign in again before adding a passkey.');
      const accountId = s?.id || crypto.randomUUID();
      const displayName = s?.display_name || textField(body.displayName, 80, 'Display name');
      const keys = s ? (await env.REFINEMENTS_DB.prepare('SELECT id, transports FROM passkeys WHERE account_id=?').bind(s.id).all<{ id: string; transports: string }>()).results : [];
      if (keys.length >= 10) throw new HttpError(400, 'This account already has ten passkeys.');
      const options = await generateRegistrationOptions({ rpName: 'The Resonant Mirror', rpID: env.AUTH_RP_ID, userID: new TextEncoder().encode(accountId), userName: s?.role === 'owner' ? 'mooserini (site owner)' : `${displayName} (${accountId.slice(0, 8)})`, userDisplayName: displayName, attestationType: 'none', authenticatorSelection: { residentKey: 'required', userVerification: 'required' }, supportedAlgorithmIDs: [-7, -257], excludeCredentials: keys.map(k => ({ id: k.id, transports: JSON.parse(k.transports) })) });
      const c = await makeCeremony(request, env, 'register', options.challenge, accountId, displayName, s?.token_hash || null);
      return response({ options }, 200, [c]);
    }
    if (path === '/auth/register/verify') {
      const c = await consumeCeremony(request, env, 'register');
      let result;
      try { result = await verifyRegistrationResponse({ response: body.credential as RegistrationResponseJSON, expectedChallenge: c.challenge, expectedOrigin: env.AUTH_ORIGIN, expectedRPID: env.AUTH_RP_ID, requireUserVerification: true }); }
      catch { throw new HttpError(401, 'Passkey registration could not be verified. No authenticated session was created.'); }
      if (!result.verified || !result.registrationInfo.userVerified) throw new HttpError(401, 'Passkey registration was not verified.');
      const { credential } = result.registrationInfo;
      const statements = [];
      if (!c.session_hash) statements.push(env.REFINEMENTS_DB.prepare("INSERT INTO accounts (id, display_name, role, created_at) VALUES (?, ?, 'visitor', ?)").bind(c.account_id, c.display_name, now()));
      statements.push(env.REFINEMENTS_DB.prepare('INSERT INTO passkeys VALUES (?, ?, ?, ?, ?, ?)').bind(credential.id, c.account_id, JSON.stringify(Array.from(credential.publicKey)), credential.counter, JSON.stringify(credential.transports || []), now()));
      await env.REFINEMENTS_DB.batch(statements);
      return issueSession(request, env, c.account_id!, 'passkey', credential.id);
    }
    if (path === '/auth/login/options') {
      const options = await generateAuthenticationOptions({ rpID: env.AUTH_RP_ID, userVerification: 'required' });
      return response({ options }, 200, [await makeCeremony(request, env, 'login', options.challenge, null, null, null)]);
    }
    if (path === '/auth/login/verify') {
      const c = await consumeCeremony(request, env, 'login');
      const credential = body.credential as AuthenticationResponseJSON;
      if (!credential || typeof credential.id !== 'string') throw new HttpError(400, 'A passkey response is required.');
      const stored = await env.REFINEMENTS_DB.prepare('SELECT * FROM passkeys WHERE id=?').bind(credential.id).first<{ id: string; account_id: string; public_key: string; counter: number; transports: string }>();
      if (!stored) throw new HttpError(401, 'This passkey is not enrolled with the site verifier. Sign in with Google to add a passkey to your account. Your existing saved passkeys are unchanged.');
      if (credential.response?.userHandle) {
        let handle; try { handle = new TextDecoder().decode(Uint8Array.from(atob(credential.response.userHandle.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))); } catch { throw new HttpError(401, 'Invalid passkey account.'); }
        if (handle !== stored.account_id) throw new HttpError(401, 'Passkey account does not match.');
      }
      let result;
      try { result = await verifyAuthenticationResponse({ response: credential, expectedChallenge: c.challenge, expectedOrigin: env.AUTH_ORIGIN, expectedRPID: env.AUTH_RP_ID, requireUserVerification: true, credential: { id: stored.id, publicKey: Uint8Array.from(JSON.parse(stored.public_key)), counter: stored.counter, transports: JSON.parse(stored.transports) as AuthenticatorTransport[] } }); }
      catch { throw new HttpError(401, 'Passkey signature could not be verified. Please try again.'); }
      if (!result.verified || !result.authenticationInfo.userVerified) throw new HttpError(401, 'Passkey authentication was not verified.');
      const update = await env.REFINEMENTS_DB.prepare('UPDATE passkeys SET counter=? WHERE id=? AND counter=?').bind(result.authenticationInfo.newCounter, stored.id, stored.counter).run();
      if (!update.meta.changes) throw new HttpError(401, 'Passkey changed during authentication. Please try again.');
      return issueSession(request, env, stored.account_id, 'passkey', stored.id);
    }
    if (path === '/refinements') {
      const s = await requireSession(request, env);
      const title = textField(body.title, 180, 'Title'), details = textField(body.details, 12000, 'Requested change');
      if (!['project', 'huggingface', 'skill', 'bio', 'easteregg', 'general'].includes(String(body.category)) || !['normal', 'high', 'immediate'].includes(String(body.priority))) throw new HttpError(400, 'Choose a valid category and priority.');
      const item = { id: crypto.randomUUID(), userId: s.id, author: s.display_name, role: s.role, category: body.category, title, details, priority: body.priority, status: 'submitted', createdAt: new Date().toISOString(), authentication: { method: s.method, verifiedAt: new Date(s.authenticated_at * 1000).toISOString(), credentialId: s.credential_id }, };
      const receipt = { ...item, contentHash: await hash(JSON.stringify(item)) };
      await env.REFINEMENTS_DB.prepare('INSERT INTO refinements VALUES (?, ?, ?, ?)').bind(item.id, s.id, JSON.stringify(receipt), now()).run();
      return response({ item: receipt }, 201);
    }
    throw new HttpError(404, 'Not found.');
  } catch (error) {
    if (error instanceof HttpError) return response({ error: error.message }, error.status);
    // Do not log tokens, assertions, account details, or submitted text.
    console.error('Portfolio authentication/refinement request failed');
    return response({ error: 'The server could not complete this request. No success has been recorded by this response; check your session or saved suggestions before retrying.' }, 503);
  }
}
