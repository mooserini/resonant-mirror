# Verified refinement submissions

The portfolio uses `/portfolio-api/*` in its own Worker. Red Door's `/api/*`, game accounts, credentials and recovery policy are unchanged. Authentication is required both to open the refinement workspace and to read or submit suggestions through its API.

## Identities and authority

- Passkeys are registered and authenticated using SimpleWebAuthn on the server. The server checks the challenge, origin, relying-party ID, signature and user verification. Challenges expire after five minutes and are consumed atomically. A cancelled, unavailable or invalid ceremony never fabricates success.
- A new visitor can register a passkey under a chosen display label. The account has an opaque ID and the `visitor` role; choosing another person's name confers no owner status.
- Google sign-in uses a separate, in-memory Firebase app with basic sign-in scopes and no Google Chat permissions. The Worker verifies Google's signing keys, token issuer/audience, expiry, verified email, recent authentication and Google provider. It creates an HttpOnly site session; browser-local authentication flags are ignored. For new visitor accounts, the provider subject binds the account while the provider profile name and email are not retained; the owner bootstrap still compares and retains the configured owner email.
- The initial owner is selected by the server secret `OWNER_GOOGLE_EMAIL` after successful Google verification. Once enrolled, ownership is bound to that Google UID and the persistent site account. A different UID cannot take ownership by presenting the same email later.
- Sign in with Google first to link a new passkey to that same account. Adding a key requires a session authenticated within the last ten minutes. New anonymous passkey registrations are always separate visitor accounts.
- Credentials created by the old frontend may still exist in the user's password manager. The old implementation did not store their public keys on the server, so it cannot supply the verification material needed to migrate them. It does not delete or overwrite saved keys. Unknown old keys fail with an enrollment explanation.
- Site sessions last twelve hours and use a random token whose SHA-256 hash is stored in D1. Cookies are Secure, HttpOnly, host-only and SameSite=Strict. Signing out revokes the server session. It does not remove passkeys.

## Relay handles

The Resonant Relay uses the same verified session but a separate `relay_profiles` record. A visitor must choose and confirm a unique 3–24 character handle before two-way messaging is available. Registering it updates the site's display label; authentication credentials, provider email, and provider profile name are not sent to Discord.

The account ID and provider subject remain private account-binding identifiers. They are not public names and are not included in Discord message content. Existing visitor records created before this rule are not silently rewritten or deleted. See [RESONANT-RELAY.md](RESONANT-RELAY.md).

## Suggestions and handoffs

Every submission is stored in D1 with its server-assigned account, display name, owner/visitor role, authentication method, authentication timestamp, passkey ID when applicable, receipt ID and content hash. Request-supplied author or role fields cannot override these values. The hash identifies the recorded content; it is not a public signature or proof that the proposal's claims are true.

Visitors can read only their own submissions. The owner can review all submissions. The UI shows the latest 200. There is no publishing endpoint. A suggested change remains submitted for review even after its brief is copied or downloaded. Briefs identify the site owner, request author and selected assistant separately. They can be handed to Hermes, ChatGPT/Codex, GrokBot, Grok Build or another assistant; no AI provider receives data automatically.

Old local ledger entries remain untouched and can be downloaded, after sign-in, as **unverified** drafts. They are not silently promoted to authenticated submissions. Refresh or close/reopen the form to confirm saved state after a network interruption; a lost response can leave the result uncertain.

## Operations

Database: `portfolio-refinements`, binding `REFINEMENTS_DB`. Schema is in `worker/migrations`. The owner email belongs in a Worker secret, not a `VITE_*` variable. Use `.dev.vars.example` for local setup; `.dev.vars` is ignored by Git. Production origin and RP ID are fixed to `https://www.getadongle.com` and `www.getadongle.com`.

For local browser testing, preserve the intended request origin:

```sh
npx wrangler d1 migrations apply portfolio-refinements --local
npx wrangler dev --ip 127.0.0.1 --port 4180 --local-upstream localhost:4180 --var AUTH_ORIGIN:http://localhost:4180 --var AUTH_RP_ID:localhost
```

Use `http://localhost:4180/index.html`. Local tests use a local database, not production accounts.

Post requests require the configured Origin and JSON. Request bodies are bounded at 32 KiB; titles at 180 characters and details at 12,000. Per-IP ten-minute limits are 60 authentication requests and 20 submissions. Expired sessions, ceremonies and rate counters are cleaned in bounded batches. Logs exclude tokens, assertions, account details and submitted text.

## Verification

`npm run lint`, `npm test -- --runInBand`, `npm run check:worker`, `npm run build`.

Worker tests exercise real generated P-256 keys and signed WebAuthn assertions, along with Google JWTs signed by a test-only issuer key supplied through Miniflare's outbound mock. Production has no mock verifier or authentication bypass. Tests cover wrong signatures/origins/RP IDs/challenges, missing user verification, wrong user handles, expiry, challenge replay, forged browser cookies, cross-origin submission, identity spoofing, owner binding, linked passkeys, visibility and logout. Browser tests cover cancellation and server rejection without reporting success.

A real owner Google sign-in and physical/passkey-manager enrollment require the owner to complete the browser prompts. Automated cryptographic fixtures do not establish that those user interactions have occurred.

On September 8, 2026, the owner reported completing both Google sign-in and Chrome passkey enrollment on the deployed site. The live panel showed Thomas Kenny, SITE OWNER, verified by passkey at 10:14:43 PM America/Detroit. A subsequent read-only production database query confirmed one owner account linked to Google and exactly one enrolled passkey on that same account. This verifies actual enrollment and the resulting authenticated session; a later, separate passkey sign-in and a real production suggestion submission were not part of this manual check.

## Deployment receipt

Deployed Worker version `20b93d3f-ac5d-46f4-93e5-470c32eaae3e`. Remote schema migration succeeded for database `86d43caa-b7a1-4cb3-8073-1bda7aaf2a0b`. Anonymous hosted checks returned a null session and HTTP 401 for refinements; Red Door continued returning its expected unauthenticated 401. Verification: 87 frontend/service tests and 17 Worker tests passed. The initial migration attempt returned Cloudflare error 7403; account scope and database existence were checked, and retry succeeded without changing permissions.
