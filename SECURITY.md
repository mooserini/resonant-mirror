# Security Policy

The Resonant Mirror is a public portfolio with a Cloudflare Worker, server-verified sign-in, a D1-backed refinement workspace, and delegated routes to the separate Red Door application. This policy explains what is supported, what should be reported privately, and which visible behaviors are intentional.

## Supported surfaces

This project does not currently publish numbered releases. Security maintenance applies to:

- The production portfolio at [www.getadongle.com](https://www.getadongle.com/).
- The currently maintained source for that deployment.
- The portfolio Worker, its D1 schema, and its documented service bindings.

Historical commits, forks, archived exports, and independently modified deployments are not supported. [DEPLOYMENT.md](DEPLOYMENT.md) records the production topology and the latest checked deployment state; it is a dated receipt, not a guarantee that external services have remained unchanged.

## Reportable security issues

Please report vulnerabilities that could materially affect the confidentiality, integrity, availability, identity, or authorization boundaries of the maintained application. Examples include:

- Authentication or authorization bypasses in `/portfolio-api/*`.
- Forged owner identity, cross-account suggestion access, passkey replay, session fixation, or session theft.
- Cross-origin request failures, injection, or cross-site scripting with a practical security impact.
- Exposure of secrets, authentication material, private suggestion content, or sensitive server logs.
- Worker routing or service-binding errors that cross the portfolio and Red Door boundaries or expose protected data.
- Dependency vulnerabilities that are demonstrably reachable through this application.
- A way for a refinement or exported brief to publish a site change or contact an AI provider without an explicit separate action.

If a vulnerability is reached through `/red-door` or a delegated Red Door asset, use the same private reporting route and identify Red Door in the report. The issue may be handled in its separate codebase.

## Intentional behavior and public data

The following are not vulnerabilities by themselves:

- Portfolio pages, public project links, ORCID, GitHub activity, the public GPG key, and the published contact address are intentionally public.
- The contact form prepares a local `mailto:` draft. It does not send, queue, archive, or encrypt email on the server.
- The optional armored-envelope display is a plaintext simulation, not cryptographic encryption.
- Visitors may create accounts and submit suggestions, but cannot assign themselves the owner role or publish changes.
- Copying or downloading a refinement brief does not send it to an assistant.
- Portfolio authentication and Red Door authentication are separate.
- Red Door intentionally has no email recovery, password reset, recovery key, or operator-reset path. A bypass, credential disclosure, or cross-account data exposure remains reportable.

For the exact authentication and authority model, see [AUTHENTICATION.md](AUTHENTICATION.md).

## Report privately

Do not open a public issue for an undisclosed vulnerability.

Preferred method: use GitHub's enabled [private vulnerability reporting](https://github.com/mooserini/resonant-mirror/security/advisories/new). A draft advisory is visible only to the reporter and repository maintainers until it is deliberately published.

If GitHub private reporting is unavailable, send a GPG-encrypted email to [tom@getadongle.com](mailto:tom@getadongle.com) with the subject `[SECURITY] Resonant Mirror`. Thomas Kenny's public key is available at [github.com/mooserini.gpg](https://github.com/mooserini.gpg).

Verify this fingerprint before encrypting:

```text
E7B3 223E A0F0 3348 C674 7EBA 17B5 86FD 7394 2305
```

Include:

- A concise description of the vulnerability and its likely impact.
- The affected URL, endpoint, component, commit, or deployment context.
- Minimal reproduction steps or a minimal proof of concept.
- Relevant browser, operating-system, or network conditions.
- Whether you want public credit if an advisory is eventually published.

Do not include plaintext passwords, session cookies, passkey material, OAuth tokens, API keys, or unrelated personal data. If sensitive data appears during testing, stop, preserve only the minimum evidence needed to identify the issue, and report it privately.

## Good-faith testing boundaries

Please:

- Use accounts and data you own or have explicit permission to test.
- Stop when you demonstrate the vulnerability; do not establish persistence or expand access.
- Avoid denial-of-service testing, destructive actions, social engineering, automated high-volume traffic, and data exfiltration.
- Do not test GitHub, Google, Firebase, Cloudflare, email providers, or other third-party infrastructure through this policy. Report vulnerabilities in those services to their operators.
- Allow reasonable time for investigation and mitigation before public disclosure.

There is no bug-bounty program or guaranteed response-time commitment. Reports will be acknowledged, investigated, and coordinated as availability permits. Confirmed issues will be documented with the affected surface, mitigation, and verification evidence appropriate to their impact.
