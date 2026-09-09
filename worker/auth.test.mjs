import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateKeyPairSync, createHash, sign, randomBytes } from 'node:crypto';
import { SignJWT, exportJWK } from 'jose';
import { encodeCBOR } from '@levischuck/tiny-cbor';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
const origin = 'https://www.getadongle.com', rp = 'www.getadongle.com', project = 'gen-lang-client-0304120170';
const compiled = await build({ entryPoints: [new URL('./index.ts', import.meta.url).pathname], bundle: true, write: false, format: 'esm', platform: 'browser', conditions: ['workerd', 'browser', 'import'] });
const schema = await readFile(new URL('./migrations/0001_verified_refinements.sql', import.meta.url), 'utf8');
const google = generateKeyPairSync('rsa', { modulusLength: 2048 });
const googleJwk = { ...await exportJWK(google.publicKey), alg: 'RS256', use: 'sig', kid: 'test-google-key' };
const sha = b => createHash('sha256').update(b).digest();
const b64 = b => Buffer.from(b).toString('base64url');
async function setup(run) {
  const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: compiled.outputFiles[0].text, compatibilityDate: '2026-09-07', compatibilityFlags: ['nodejs_compat'], d1Databases: ['REFINEMENTS_DB'], bindings: { AUTH_ORIGIN: origin, AUTH_RP_ID: rp, FIREBASE_PROJECT_ID: project, OWNER_GOOGLE_EMAIL: 'owner@example.test' }, outboundService: request => {
    assert.equal(request.url, 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
    return new Response(JSON.stringify({ keys: [googleJwk] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } });
  } }));
  try { const db = await mf.getD1Database('REFINEMENTS_DB'); await db.exec(schema.replace(/\n/g, ' ')); await run(mf, db); } finally { await mf.dispose(); }
}
function browser(mf) {
  const jar = new Map();
  return { jar, async request(path, body, overrides = {}) {
    const headers = { Origin: origin, 'Content-Type': 'application/json', Cookie: [...jar].map(([k,v]) => `${k}=${v}`).join('; '), ...overrides.headers };
    const res = await mf.dispatchFetch(origin + '/portfolio-api' + path, { method: body === undefined ? 'GET' : 'POST', body: body === undefined ? undefined : JSON.stringify(body), ...overrides, headers });
    for (const c of res.headers.getSetCookie()) { const [key,value] = c.split(';')[0].split('='); if (value) jar.set(key,value); else jar.delete(key); }
    return { status: res.status, data: await res.json(), headers: res.headers };
  } };
}
async function googleToken(email, uid, changes = {}) {
  return new SignJWT({ email, email_verified: true, name: 'Test name', auth_time: Math.floor(Date.now()/1000), firebase: { sign_in_provider: 'google.com' }, ...changes }).setProtectedHeader({ alg: 'RS256', kid: 'test-google-key' }).setIssuer(`https://securetoken.google.com/${project}`).setAudience(project).setSubject(uid).setIssuedAt().setExpirationTime('5m').sign(google.privateKey);
}
function authenticator() {
  const pair = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jwk = pair.publicKey.export({ format: 'jwk' }), id = randomBytes(24);
  const cose = encodeCBOR(new Map([[1,2],[3,-7],[-1,1],[-2,Buffer.from(jwk.x,'base64url')],[-3,Buffer.from(jwk.y,'base64url')]]));
  return { id: b64(id), register(options, overrides = {}) {
    this.user = options.user.id;
    const client = Buffer.from(JSON.stringify({ type: 'webauthn.create', challenge: options.challenge, origin, ...overrides.client }));
    const flags = overrides.flags ?? 0x45;
    const length = Buffer.alloc(2); length.writeUInt16BE(id.length);
    const data = Buffer.concat([sha(rp), Buffer.from([flags]), Buffer.alloc(4), Buffer.alloc(16), length, id, Buffer.from(cose)]);
    const attestation = encodeCBOR(new Map([['fmt','none'],['attStmt',new Map()],['authData',data]]));
    return { id: this.id, rawId: this.id, type: 'public-key', response: { clientDataJSON: b64(client), attestationObject: b64(attestation), transports: ['internal'] }, clientExtensionResults: {} };
  }, login(options, overrides = {}) {
    const client = Buffer.from(JSON.stringify({ type: 'webauthn.get', challenge: options.challenge, origin, ...overrides.client }));
    const count = Buffer.alloc(4); count.writeUInt32BE(overrides.counter ?? 1);
    const data = Buffer.concat([sha(overrides.rp || rp), Buffer.from([overrides.flags ?? 0x05]), count]);
    let signature = sign('sha256', Buffer.concat([data,sha(client)]), pair.privateKey);
    if (overrides.badSignature) signature[signature.length-1] ^= 1;
    return { id: this.id, rawId: this.id, type:'public-key', response: { clientDataJSON:b64(client), authenticatorData:b64(data), signature:b64(signature), userHandle:this.user }, clientExtensionResults:{} };
  } };
}
async function register(client, key, displayName = 'Visitor') {
  const options = await client.request('/auth/register/options',{ displayName }); assert.equal(options.status,200);
  const result = await client.request('/auth/register/verify',{ credential:key.register(options.data.options) }); assert.equal(result.status,200,JSON.stringify(result.data)); return result;
}
const suggestion = { title:'Correct the public link', details:'Use the public repository.', category:'project', priority:'normal' };

