# Resonant Relay

The Resonant Relay is a narrow bridge from the portfolio to one private Discord forum channel. It uses Discord as Thomas Kenny's operator dashboard; visitors never install the Discord app, join the server, receive its token, or receive Discord account access.

This document describes the current source. The D1 migration, public identifiers,
secret, automated validation, and isolated Discord smoke test are complete. The
relay version remains attached at 0% traffic and is not live for ordinary
visitors until an explicit production promotion.

## Visitor behavior

Anonymous visitors may provide an optional callsign and send a message after accepting the disclosure. The Worker creates a separate forum post and returns only an acceptance receipt. Anonymous visitors cannot list messages or receive replies. Anonymous transmissions are limited to three per IP address per ten-minute window.

Visitors who authenticate with a passkey or Google choose a unique site handle. The handle is the only identity label prepended to their Discord messages. The Worker maps that verified site account to one Discord forum thread. Those visitors may send messages and retrieve replies written by the configured Discord owner. Their browser checks when the panel opens, after activity, manually, and once per minute while the page is visible; it pauses while hidden or closed.

The relay does not send passkey material, session cookies, Google tokens, provider email, provider profile name, account ID, IP address, or the bot token to Discord. The private site account still retains an opaque account ID and, for Google sign-in, the provider subject required to find the same account again. Discord processes and retains the handle and message copy under [Discord's Privacy Policy](https://discord.com/privacy).

## Discord boundary

Current public identifiers:

| Item | Value |
| --- | --- |
| Application | `1545510996574216362` |
| Guild | `358496815521333248` |
| Private forum channel | `1547202057637994627` |
| Discord owner user | `358494366274158592` |

The old text channel `1547193998068813834` is not used. `DISCORD_OWNER_USER_ID` is pinned to Thomas's Discord user so the Worker returns only his human replies. Other users, bots, webhooks, attachments, embeds, and non-text payloads are filtered out of the browser response.

The bot permission integer is `274877975552`, containing only:

- View Channels
- Send Messages
- Send Messages in Threads
- Read Message History

Forum posts use Discord's `PUBLIC_THREAD` channel type internally even when the forum parent is private. The bot needs `SEND_MESSAGES` to create a forum post and `SEND_MESSAGES_IN_THREADS` to continue it; it does not need Create Public Threads, Create Private Threads, Manage Threads, Manage Messages, Administrator, or slash-command permission. Parent-channel access remains private through Discord channel overrides.

Message Content Intent is enabled for reply text. Presence and Server Members intents are not required. The integration uses Discord REST API v10, not Gateway events, webhooks, interactions, slash commands, user installation, or a public install link.

## Message safety

- Every outgoing message explicitly sets `allowed_mentions.parse` to an empty list, so handle or message text cannot ping users, roles, `@everyone`, or `@here`.
- Handles and callsigns use a restricted character set and length. Messages are limited to 1,800 characters, leaving room for the attribution prefix under Discord's 2,000-character limit.
- The public API is same-origin and POST requests require the portfolio Origin header.
- Bodies and Discord responses are size-bounded; upstream calls time out.
- Every send uses a browser-generated UUID recorded in D1 to reduce duplicate delivery after retries.
- Logs deliberately omit the token, provider identity, handle, message text, and Discord response body.

## Configuration

Public Worker variables live in `wrangler.jsonc`:

- `DISCORD_APPLICATION_ID`
- `DISCORD_GUILD_ID`
- `DISCORD_FORUM_CHANNEL_ID`
- `DISCORD_OWNER_USER_ID`

The only relay credential is `DISCORD_BOT_TOKEN`. For local development, copy `.dev.vars.example` to the ignored `.dev.vars` file and enter the token locally. While deployment is paused, create the production secret through Wrangler's interactive version-only prompt:

```sh
npx wrangler versions secret put DISCORD_BOT_TOKEN
```

This creates a new Worker version without assigning it live traffic. The ordinary `wrangler secret put` command deploys its new version immediately and is therefore not used during a deployment hold. Do not paste the token into a command argument, commit it, put it in a `VITE_*` variable, or expose it to the browser. Changing the public IDs or bot permission scope requires a new verification pass before deployment.

## Pre-deployment sequence

```sh
npx wrangler d1 migrations apply portfolio-refinements --local
npm run lint
npm test -- --runInBand
npm run check:worker
npm run deploy:check
```

Then verify locally with a development bot or intentionally scoped test credential. Production migration and deployment are separate, explicit actions. After deployment, test one anonymous dispatch, one registered handle, one outbound message, one reply, cross-handle isolation, hidden-tab polling pause, rate limiting, and the unchanged Red Door routes.
