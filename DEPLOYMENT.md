# Custom-domain deployment

The portfolio at https://www.getadongle.com is built from the AI Studio export
at upstream commit `7644c510083ff05a5856643eb51213506bc2ba92`.
The PC6300 font, visual design, project descriptions, and interactive consoles
are retained. Public contact is `tom@getadongle.com`. The former browser-side
Google Chat client has been removed from current source in favor of the
server-side Resonant Relay described in `RESONANT-RELAY.md`.

## Identity and contact

- ORCID: https://orcid.org/0009-0000-9987-6106 (matched the GitHub profile).
- GitHub: https://github.com/mooserini
- LinkedIn: https://www.linkedin.com/in/mooserini/
- Hugging Face: https://huggingface.co/mooserini
- Unavailable project repository URLs now lead to the owner's GitHub profile;
  SendBlue links to `mooserini/mac-inac-sendblue`.
- Contact creates a local email draft. The visitor must send it from their mail
  application. No backend email delivery or encrypted delivery is claimed.
- Existing decorative metrics and simulations are not independently certified.

## Hosting and authentication

Cloudflare Worker `resonant-mirror-portfolio` serves the Vite build from `dist`.
It owns only `www.getadongle.com/*`. The apex domain remains on Worker `red-door`.
An existing domain redirect sends apex visitors to www; the original game
entrance is therefore preserved at https://www.getadongle.com/red-door.
Existing `/api/` requests and known Red Door assets delegate through the
`RED_DOOR` service binding; other missing production paths pass to the existing
origin. The Red Door Worker, D1 database, and R2 bucket are not modified.

Firebase project `gen-lang-client-0304120170` retains its existing Google OAuth
configuration for site sign-in. `www.getadongle.com` was added to Authentication
Settings > Authorized domains with the owner's approval. The current browser
code requests basic Google sign-in only; it does not request Google Chat scopes.
Firebase web configuration is public client configuration; private provider
credentials must not be bundled.

## Build and deploy

```sh
npm ci
npm run lint
npm test -- --runInBand
npm run check:worker
npm run deploy:check
npx wrangler deploy
```

Migration `0002_resonant_relay.sql` was applied to the remote
`portfolio-refinements` database on 2026-09-09. The `DISCORD_BOT_TOKEN` Worker
secret was created through the interactive
`wrangler versions secret put` flow, which produced an unpublished version; the
live deployment remained unchanged. The secret receipt is version
`903325d9-fcf0-44d2-93e2-4820d45be503`; deployment status remained 100% on
`1a024f66-3c5b-4342-b52a-7dbad9c5eb0d`. Wrangler `4.129.0` performed the
operation and reported `4.130.0` available; the update was not installed before
or during this receipt. Afterward, the project was upgraded to Wrangler
`4.130.0` with its matching Miniflare `5.20260908.0-alpha`; 86 app tests, 22
Worker tests, both TypeScript checks, the production build, and Wrangler's dry
run passed on 2026-09-09. The owner's public Discord user ID is already pinned
in `wrangler.jsonc`. Do not place the token in
`wrangler.jsonc`, `.env`, source, a command argument, or chat. This
checkout has not deployed the relay merely because the code or documentation is
present.

The clean relay smoke-test version is
`b29cf7a5-bedd-4cb2-a066-f70e0ce042c8`. It was attached to the deployment at
0% while `1a024f66-3c5b-4342-b52a-7dbad9c5eb0d` remained at 100%. A version-
override request on 2026-09-09 returned HTTP 201 and created one private Discord
forum post. D1 recorded one delivered dispatch; replaying the same request
returned `duplicate: true` without another Discord post, and an anonymous read
returned HTTP 401. Discord's UI visibly confirmed the expected handle prefix
and message. This smoke-test split does not send ordinary visitor traffic to the
relay version.

Local preview: `npx wrangler dev --local --port 8790`, then open
`http://127.0.0.1:8790/`. The Red Door service binding needs a running matching
Worker for local integration tests; the routing suite tests delegation separately.

## Cutover and rollback receipt

Before cutover, both domain routes pointed to `red-door` in zone
`4e2ee5bb4dee2ff2ddcced14e2e0d5e9`:

| Pattern | Route ID |
| --- | --- |
| `www.getadongle.com/*` | `8637f67631ca4baa9579a53bf18752af` |
| `getadongle.com/*` | `63103cffc1fe48ed8ca0081d0f7b8fe9` |

The active Red Door version was `a2821989-f25f-4970-b46a-4163ea68f00d`.
Rollback is to set the existing **www route** back to script `red-door`;
no database restore, code rollback, DNS change, or deletion is necessary.
Do not change the apex route.

Local validation before publication passed 82 app tests, five Worker routing
tests, both TypeScript checks, the production build, and Wrangler's dry run.
The browser preview verified the preserved layout and an unsent email draft.
Live validation on 2026-09-07 confirmed:

- Worker version `613a0562-4c7e-433b-b681-264ee2a3585c` serves www.
- The portfolio renders in Chrome; `/index.html` returns HTTP 200.
- An existing `/` redirect is supported by serving `/index.html` directly,
  without a reverse canonical redirect.
- Google OAuth sign-in completed on www after the owner approved Google's
  existing unverified-test-app warning. Existing Chat conversations loaded.
  No messages were sent. Public access for arbitrary Google accounts is not
  certified: the OAuth app remains in testing and may restrict non-test users.
- `/red-door` and `/door.js` return HTTP 200. The original terminal boot screen
  renders. `/api/world` returns the existing unauthenticated HTTP 401 JSON,
  confirming delegation reaches the game service. No game state was changed.
- The apex Worker route remains assigned to `red-door`.

The hosting account's existing Cloudflare JavaScript checks may inject scripts
into HTML or block some automated clients; the deployed app was checked in the
browser as well as with curl. These zone settings were not changed.

## Public GitHub contribution calendar

`GET /github-contributions.json` reads `https://github.com/users/mooserini/contributions`
without authentication and preserves the public calendar's daily counts and intensity
levels. GitHub's public HTML is not a versioned API: markup changes, missing day
counts, nonconsecutive dates, and total mismatches return HTTP 502, never sample data.
The source dates can differ from a signed-in GitHub calendar's timezone presentation.

Successful responses are cached at the edge for 15 minutes. The UI refreshes on load
and every 15 minutes and displays the fetch time, source link, and date range. Failure
shows an unavailable message with retry and GitHub links. Streaks and peak/active-day
metrics are computed from the displayed days; the ending streak includes the final
source day, even if it has no contributions. Counts are contributions, not just commits.

`npm run check:worker` includes real Workers-runtime calendar parsing, caching,
credential-isolation, and failure tests against a reduced public HTML fixture fetched
on 2026-09-09. `npm test -- --runInBand` validates dates and derived metrics.

## Verified refinement workspace

The portfolio Worker now owns `/portfolio-api/*` and the separate `REFINEMENTS_DB` D1 database. Apply `worker/migrations` before publishing. Configure `OWNER_GOOGLE_EMAIL` as a Worker secret, then have the owner sign in with Google and enroll a passkey. See `AUTHENTICATION.md` for the exact authority boundaries and local test procedure. Existing browser passkeys and local drafts are preserved; legacy success flags do not establish authentication.
