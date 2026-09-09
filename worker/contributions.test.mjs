import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const fixture = await readFile(new URL('./fixtures/github-public-calendar.html', import.meta.url), 'utf8');
const compiled = await build({ entryPoints: [new URL('./index.ts', import.meta.url).pathname], bundle: true, write: false, format: 'esm' });
async function withWorker(upstream, run) {
  const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: compiled.outputFiles[0].text,
    compatibilityDate: '2026-09-07', outboundService: upstream }));
  try { await run(mf); } finally { await mf.dispose(); }
}

test('serves the real public calendar and caches it without forwarding visitor credentials', async () => {
  let calls = 0;
  await withWorker(request => {
    calls++;
    assert.equal(request.url, 'https://github.com/users/mooserini/contributions');
    assert.equal(request.headers.get('cookie'), null);
    assert.equal(request.headers.get('authorization'), null);
    return new Response(fixture, { headers: { 'Content-Type': 'text/html' } });
  }, async mf => {
    const first = await mf.dispatchFetch('https://example.com/github-contributions.json', {
      headers: { Cookie: 'session=private', Authorization: 'Bearer visitor' },
    });
    assert.equal(first.status, 200);
    const data = await first.json();
    assert.equal(data.totalContributions, 152);
    assert.equal(data.days.length, 368);
    assert.deepEqual(data.days.find(d => d.date === '2026-09-08'), { date: '2026-09-08', level: 1, count: 1 });
    assert.equal(data.days.reduce((sum, day) => sum + day.count, 0), 152);
    assert.equal(data.days[0].date, '2025-09-07');
    const second = await mf.dispatchFetch('https://example.com/github-contributions.json?ignored=1');
    assert.deepEqual(await second.json(), data);
    assert.equal(calls, 1);
    const head = await mf.dispatchFetch('https://example.com/github-contributions.json', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
  });
});

for (const [name, body, status] of [
  ['upstream outage', 'Unavailable', 503],
  ['changed markup', '<html>Different calendar format</html>', 200],
  ['missing count', fixture.replace('No contributions on September 7th.', ''), 200],
  ['inconsistent total', fixture.replace('152', '999'), 200],
]) {
  test(`${name} returns an explicit, uncached failure with no substitute activity`, async () => {
    await withWorker(() => new Response(body, { status, headers: { 'Content-Type': 'text/html' } }), async mf => {
      const response = await mf.dispatchFetch('https://example.com/github-contributions.json');
      assert.equal(response.status, 502);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const data = await response.json();
      assert.ok(data.error);
      assert.equal(data.days, undefined);
    });
  });
}

test('rejects writes without contacting GitHub or Red Door', async () => {
  await withWorker(() => { throw new Error('Unexpected upstream request'); }, async mf => {
    const response = await mf.dispatchFetch('https://example.com/github-contributions.json', { method: 'POST' });
    assert.equal(response.status, 405);
  });
});
