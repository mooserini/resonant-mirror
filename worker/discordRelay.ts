import { currentSession, type VerifiedSession } from './refinementAuth';

type RelayEnv = Env & { DISCORD_BOT_TOKEN: string };
type RelayProfile = { account_id: string; handle: string; discord_thread_id: string | null; thread_claimed_at: number | null; accepted_at: number };
type DiscordMessage = { id: string; content?: string; timestamp?: string; author?: { id?: string; bot?: boolean }; webhook_id?: string };
type DiscordThread = { id?: string; guild_id?: string; parent_id?: string; message?: { id?: string } };
type VisibleMessage = { id: string; author: 'you' | 'tom'; text: string; createdAt: string };

const API = 'https://discord.com/api/v10';
const DISCLOSURE_VERSION = 'relay-privacy-v1';
const now = () => Math.floor(Date.now() / 1000);

class RelayError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new RelayError(415, 'JSON is required.');
  if (!request.body) throw new RelayError(400, 'A request body is required.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 8192) { await reader.cancel(); throw new RelayError(413, 'Request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try {
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch { throw new RelayError(400, 'Invalid JSON.'); }
}

function field(value: unknown, max: number, label: string, required = true) {
  if (typeof value !== 'string' || (required && !value.trim()) || value.length > max) {
    throw new RelayError(400, `${label} ${required ? 'is required ' : ''}(up to ${max} characters).`);
  }
  return value.trim();
}

function validHandle(value: unknown) {
  const candidate = field(value, 24, 'Handle');
  if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{2,23}$/.test(candidate)) {
    throw new RelayError(400, 'Use 3–24 letters, numbers, periods, underscores, or hyphens; begin with a letter or number.');
  }
  return candidate;
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function rateLimit(request: Request, env: RelayEnv, group: string, maximum: number) {
  const window = Math.floor(now() / 600);
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const key = await digest(`${ip}:relay:${group}:${window}`);
  const row = await env.REFINEMENTS_DB.prepare(
    'INSERT INTO request_limits VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count',
  ).bind(key, (window + 1) * 600).first<{ count: number }>();
  if (!row || row.count > maximum) throw new RelayError(429, 'Too many transmissions. Please wait a few minutes and try again.');
}

function assertConfiguration(env: RelayEnv) {
  for (const value of [env.DISCORD_APPLICATION_ID, env.DISCORD_GUILD_ID, env.DISCORD_FORUM_CHANNEL_ID, env.DISCORD_OWNER_USER_ID]) {
    if (!/^\d{17,20}$/.test(value)) throw new RelayError(503, 'The relay has not finished configuration.');
  }
  if (!env.DISCORD_BOT_TOKEN || env.DISCORD_BOT_TOKEN.length < 30) throw new RelayError(503, 'The relay credential is not configured.');
}

async function boundedJson<T>(response: Response): Promise<T> {
  const stated = Number(response.headers.get('content-length') || 0);
  if (stated > 65536) throw new RelayError(502, 'Discord returned an oversized response.');
  const reader = response.body?.getReader();
  if (!reader) throw new RelayError(502, 'Discord returned an empty response.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 65536) { await reader.cancel(); throw new RelayError(502, 'Discord returned an oversized response.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)) as T; }
  catch { throw new RelayError(502, 'Discord returned an unreadable response.'); }
}

async function discord<T>(env: RelayEnv, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    if (response.status === 429) throw new RelayError(503, 'Discord asked the relay to slow down. Please try again shortly.');
    if (response.status === 401 || response.status === 403) throw new RelayError(503, 'The private relay is not authorized for that channel.');
    throw new RelayError(503, 'Discord did not accept the transmission. No success is recorded by this response.');
  }
  return boundedJson<T>(response);
}

async function profileFor(env: RelayEnv, accountId: string) {
  return env.REFINEMENTS_DB.prepare(
    'SELECT account_id, handle, discord_thread_id, thread_claimed_at, accepted_at FROM relay_profiles WHERE account_id=?',
  ).bind(accountId).first<RelayProfile>();
}

function publicProfile(profile: RelayProfile | null) {
  return profile ? { handle: profile.handle, hasConversation: /^\d{17,20}$/.test(profile.discord_thread_id || ''), acceptedAt: new Date(profile.accepted_at * 1000).toISOString() } : null;
}

function messageContent(label: string, message: string) {
  return `[HANDLE: ${label}]\n${message}`;
}

async function reserveDispatch(env: RelayEnv, requestId: string, session: VerifiedSession | null, label: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    throw new RelayError(400, 'A valid transmission request ID is required.');
  }
  const result = await env.REFINEMENTS_DB.prepare(
    "INSERT INTO relay_dispatches (request_id, account_id, sender_label, state, created_at) VALUES (?, ?, ?, 'pending', ?) ON CONFLICT(request_id) DO NOTHING",
  ).bind(requestId, session?.id || null, label, now()).run();
  if (!result.meta.changes) {
    const prior = await env.REFINEMENTS_DB.prepare('SELECT state FROM relay_dispatches WHERE request_id=?').bind(requestId).first<{ state: string }>();
    if (prior?.state === 'delivered') return false;
    throw new RelayError(409, 'That transmission is already being processed.');
  }
  return true;
}