test('anonymous, forged cookie and cross-origin callers cannot submit or list refinements', async () => setup(async mf => {
  const c=browser(mf);
  assert.equal((await c.request('/refinements',suggestion)).status,401);
  assert.equal((await c.request('/refinements')).status,401);
  c.jar.set('__Host-rm_session','f'.repeat(64));
  assert.equal((await c.request('/refinements',{...suggestion,userId:'owner',isAuthenticated:true})).status,401);
  assert.equal((await c.request('/auth/register/options',{displayName:'Someone'},{headers:{Origin:'https://evil.test'}})).status,403);
}));

test('verified visitor passkey, real signed login, immutable attribution, receipt hash, isolation and logout', async () => setup(async (mf,db) => {
  const c=browser(mf), key=authenticator();
  const registered=await register(c,key,'Thomas Kenny');
  assert.equal(registered.data.session.role,'visitor');
  assert.match(registered.headers.get('set-cookie'),/Secure; HttpOnly; SameSite=Strict/);
  const user=registered.data.session.userId;
  const saved=await c.request('/refinements',{...suggestion,userId:'owner',role:'owner',authentication:{method:'google'}});
  assert.equal(saved.status,201); assert.equal(saved.data.item.userId,user); assert.equal(saved.data.item.role,'visitor'); assert.equal(saved.data.item.authentication.method,'passkey');
  const { contentHash, ...record }=saved.data.item; assert.equal(contentHash,sha(JSON.stringify(record)).toString('hex'));
  const other=browser(mf); await register(other,authenticator(),'Other');
  assert.deepEqual((await other.request('/refinements')).data.items,[]);
  const stolen=c.jar.get('__Host-rm_session'); await c.request('/auth/logout',{}); c.jar.set('__Host-rm_session',stolen);
  assert.equal((await c.request('/refinements')).status,401); c.jar.clear();
  const options=await c.request('/auth/login/options',{});
  const response=key.login(options.data.options);
  const logged=await c.request('/auth/login/verify',{credential:response}); assert.equal(logged.status,200,JSON.stringify(logged.data)); assert.equal(logged.data.session.userId,user);
  assert.equal((await c.request('/refinements')).data.items.length,1);
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM passkeys').first()).n,2);
}));

