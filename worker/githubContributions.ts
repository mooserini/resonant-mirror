import { validateCalendar, type PublicContributionCalendar } from '../src/utils/githubContributions';

export const CONTRIBUTIONS_SOURCE = 'https://github.com/users/mooserini/contributions';

/** Read GitHub's public calendar HTML. Format changes fail closed, never fabricate data. */
export async function readPublicCalendar(response: Response): Promise<PublicContributionCalendar> {
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html') || !response.body) {
    throw new Error('GitHub calendar unavailable');
  }
  const cells = new Map<string, { date: string; level: number }>();
  const labels = new Map<string, string>();
  let tooltipId = '';
  let heading = '';
  let bytes = 0;
  const bounded = response.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      bytes += chunk.byteLength;
      if (bytes > 2_000_000) throw new Error('Calendar response too large');
      controller.enqueue(chunk);
    },
  }));
  const parsed = new HTMLRewriter()
    .on('td.ContributionCalendar-day[data-date]', {
      element(element) {
        const id = element.getAttribute('id');
        const date = element.getAttribute('data-date');
        const level = element.getAttribute('data-level');
        if (!id || !date || level === null || !/^[0-4]$/.test(level) || cells.has(id)) {
          throw new Error('Invalid calendar cell');
        }
        cells.set(id, { date, level: Number(level) });
      },
    })
    .on('tool-tip[for]', {
      element(element) {
        tooltipId = element.getAttribute('for') || '';
        if (labels.has(tooltipId)) throw new Error('Duplicate calendar label');
        labels.set(tooltipId, '');
      },
      text(chunk) { labels.set(tooltipId, (labels.get(tooltipId) || '') + chunk.text); },
    })
    .on('#js-contribution-activity-description', {
      text(chunk) { heading += chunk.text; },
    })
    .transform(new Response(bounded, { headers: { 'Content-Type': 'text/html' } }));
  await parsed.body!.pipeTo(new WritableStream({ write() {} }));
  const total = heading.trim().match(/^([\d,]+)\s+contributions?\s+in the last year$/);
  if (!total) throw new Error('Missing annual contribution total');
  const days = [...cells].map(([id, cell]) => {
    const label = labels.get(id)?.trim().match(/^(No|[\d,]+) contributions? on /);
    if (!label) throw new Error('Missing contribution count');
    return { ...cell, count: label[1] === 'No' ? 0 : Number(label[1].replaceAll(',', '')) };
  }).sort((a, b) => a.date.localeCompare(b.date));
  return validateCalendar({ days, totalContributions: Number(total[1].replaceAll(',', '')),
    fetchedAt: new Date().toISOString() });
}

export async function serveContributions(request: Request, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  // Fixed public account and cache key: no credentials, cookies, or caller-selected URLs upstream.
  const cacheKey = new Request(new URL('/github-contributions.json', request.url));
  const cache = caches.default;
  try {
    const cached = await cache.match(cacheKey);
    if (cached) return request.method === 'HEAD' ? new Response(null, cached) : cached;
    const upstream = await fetch(CONTRIBUTIONS_SOURCE, {
      headers: { Accept: 'text/html', 'Accept-Language': 'en-US', 'User-Agent': 'Resonant-Mirror-Portfolio' },
      signal: AbortSignal.timeout(12000),
    });
    const calendar = await readPublicCalendar(upstream);
    const response = Response.json(calendar, {
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=900', 'X-Content-Type-Options': 'nosniff' },
    });
    ctx.waitUntil(cache.put(cacheKey, response.clone()).catch(() => {
      console.error('Contribution calendar cache write failed');
    }));
    return request.method === 'HEAD' ? new Response(null, response) : response;
  } catch {
    console.error('Public GitHub contribution calendar unavailable or invalid');
    return Response.json({ error: 'GitHub contributions are temporarily unavailable. View the public profile or retry.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