async function completeDispatch(env: RelayEnv, requestId: string, threadId: string, messageId: string) {
  await env.REFINEMENTS_DB.prepare(
    "UPDATE relay_dispatches SET state='delivered', discord_thread_id=?, discord_message_id=? WHERE request_id=?",
  ).bind(threadId, messageId, requestId).run();
}

async function releaseDispatch(env: RelayEnv, requestId: string) {
  await env.REFINEMENTS_DB.prepare("DELETE FROM relay_dispatches WHERE request_id=? AND state='pending'").bind(requestId).run();
}

async function createThread(env: RelayEnv, name: string, content: string) {
  const thread = await discord<DiscordThread>(env, `/channels/${env.DISCORD_FORUM_CHANNEL_ID}/threads`, {
    method: 'POST',
    body: JSON.stringify({ name, auto_archive_duration: 10080, message: { content, allowed_mentions: { parse: [] } } }),
  });
  if (!thread.id || !thread.message?.id || thread.guild_id !== env.DISCORD_GUILD_ID || thread.parent_id !== env.DISCORD_FORUM_CHANNEL_ID) {
    throw new RelayError(502, 'Discord returned an unexpected thread receipt.');
  }
  return { threadId: thread.id, messageId: thread.message.id };
}

async function sendToThread(env: RelayEnv, threadId: string, content: string) {
  const message = await discord<DiscordMessage>(env, `/channels/${threadId}/messages`, {
    method: 'POST', body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
  });
  if (!message.id) throw new RelayError(502, 'Discord returned an unexpected message receipt.');
  return message.id;
}

async function createClaimedThread(env: RelayEnv, session: VerifiedSession, profile: RelayProfile, requestId: string, content: string) {
  const claim = `pending:${requestId}`;
  const claimed = await env.REFINEMENTS_DB.prepare(
    "UPDATE relay_profiles SET discord_thread_id=?, thread_claimed_at=? WHERE account_id=? AND (discord_thread_id IS NULL OR (discord_thread_id LIKE 'pending:%' AND thread_claimed_at<?)) RETURNING account_id",
  ).bind(claim, now(), session.id, now() - 60).first();
  if (!claimed) throw new RelayError(409, 'This handle is already opening its private thread. Please try again shortly.');
  try {
    const created = await createThread(env, profile.handle, content);
    const saved = await env.REFINEMENTS_DB.prepare(
      'UPDATE relay_profiles SET discord_thread_id=?, thread_claimed_at=NULL WHERE account_id=? AND discord_thread_id=?',
    ).bind(created.threadId, session.id, claim).run();
    if (!saved.meta.changes) throw new RelayError(503, 'The private thread was created but its local mapping needs operator review before retrying.');
    return created;
  } catch (error) {
    await env.REFINEMENTS_DB.prepare(
      'UPDATE relay_profiles SET discord_thread_id=NULL, thread_claimed_at=NULL WHERE account_id=? AND discord_thread_id=?',
    ).bind(session.id, claim).run().catch(() => undefined);
    throw error;
  }
}

