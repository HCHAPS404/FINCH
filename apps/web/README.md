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
  `/reset-password`, `/check-email`, `/onboarding/1`–`/3`, `/hoy`, `/dinero`,
  `/yo/perfil`, `/yo/boveda`.
- `app/_lib/api.ts` — the typed fetch client for `apps/api` (ADR-0041), and
  `app/_lib/session.ts` — client-side session token storage. Real signup, login,
  password recovery, profile edit, debts/cards CRUD (`Dinero` → "Tarjetas" tab) and
  document upload (`/yo/boveda`) all call real `apps/api` endpoints against a real
  Postgres database — not mock data.

## Does not own

- Anything admin — apps/admin is a separate surface and is never merged into this one
  (§33.2, §52).
- Authorization decisions (§12) — enforced server-side by `apps/api`'s
  `AuthorizationGuard`; this app only reacts to a 403.
- A real session cookie. `app/_lib/session.ts` stores the opaque session token in
  `localStorage`, documented there as temporary: `apps/api` has no `@fastify/cookie`
  support wired in yet. Not a security boundary beyond what React itself provides.
- Most of the product surface's live data. `/hoy`, `/oportunidades`, `/finch` and most
  of `/dinero` (everything except the "Tarjetas" tab) still render the literal figures
  from the Figma file / product-spec docs as static content — there are no
  Account/Transaction tables in `apps/db` yet for them to call. Not silently dropped,
  just out of this pass's scope.

## Invariants

- Sensitive authenticated responses use private/no-store cache policies (§116) — not
  yet applicable: every authenticated call here is a plain `fetch` with no client-side
  cache layer (no React Query wiring yet), so there is nothing to mark private.
  Revisit once a cache layer is added.
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
