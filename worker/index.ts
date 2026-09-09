import { serveRefinements } from './refinementAuth';
import { serveContributions } from './githubContributions';

// Keep the existing Red Door API and its published scripts on the same origin.
const redDoorPaths = new Set([
  '/mirror.css', '/mirror.js', '/door.js', '/pacing.js', '/auth.js', '/barkeep.js',
  '/assets/projects-core.v1.js', '/assets/projects.json',
  '/assets/fonts/Ac437_ATT_PC6300.ttf', '/assets/linktree-qr-400.png',
]);

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/portfolio-api/')) return serveRefinements(request, env, ctx);
    if (url.pathname === '/github-contributions.json') return serveContributions(request, ctx);
    if (url.pathname === '/red-door/') {
      url.pathname = '/red-door';
      return Response.redirect(url.toString(), 307);
    }
    if (url.pathname === '/red-door') {
      url.pathname = '/';
      return env.RED_DOOR.fetch(new Request(url, request));
    }
    if (url.pathname.startsWith('/api/') || redDoorPaths.has(url.pathname)) {
      return env.RED_DOOR.fetch(request);
    }

    // Serve the document directly at both URLs, avoiding canonicalization loops
    // with existing origin redirects or browser-cached index redirects.
    const assetUrl = new URL(request.url);
    if (assetUrl.pathname === '/') assetUrl.pathname = '/index.html';
    const asset = await env.ASSETS.fetch(new Request(assetUrl, request));
    if (asset.status !== 404) return asset;

    // Retain unrelated pages at the existing proxied origin. Local/preview
    // requests must not fetch themselves recursively.
    if (url.hostname === 'www.getadongle.com') return fetch(request);
    return asset;
  },
} satisfies ExportedHandler<Env>;
