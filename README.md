# The Resonant Mirror

The Resonant Mirror is Thomas Kenny's public portfolio and interactive terminal at [www.getadongle.com](https://www.getadongle.com/). It presents public work, identity references, and a playable entrance to [Red Door](https://www.getadongle.com/red-door) through an interface inspired by the AT&T PC6300 and 1980s terminal hardware.

The site is built with React, TypeScript, Vite, and a Cloudflare Worker. Its visual language is intentionally theatrical; its public claims and authentication boundaries are intended to remain inspectable.

## What the site contains

- A biographical dossier and links to Thomas's public GitHub, Hugging Face, ORCID, email, and GPG key.
- Eight curated project or contribution cards linked to public source.
- A contribution calendar derived from GitHub's public contribution page, with source, fetch time, and displayed date range shown in the interface.
- An interactive DOS-style console, boot sequence, light and dark themes, optional scanlines, and PC-speaker effects that start muted.
- A direct entrance to Red Door, a separate handle-and-password BBS game.
- A contact form that prepares a local `mailto:` draft. The site does not send, queue, archive, or encrypt the message.
- An authenticated refinement workspace for preparing suggestions and exporting assistant briefs.

The project-card sources and claim boundaries are recorded in [PUBLIC-SOURCES.md](PUBLIC-SOURCES.md). Descriptions summarize public repositories or pull requests; they are not independent performance measurements or security certifications.

## Public identity

| Reference | Public value |
| --- | --- |
| Name | Thomas Kenny |
| Aliases | Mooserini / Moosenberg |
| GitHub | [@mooserini](https://github.com/mooserini) |
| Hugging Face | [@mooserini](https://huggingface.co/mooserini) |
| ORCID | [0009-0000-9987-6106](https://orcid.org/0009-0000-9987-6106) |
| Email | [tom@getadongle.com](mailto:tom@getadongle.com) |
| GPG fingerprint | `E7B3 223E A0F0 3348 C674 7EBA 17B5 86FD 7394 2305` |

The public GPG key is available from [Thomas's GitHub account](https://github.com/mooserini.gpg). The site's optional armored-envelope display is explicitly a plaintext simulation, not encryption.

## Authentication and authority

The refinement workspace uses server-verified passkeys or Google sign-in. The Worker verifies the authentication result and creates an HttpOnly site session; browser-local flags and typed display names do not establish identity.

- Visitors can submit and read their own suggestions.
- The owner can review all submitted suggestions.
- Each submission receives server-assigned identity, authentication, receipt, and content-hash metadata.
- Exporting or copying a brief does not publish a site change and does not send data to an AI provider.
- The portfolio exposes no endpoint that publishes a submitted refinement.

Portfolio authentication is separate from Red Door authentication. It does not grant game access, change game credentials, or add a recovery path. See [AUTHENTICATION.md](AUTHENTICATION.md) for challenge verification, account binding, session storage, rate limits, and test coverage.

## Production shape

The Cloudflare Worker `resonant-mirror-portfolio` serves the Vite build on `www.getadongle.com`.

- `/portfolio-api/*` owns portfolio sign-in and refinement operations backed by the `REFINEMENTS_DB` D1 database.
- `/github-contributions.json` reads and validates GitHub's public contribution calendar without a GitHub credential, then caches successful responses at the edge for 15 minutes.
- `/api/*`, `/red-door`, and known Red Door assets are delegated to the separate Red Door Worker through the `RED_DOOR` service binding.
- The Red Door Worker, game database, credentials, and recovery policy are separate from this application.

Current route, migration, validation, and rollback receipts belong in [DEPLOYMENT.md](DEPLOYMENT.md), not in this README.

## Local development

Requirements: Node.js 22.12 or later and a compatible npm release. This checkout was verified with Node.js 22.23.2 and npm 10.9.8.

```sh
npm ci
npm run dev
```

The Vite development server listens on `http://localhost:3000`. It is sufficient for frontend work that does not require the Worker APIs.

Run the verification suite with:

```sh
npm run lint
npm test -- --runInBand
npm run check:worker
npm run build
```

For local Worker-backed authentication and refinement testing, follow [AUTHENTICATION.md](AUTHENTICATION.md). For deployment and dry-run commands, follow [DEPLOYMENT.md](DEPLOYMENT.md).

## Repository map

```text
src/                  React interface, portfolio data, and browser-side services
src/__tests__/        Frontend and service tests
public/               Font and image assets
worker/               Cloudflare Worker, authentication, routing, and D1 migrations
AUTHENTICATION.md      Identity, authority, and verification boundaries
DEPLOYMENT.md          Production topology, receipts, and rollback procedure
PUBLIC-SOURCES.md      Public project links and provenance notes
THIRD_PARTY_NOTICES.md Bundled material distributed under a separate license
wrangler.jsonc         Worker routes and bindings
```

## Typography and attribution

The interface uses the `Web AT&T PC6300` face by VileR from the [Ultimate Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/fontlist/font?att_pc6300). The bundled font is licensed separately under CC BY-SA 4.0; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Thomas Kenny's original source code is released under the [MIT License](LICENSE). That license does not replace the separate terms for bundled third-party material.
