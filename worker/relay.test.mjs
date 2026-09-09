import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const origin = 'https://www.getadongle.com';
const app = '1545510996574216362';
const guild = '358496815521333248';
const forum = '1547202057637994627';
const owner = '1547202057637994998';
const thread = '1547202057637994999';
const firstMessage = '1547202057637995000';
const compiled = await build({ entryPoints: [new URL('./index.ts', import.meta.url).pathname], bundle: true, write: false, format: 'esm', platform: 'browser', conditions: ['workerd', 'browser', 'import'] });
const schema = (await Promise.all([
  readFile(new URL('./migrations/0001_verified_refinements.sql', import.meta.url), 'utf8'),
  readFile(new URL('./migrations/0002_resonant_relay.sql', import.meta.url), 'utf8'),
])).join('\n');

async function setup(run, outboundService, overrides = {}) {
  const mf = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    script: compiled.outputFiles[0].text,
    compatibilityDate: '2026-09-09',
    compatibilityFlags: ['nodejs_compat'],
    d1Databases: ['REFINEMENTS_DB'],
    bindings: {
      AUTH_ORIGIN: origin,
      AUTH_RP_ID: 'www.getadongle.com',
      FIREBASE_PROJECT_ID: 'test-project',
      OWNER_GOOGLE_EMAIL: 'owner@example.test',
      DISCORD_APPLICATION_ID: app,
      DISCORD_GUILD_ID: guild,
      DISCORD_FORUM_CHANNEL_ID: forum,
      DISCORD_OWNER_USER_ID: owner,
      DISCORD_BOT_TOKEN: 'test-token-that-is-long-enough-to-pass-validation',
      ...overrides,
    },
    outboundService,
  }));
  try {
    const db = await mf.getD1Database('REFINEMENTS_DB');
    await db.exec(schema.replace(/\n/g, ' '));
    await run(mf, db);
  } finally { await mf.dispose(); }
}

