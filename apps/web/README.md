# apps/web

Customer-facing web application.

**Stack:** Next.js 16.3.8 · React 19.2.3 · App Router · `@finch/ui-web` ·
`@finch/design-tokens`

## Responsibility

The customer-facing web client: the screens that exist in the FINCH Figma file
("03 · Auth" and "04 · Web app" pages, file key `aA7KzO0a2hg4cJY3zhDzkS`) rendered as
real routes, composed from `@finch/ui-web` components and no ad-hoc styling.

## Owns

- Customer web experience and its routing: `/signup`, `/login`, `/forgot-password`,
  `/check-email`, `/onboarding/1`–`/3`, `/hoy`, `/dinero`.
- Client-side session handling — not yet implemented; see "Does not own".

## Does not own

- Anything admin — apps/admin is a separate surface and is never merged into this one
  (§33.2, §52).
- Authorization decisions (§12).
- Authentication itself. Every form in `(auth)/` calls a local, inert
  `event.preventDefault()` rather than a real endpoint — wiring to `@finch/authorization`
  and an identity provider lands with FIN-021, not here. Do not read a working submit
  handler as a working auth flow.
- Server state fetching. `@tanstack/react-query` is declared (matching the documented
  stack) but nothing in this app calls it yet — `/hoy` and `/dinero` render the literal
  figures from the Figma file as static content, not live data. The data layer is a
  separate piece of work once `apps/api` has endpoints for this app to call.

## Invariants

- Sensitive authenticated responses use private/no-store cache policies (§116) — not
  yet applicable: no authenticated request exists in this app yet (see "Does not own").
  Revisit when real data fetching is added.
- Stale, estimated and verified values are visually distinguishable (§116) — enforced
  by construction: `/dinero`'s transaction table and `/hoy`'s safe-to-spend card render
  `@finch/ui-web`'s `TruthBadge`/`FreshnessStamp`, which cannot render a bare color (see
  `@finch/ui-web`'s own invariants).
- No analytics event carries a denylisted property; CI enforces it (§53) — not yet
  applicable: no analytics instrumentation exists in this app yet.

## Tests

`app/_lib/cx.test.ts` covers the CSS-module class-name helper.
`app/(auth)/_components/OtpInput.test.tsx` covers the check-email code input's focus
management (auto-advance, backspace-to-previous) and numeric-only filtering — the one
piece of real interactive logic in this pass that wasn't just composing
`@finch/ui-web` components.

## Unblocked by

FIN-012
