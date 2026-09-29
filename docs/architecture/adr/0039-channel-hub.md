# ADR-0039: Autonomous app with an optional Channel Hub

- **Status:** Proposed
- **Date:** 2026-09-28
- **Deciders:** HELL, Irene
- **Supersedes:** the Telegram-centred channel plan in the first version of `docs/hackathon/`
  (ADR-0035 §Decision, S-1).

## Context

The first hackathon plan leaned on Telegram as the "always-on" surface. The founders decided that
FINCH must be a complete, self-sufficient product: its own inbox, its own notifications, its own
experience. External platforms — email, SMS, WhatsApp, Telegram, calendars — are valuable as
**extras** to bring information in (bank notifications, e-invoices) or send it out (alerts,
summaries), but no feature may depend on them.

Each external channel also has a different cost and onboarding profile: email is cheap and
immediate; SMS has per-message cost and numbering rules; WhatsApp Business requires business
verification, approved templates and opt-in; Telegram is free but niche.

## Decision

FINCH's primary surface is the FINCH app (installable web PWA now; native apps per ADR-0004/0006
later) with its **own inbox and push notifications**. All external platforms connect through a
**Channel Hub** port in the API, with one adapter per channel:

```text
ChannelPort
  inbound(message)  -> quarantine -> parse (deterministic first, AI second) -> ESTIMATED facts -> user confirmation
  outbound(notification, channel) -> template (minimal PII) -> adapter -> delivery log
Adapters: InApp (always on) · WebPush · Email · IcsCalendar · Telegram · Sms · WhatsApp
```

Rules:

1. Every feature works with only the InApp channel enabled.
2. Each external channel requires its own explicit consent and can be disabled at any time.
3. Inbound content is untrusted data: quarantined, never interpreted as instructions, and every
   extracted fact stays `ESTIMATED` until the user confirms it.
4. Outbound messages carry minimal PII ("You have a FINCH alert: payment due tomorrow"), never
   balances or account numbers, and deep-link into the app.
5. Delivery is idempotent and logged (Constitution §4.12); a channel failure never blocks the
   in-app notification.

Hackathon scope: InApp + WebPush + .ics export (H), Email in/out (H). Telegram, SMS and
WhatsApp are designed behind the port but built later (P).

## Alternatives considered

- **Telegram as the primary always-on channel.** Rejected: makes the product feel like a bot
  wrapped around a web page and ties the core experience to a third party.
- **WhatsApp first.** Rejected for the hackathon: Meta business verification and template approval
  do not fit the timeline; it is the most important LatAm channel post-incorporation.
- **No external channels.** Rejected: bank notifications and e-invoices arrive by email/SMS; reading
  them is a real differentiator for capture (catalog E1/E4).

## Consequences

### Positive

- A coherent, premium product that stands on its own; channels add reach without coupling.
- New channels are adapters, not features.

### Negative

- Web push on iOS requires the PWA to be installed to the home screen (VERIFY current behaviour);
  onboarding must guide it.

### Neutral / accepted trade-offs

- Email inbound needs a receiving domain and a transactional provider (cost to verify, D-08).

## Security impact

New inbound surface (email). Mitigations: per-user secret addresses, SPF/DKIM checks where
available, attachment type/size limits, malware scanning or strict type allowlist, prompt-injection
treatment of all content. Outbound channels could leak data on shared devices, hence minimal-PII
templates.

## Privacy impact

Consent per channel; channel identifiers (email, phone) classified as PII; export/delete includes
channel data.

## Cost

Email provider and receiving domain (small). SMS/WhatsApp costs deferred with their adapters.

## Migration

Replace Telegram tasks in the hackathon plan with InApp/WebPush/Email tasks (done in `docs/hackathon/05`).

## Rollback

Disable an adapter; the InApp channel keeps every feature working.

## References

- `docs/hackathon/08-feature-catalog.md` §H
- ADR-0022 (providers through internal ports), ADR-0027 (audit), ADR-0028 (data classification)