function client(mf, cookie = '') {
  return async function request(path, body, headers = {}) {
    const response = await mf.dispatchFetch(`${origin}/portfolio-api${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: { Origin: origin, Cookie: cookie, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    });
    return { status: response.status, data: await response.json() };
  };
}

async function signedIn(db, id = 'account-1', display = 'Visitor') {
  const token = 'a'.repeat(64);
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const t = Math.floor(Date.now() / 1000);
  await db.prepare("INSERT INTO accounts (id, display_name, role, created_at) VALUES (?, ?, 'visitor', ?)").bind(id, display, t).run();
  await db.prepare("INSERT INTO sessions VALUES (?, ?, 'passkey', ?, ?, ?)").bind(tokenHash, id, 'test-key', t, t + 3600).run();
  return `__Host-rm_session=${token}`;
}

test('anonymous relay is disclosed, rate-bounded, mention-safe and send-only', async () => {
  const requests = [];
  await setup(async mf => {
    const request = client(mf);
    const payload = { requestId: '11111111-1111-4111-8111-111111111111', message: '@everyone hello', callsign: 'Night Owl' };
    assert.equal((await request('/relay/messages', payload)).status, 400);
    const sent = await request('/relay/messages', { ...payload, acceptedDisclosure: true });
    assert.equal(sent.status, 201, JSON.stringify(sent.data));
    assert.equal((await request('/relay/messages')).status, 401);
    const duplicate = await request('/relay/messages', { ...payload, acceptedDisclosure: true });
    assert.equal(duplicate.data.duplicate, true);
    assert.equal(requests.length, 1);
    const body = JSON.parse(requests[0].body);
    assert.equal(body.name, 'anonymous-11111111');
    assert.deepEqual(body.message.allowed_mentions, { parse: [] });
    assert.match(body.message.content, /^\[HANDLE: ANONYMOUS \/ Night Owl\]\n@everyone hello$/);
  }, async request => {
    requests.push({ url: request.url, body: await request.text(), authorization: request.headers.get('authorization') });
    assert.equal(request.url, `${'https://discord.com/api/v10'}/channels/${forum}/threads`);
    assert.match(request.headers.get('authorization'), /^Bot /);
    return Response.json({ id: thread, guild_id: guild, parent_id: forum, message: { id: firstMessage } });
  });
});

test('verified account chooses one handle, receives one thread and reuses it', async () => {
  const requests = [];
  await setup(async (mf, db) => {
    const request = client(mf, await signedIn(db));
    assert.equal((await request('/relay/handle', { handle: 'MirrorGuest', acceptedDisclosure: false })).status, 400);
    const saved = await request('/relay/handle', { handle: 'MirrorGuest', acceptedDisclosure: true });
    assert.equal(saved.status, 201);
    assert.equal((await db.prepare('SELECT display_name FROM accounts WHERE id=?').bind('account-1').first()).display_name, 'MirrorGuest');
    const one = await request('/relay/messages', { requestId: '22222222-2222-4222-8222-222222222222', message: 'first' });
    assert.equal(one.status, 201, JSON.stringify(one.data));
    const two = await request('/relay/messages', { requestId: '33333333-3333-4333-8333-333333333333', message: 'second' });
    assert.equal(two.status, 201, JSON.stringify(two.data));
    assert.equal(requests.length, 2);
    assert.equal(requests[0].url, `${'https://discord.com/api/v10'}/channels/${forum}/threads`);
    assert.equal(requests[1].url, `${'https://discord.com/api/v10'}/channels/${thread}/messages`);
    assert.match(requests[1].body, /\[HANDLE: MirrorGuest\]\\nsecond/);
  }, async request => {
    const body = await request.text(); requests.push({ url: request.url, body });
    if (request.url.endsWith('/threads')) return Response.json({ id: thread, guild_id: guild, parent_id: forum, message: { id: firstMessage } });
    return Response.json({ id: '1547202057637995001' });
  });
});

test('message listing returns only the handle messages and configured owner replies', async () => setup(async (mf, db) => {
  const request = client(mf, await signedIn(db));
  await db.prepare("INSERT INTO relay_profiles (account_id, handle, handle_key, discord_thread_id, disclosure_version, accepted_at, created_at) VALUES (?, ?, ?, ?, 'relay-privacy-v1', 1, 1)").bind('account-1', 'MirrorGuest', 'mirrorguest', thread).run();
  const result = await request('/relay/messages');
  assert.equal(result.status, 200, JSON.stringify(result.data));
  assert.deepEqual(result.data.messages.map(message => [message.author, message.text]), [['you', 'hello'], ['tom', 'reply']]);
}, async request => {
  assert.match(request.url, new RegExp(`/channels/${thread}/messages\\?limit=50$`));
  return Response.json([
    { id: '1547202057637995002', content: 'private intruder text', timestamp: '2026-09-09T12:02:00Z', author: { id: '1547202057637994888', bot: false } },
    { id: '1547202057637995001', content: 'reply', timestamp: '2026-09-09T12:01:00Z', author: { id: owner, bot: false } },
    { id: '1547202057637995000', content: '[HANDLE: MirrorGuest]\nhello', timestamp: '2026-09-09T12:00:00Z', author: { id: app, bot: true } },
    { id: '1547202057637995003', content: '[HANDLE: Other]\nwrong thread label', timestamp: '2026-09-09T12:03:00Z', author: { id: app, bot: true } },
    { id: '1547202057637995004', content: 'webhook', timestamp: '2026-09-09T12:04:00Z', author: { id: app, bot: true }, webhook_id: '1547202057637994777' },
  ]);
}));

test('a thread creation claim is never treated as a Discord channel ID', async () => setup(async (mf, db) => {
  const request = client(mf, await signedIn(db));
  await db.prepare("INSERT INTO relay_profiles (account_id, handle, handle_key, discord_thread_id, thread_claimed_at, disclosure_version, accepted_at, created_at) VALUES (?, ?, ?, ?, ?, 'relay-privacy-v1', 1, 1)")
    .bind('account-1', 'MirrorGuest', 'mirrorguest', 'pending:22222222-2222-4222-8222-222222222222', 1).run();
  const result = await request('/relay/messages');
  assert.equal(result.status, 200);
  assert.deepEqual(result.data, { messages: [], nextCursor: null });
}, () => { throw new Error('A pending claim must not be sent to Discord'); }));

test('relay fails closed for cross-origin posts and incomplete public configuration', async () => setup(async mf => {
  const request = client(mf);
  const payload = { requestId: '44444444-4444-4444-8444-444444444444', message: 'hello', acceptedDisclosure: true };
  assert.equal((await request('/relay/messages', payload, { Origin: 'https://evil.test' })).status, 403);
  assert.equal((await request('/relay/messages', payload)).status, 503);
}, () => { throw new Error('Discord must not be called'); }, { DISCORD_OWNER_USER_ID: 'REPLACE_WITH_DISCORD_USER_ID' }));