test('bad signature, wrong origin, wrong RP, missing user verification, wrong handle and expired challenges fail closed', async () => setup(async (mf,db) => {
  const c=browser(mf), key=authenticator(); await register(c,key); await c.request('/auth/logout',{});
  for (const bad of [{badSignature:true},{client:{origin:'https://evil.test'}},{rp:'evil.test'},{flags:1},{client:{challenge:'wrong-challenge'}}]) {
    const options=await c.request('/auth/login/options',{});
    const result=await c.request('/auth/login/verify',{credential:key.login(options.data.options,bad)});
    assert.equal(result.status,401,JSON.stringify(bad)); assert.equal((await c.request('/auth/session')).data.session,null);
  }
  let options=await c.request('/auth/login/options',{}); const response=key.login(options.data.options); response.response.userHandle=b64('other-account');
  assert.equal((await c.request('/auth/login/verify',{credential:response})).status,401);
  options=await c.request('/auth/login/options',{}); await db.prepare('UPDATE ceremonies SET expires_at=0').run();
  assert.equal((await c.request('/auth/login/verify',{credential:key.login(options.data.options)})).status,400);
}));

test('one-use challenges reject concurrent replay and registration cannot fabricate verification', async () => setup(async mf => {
  const c=browser(mf), key=authenticator();
  let options=await c.request('/auth/register/options',{displayName:'Visitor'});
  assert.equal((await c.request('/auth/register/verify',{credential:key.register(options.data.options,{flags:0x41})})).status,401);
  assert.equal((await c.request('/auth/session')).data.session,null);
  await register(c,key); await c.request('/auth/logout',{});
  options=await c.request('/auth/login/options',{}); const proof=key.login(options.data.options);
  const results=await Promise.all([c.request('/auth/login/verify',{credential:proof}),c.request('/auth/login/verify',{credential:proof})]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,400]);
}));

test('Google issuer signatures are verified, owner is bound to Google UID, enrolled keys retain that identity', async () => setup(async (mf,db) => {
  const c=browser(mf);
  assert.equal((await c.request('/auth/google',{idToken:'fake-token'})).status,401);
  assert.equal((await c.request('/auth/google',{idToken:await googleToken('owner@example.test','owner-uid',{email_verified:false})})).status,401);
  assert.equal((await c.request('/auth/google',{idToken:await googleToken('owner@example.test','owner-uid',{auth_time:1})})).status,401);
  const result=await c.request('/auth/google',{idToken:await googleToken('owner@example.test','owner-uid')});
  assert.equal(result.status,200,JSON.stringify(result.data)); assert.equal(result.data.session.role,'owner');
  const ownerId=result.data.session.userId, key=authenticator(); const registered=await register(c,key);
  assert.equal(registered.data.session.userId,ownerId); assert.equal(registered.data.session.authMethod,'passkey'); assert.equal(registered.data.session.role,'owner');
  await c.request('/auth/logout',{}); const options=await c.request('/auth/login/options',{}); const login=await c.request('/auth/login/verify',{credential:key.login(options.data.options)});
  assert.equal(login.data.session.role,'owner');
  const visitor=browser(mf); const v=await visitor.request('/auth/google',{idToken:await googleToken('other@example.test','visitor-uid')}); assert.equal(v.data.session.role,'visitor');
  await visitor.request('/refinements',suggestion);
  assert.equal((await c.request('/refinements')).data.items.length,1);
  const takeover=browser(mf); const changed=await takeover.request('/auth/google',{idToken:await googleToken('owner@example.test','different-uid')}); assert.equal(changed.data.session.role,'visitor');
  assert.equal((await db.prepare("SELECT COUNT(*) n FROM accounts WHERE role='owner'").first()).n,1);
}));

test('session expiry locks submissions and enrollment cannot switch to a different signed-in account', async () => setup(async (mf,db) => {
  const c=browser(mf); await register(c,authenticator());
  const options=await c.request('/auth/register/options',{}), key=authenticator();
  await c.request('/auth/logout',{});
  assert.notEqual((await c.request('/auth/register/verify',{credential:key.register(options.data.options)})).status,200);
  await register(c,authenticator()); await db.prepare('UPDATE sessions SET expires_at=0').run();
  assert.equal((await c.request('/refinements',suggestion)).status,401);
}));