export async function serveRelay(request: Request, rawEnv: Env): Promise<Response> {
  const env = rawEnv as RelayEnv;
  try {
    const url = new URL(request.url);
    const path = url.pathname.slice('/portfolio-api'.length);
    if (url.origin !== env.AUTH_ORIGIN) throw new RelayError(403, 'Use the portfolio origin.');
    if (!['GET', 'POST'].includes(request.method)) throw new RelayError(405, 'Method not allowed.');
    if (request.method === 'POST' && request.headers.get('origin') !== env.AUTH_ORIGIN) throw new RelayError(403, 'This request must come from the portfolio.');
    if (!env.REFINEMENTS_DB) throw new RelayError(503, 'The relay database is unavailable.');

    const session = await currentSession(request, env);
    if (request.method === 'GET' && path === '/relay/profile') {
      const profile = session ? await profileFor(env, session.id) : null;
      return json({ isAuthenticated: !!session, profile: publicProfile(profile) });
    }

    if (request.method === 'POST' && path === '/relay/handle') {
      if (!session) throw new RelayError(401, 'Sign in with a passkey or Google before choosing a handle.');
      const body = await readJson(request);
      if (body.acceptedDisclosure !== true) throw new RelayError(400, 'Confirm the relay privacy disclosure to continue.');
      const chosen = validHandle(body.handle);
      const existing = await profileFor(env, session.id);
      if (existing) return json({ profile: publicProfile(existing) });
      const taken = await env.REFINEMENTS_DB.prepare('SELECT account_id FROM relay_profiles WHERE handle_key=?').bind(chosen.toLowerCase()).first();
      if (taken) throw new RelayError(409, 'That handle is already registered. Choose another.');
      const t = now();
      await env.REFINEMENTS_DB.batch([
        env.REFINEMENTS_DB.prepare('INSERT INTO relay_profiles (account_id, handle, handle_key, disclosure_version, accepted_at, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(session.id, chosen, chosen.toLowerCase(), DISCLOSURE_VERSION, t, t),
        env.REFINEMENTS_DB.prepare('UPDATE accounts SET display_name=? WHERE id=?').bind(chosen, session.id),
      ]);
      return json({ profile: { handle: chosen, hasConversation: false, acceptedAt: new Date(t * 1000).toISOString() } }, 201);
    }

    if (request.method === 'POST' && path === '/relay/messages') {
      assertConfiguration(env);
      const body = await readJson(request);
      const message = field(body.message, 1800, 'Message');
      const requestId = field(body.requestId, 64, 'Transmission request ID');
      let label: string;
      let profile: RelayProfile | null = null;
      if (session) {
        profile = await profileFor(env, session.id);
        if (!profile) throw new RelayError(409, 'Choose and confirm your relay handle before sending.');
        label = profile.handle;
        await rateLimit(request, env, `account:${session.id}`, 30);
      } else {
        if (body.acceptedDisclosure !== true) throw new RelayError(400, 'Confirm the anonymous dispatch disclosure to continue.');
        const callsign = field(body.callsign ?? '', 24, 'Callsign', false);
        if (callsign && !/^[A-Za-z0-9][A-Za-z0-9_. -]{1,23}$/.test(callsign)) throw new RelayError(400, 'Use a simple callsign of up to 24 characters.');
        label = callsign ? `ANONYMOUS / ${callsign}` : 'ANONYMOUS';
        await rateLimit(request, env, 'anonymous', 3);
      }

      const reserved = await reserveDispatch(env, requestId, session, label);
      if (!reserved) return json({ accepted: true, duplicate: true });
      try {
        const content = messageContent(label, message);
        let threadId: string, messageId: string;
        if (profile?.discord_thread_id && /^\d{17,20}$/.test(profile.discord_thread_id)) {
          threadId = profile.discord_thread_id;
          messageId = await sendToThread(env, threadId, content);
        } else if (profile && session) {
          ({ threadId, messageId } = await createClaimedThread(env, session, profile, requestId, content));
        } else {
          const title = `anonymous-${requestId.slice(0, 8)}`;
          ({ threadId, messageId } = await createThread(env, title, content));
        }
        await completeDispatch(env, requestId, threadId, messageId);
        return json({ accepted: true, message: { id: messageId, author: 'you', text: message, createdAt: new Date().toISOString() } }, 201);
      } catch (error) {
        await releaseDispatch(env, requestId).catch(() => undefined);
        throw error;
      }
    }

    if (request.method === 'GET' && path === '/relay/messages') {
      assertConfiguration(env);
      if (!session) throw new RelayError(401, 'Sign in to receive replies. Anonymous dispatches are send-only.');
      const profile = await profileFor(env, session.id);
      if (!profile) throw new RelayError(409, 'Choose your relay handle first.');
      if (!/^\d{17,20}$/.test(profile.discord_thread_id || '')) return json({ messages: [], nextCursor: null });
      const after = url.searchParams.get('after');
      if (after && !/^\d{17,20}$/.test(after)) throw new RelayError(400, 'Invalid message cursor.');
      const query = new URLSearchParams({ limit: '50' });
      if (after) query.set('after', after);
      const messages = await discord<DiscordMessage[]>(env, `/channels/${profile.discord_thread_id}/messages?${query}`);
      const ownPrefix = `[HANDLE: ${profile.handle}]\n`;
      const visible: VisibleMessage[] = [];
      for (const message of messages) {
        if (!message.id || !message.timestamp || message.webhook_id) continue;
        if (message.author?.id === env.DISCORD_APPLICATION_ID && message.author.bot === true && message.content?.startsWith(ownPrefix)) {
          visible.push({ id: message.id, author: 'you', text: message.content.slice(ownPrefix.length), createdAt: message.timestamp });
          continue;
        }
        if (message.author?.id === env.DISCORD_OWNER_USER_ID && message.author.bot !== true && message.content) {
          visible.push({ id: message.id, author: 'tom', text: message.content, createdAt: message.timestamp });
        }
      }
      visible.sort((a, b) => a.id.localeCompare(b.id));
      return json({ messages: visible, nextCursor: visible.at(-1)?.id || after || null });
    }

    throw new RelayError(404, 'Not found.');
  } catch (error) {
    if (error instanceof RelayError) return json({ error: error.message }, error.status);
    // Never log the bot token, provider identity, handle, message, or Discord response body.
    console.error('Resonant Relay request failed');
    return json({ error: 'The relay could not complete this request. No success is recorded by this response.' }, 503);
  }
}
