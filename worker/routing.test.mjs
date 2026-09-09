import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const compiled = await build({ entryPoints: [new URL('./index.ts', import.meta.url).pathname], bundle: true, write: false, format: 'esm' });
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('Red Door POST retains its body, cookie and origin without touching static assets', async () => {
  const request = new Request('https://www.getadongle.com/api/commands', {
    method: 'POST', body: '{"command":"look"}',
    headers: { cookie: '__Host-reddoor=example-session', origin: 'https://www.getadongle.com' },
  });
  const response = await worker.fetch(request, {
    ASSETS: { fetch() { throw new Error('API must not reach the asset service'); } },
    RED_DOOR: { async fetch(forwarded) {
      assert.equal(forwarded, request);
      assert.equal(forwarded.headers.get('cookie'), '__Host-reddoor=example-session');
      assert.equal(forwarded.headers.get('origin'), 'https://www.getadongle.com');
      assert.equal(await forwarded.text(), '{"command":"look"}');
      return new Response('game response');
    } },
  });
  assert.equal(await response.text(), 'game response');
});

test('portfolio homepage is served by assets instead of the legacy site', async () => {
  const response = await worker.fetch(new Request('https://www.getadongle.com/'), {
    ASSETS: { fetch: async (request) => {
      assert.equal(new URL(request.url).pathname, '/index.html');
      return new Response('<h1>The Resonant Mirror</h1>');
    } },
    RED_DOOR: { fetch() { throw new Error('Homepage must not reach Red Door'); } },
  });
  assert.match(await response.text(), /The Resonant Mirror/);
});

test('clean legal URLs resolve to the portfolio policy documents', async () => {
  const expected = new Map([
    ['/privacy', '/privacy.html'],
    ['/privacy/', '/privacy.html'],
    ['/terms', '/terms.html'],
    ['/terms/', '/terms.html'],
  ]);
  for (const [requested, assetPath] of expected) {
    const response = await worker.fetch(new Request(`https://www.getadongle.com${requested}`), {
      ASSETS: { fetch: async (request) => {
        assert.equal(new URL(request.url).pathname, assetPath);
        return new Response('<h1>Public policy</h1>');
      } },
      RED_DOOR: { fetch() { throw new Error('Legal pages must not reach Red Door'); } },
    });
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Public policy/);
  }
});

test('legacy game scripts remain owned by Red Door', async () => {
  for (const path of ['/door.js', '/barkeep.js']) {
    const response = await worker.fetch(new Request(`https://www.getadongle.com${path}`), {
      ASSETS: { fetch() { throw new Error('Game script must not reach new assets'); } },
      RED_DOOR: { fetch: async () => new Response('legacy script') },
    });
    assert.equal(await response.text(), 'legacy script');
  }
});

test('Red Door entrance serves the original document with the existing session', async () => {
  const response = await worker.fetch(new Request('https://www.getadongle.com/red-door', {
    headers: { cookie: '__Host-reddoor=existing-session' },
  }), {
    RED_DOOR: { fetch: async (request) => {
      assert.equal(request.url, 'https://www.getadongle.com/');
      assert.equal(request.headers.get('cookie'), '__Host-reddoor=existing-session');
      return new Response('original entrance');
    } },
  });
  assert.equal(await response.text(), 'original entrance');
});

test('missing local assets return 404 without recursively fetching the preview', async () => {
  const response = await worker.fetch(new Request('http://localhost:8790/missing'), {
    ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) },
  });
  assert.equal(response.status, 404);
});
