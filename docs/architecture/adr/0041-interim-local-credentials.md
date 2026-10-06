# ADR-0041: Interim local email+password credentials until ADR-0015 resolves

- **Status:** Accepted
- **Date:** 2026-10-06
- **Deciders:** HELL
- **Supersedes:** none — narrows ADR-0015 (OIDC identity provider selection), which
  stays Proposed/open for the eventual federated choice

## Context

ADR-0015 is deliberately still open: README §112 defers the choice between Auth0,
Cognito and other OIDC providers, and that decision has not been made. Until now the
only working login was `DevAuthSessionAdapter` (`apps/api/src/infrastructure/auth/`)
— it accepts any `principalId` string with no password check at all, and is
explicitly disqualified outside `local`/`dev`/`test` by `isAuthSandboxEligible`
(`packages/domain/src/auth-session.ts`). That is correct for exercising the
authorization chain, but it cannot prove signup, login, password recovery, or
per-user data ownership actually work end to end, because there is no real
credential behind it.

Constitution §76 requires an ADR before an "auth architecture change." This is one:
it adds a real credential store and a second `AuthSessionPort` implementation.
Writing it as its own ADR, rather than folding it into ADR-0015, keeps ADR-0015
honest — it still records that the *federated* vendor choice is unresolved — while
giving the interim mechanism its own accountable decision record.

## Decision

Add a `security.credentials` table (one row per `Principal`, email + salted password
hash) and a `PasswordAuthSessionAdapter` implementing the existing `AuthSessionPort`
(`issue`/`verify`) with the same opaque HMAC-signed token shape
`DevAuthSessionAdapter` already uses, but signed with a configured, stable secret
(`AUTH_SESSION_SECRET`) instead of a per-process random one, and only issued after a
real password check (Node's built-in `crypto.scrypt`, implemented at the composition
root in `apps/api/src/infrastructure/security/` — not in `@finch/domain`, which has no
`@types/node` dependency anywhere in the package tree and cannot import `node:crypto`
directly; `@finch/domain` owns only the pure, Node-free half, `isResetTokenExpired`).
This is the identity mechanism for every environment, including
production, until ADR-0015 selects and wires a federated provider. `AuthModule`
wires `PasswordAuthSessionAdapter` to `AUTH_SESSION_PORT` unconditionally;
`DevAuthSessionAdapter` continues to exist only as the sandbox shortcut gated by
`isAuthSandboxEligible`, unchanged.

## Alternatives considered

- **Wait for ADR-0015 and keep using the dev sandbox meanwhile.** Rejected for this
  pass: it leaves signup, login, password recovery, and per-user data ownership
  completely unverified, which was the explicit goal of this work. The dev sandbox
  also cannot run outside `local`/`dev`/`test` by design, so nothing built against it
  demonstrates a path to a real environment.
- **Pick a federated provider now (Auth0/Cognito) instead of a local credential
  store.** Rejected: that is exactly the decision ADR-0015 reserves for later, with
  its own cost/lock-in/compliance evaluation (README §112, §117). Forcing it now to
  unblock unrelated CRUD work would make a vendor choice under the wrong pressure.
- **JWT instead of the existing opaque HMAC token format.** Rejected: the dev
  sandbox's own doc comment is explicit that an opaque token is chosen deliberately
  so it does not *look* like a real OIDC integration it is not. Reusing the same
  shape for the real adapter keeps that signal consistent instead of introducing a
  JWT now and a different format when ADR-0015 lands.

## Consequences

### Positive

- Signup → login → authenticated request → authorized action is exercisable end to
  end in every environment, not just `local`/`dev`/`test`.
- The migration path to ADR-0015's eventual choice is an adapter swap: a new class
  implementing `AuthSessionPort`, plus a data migration of `security.credentials`
  rows (or their deprecation) — no caller of the port changes.

### Negative

- A second, real credential store now exists that will need migrating (or
  deliberately retiring) once ADR-0015 lands — that work is not free and is not
  scheduled here.
- Password reset in this pass returns the raw token directly from the API in
  dev-gated builds rather than emailing it, because no SMTP/email-sending capability
  exists anywhere in the repo yet (`packages/config` has no mail configuration). This
  is not a privacy gap in non-dev environments — the dev-only response field is
  gated by the same `isAuthSandboxEligible` check — but it means password recovery
  is not actually usable by a real user until email sending is built separately.

### Neutral / accepted trade-offs

- This ADR does not evaluate MFA, account lockout, or breach-credential checking
  (e.g. HaveIBeenPwned). Those are reasonable hardening steps for a real production
  credential store and are explicitly left for when/if this interim mechanism is
  extended rather than retired outright.

## Security impact

New trust boundary: `security.credentials.password_hash` is now a value whose
compromise directly enables account takeover, where previously no password existed
anywhere in the system. Mitigations applied: salted `scrypt` (Node's built-in
implementation, no new dependency, CPU/memory-hard by design) with a random salt per
password; constant-time comparison (`crypto.timingSafeEqual`) on verification, the
same primitive `DevAuthSessionAdapter` already uses for its HMAC check; login and
password-reset-request responses are deliberately generic and never reveal whether an
email exists in the system; password-reset tokens are stored hashed
(`password_reset_tokens.token_hash`), single-use (`used_at`), and short-lived
(`expires_at`) — the raw token is never persisted. `AUTH_SESSION_SECRET` must be a
real secret in any non-local environment (enforced the same way other entries in
`secretConfigSchema` are: validated, not defaulted, at startup). This pass does not
add rate limiting on login or reset-request attempts — that is a real gap for a
production deployment and is named here rather than silently assumed away.

## Privacy impact

`security.credentials.email` and `identity.party_profiles` (display name, date of
birth, phone — added alongside this ADR to give signup somewhere to put personal
data) are `RESTRICTED_IDENTITY`/`RESTRICTED_FINANCIAL`-adjacent data per
`packages/contracts/src/risk.ts`'s `DATA_CLASSIFICATIONS`. No retention, export, or
deletion flow is built in this pass — Constitution §51 requires the architecture to
eventually support consent, purpose, retention, data export and account deletion, and
this ADR explicitly does not close that gap. It adds a new place personal data lives,
which makes that outstanding work larger, not smaller; it is named here so it is not
forgotten.

## Cost

No new paid vendor, no new npm dependency (`crypto.scrypt`/`crypto.randomBytes`/
`crypto.timingSafeEqual` are Node built-ins). Indirect cost is the migration labor
named above in Consequences, and the operational burden of running a credential
store at all (password reset support, breach response procedures) that a federated
IdP would otherwise own.

## Migration

Expand: add `security.credentials` and `security.password_reset_tokens` (this ADR);
existing `identity.principals`/`parties`/`workspaces`/`memberships` rows are
untouched — a Principal gains a credential, it does not change shape. When ADR-0015
selects a federated provider: write the new `AuthSessionPort` adapter, decide per
account whether to link the federated identity to the existing `principal_id` (expand)
or require re-registration, then stop issuing new local credentials (migrate), then
decide whether to retire `security.credentials` entirely or keep it as a fallback
(contract) — that three-step sequence is deferred to the ADR that makes the federated
choice, not decided here.

## Rollback

Straightforward: stop wiring `PasswordAuthSessionAdapter` to `AUTH_SESSION_PORT` in
`AuthModule.forRoot`, fall back to `DevAuthSessionAdapter` for `local`/`dev`/`test`
(accepting that non-dev environments lose login entirely until a replacement exists).
`security.credentials` and `security.password_reset_tokens` can be dropped without
affecting `identity.*` or `integration.outbox`, since no foreign key points *into*
`security` from elsewhere.

## Implementation status (2026-10-06)

Landed so far: `security.credentials` and `security.password_reset_tokens` tables
(`packages/db/src/schema/security.ts`); `identity.party_profiles`
(`packages/db/src/schema/identity.ts`, personal data for signup — display name, date
of birth, phone); `finance.debts` / `finance.cards`
(`packages/db/src/schema/finance.ts`, user-asserted personal financial data, §11
provenance columns); `documents.documents`
(`packages/db/src/schema/documents.ts`, RAW zone only); the pure domain half —
`IdGenerator`/`sequentialIdGenerator` (`packages/domain/src/id.ts`),
`PASSWORD_RESET_TTL_MS`/`isResetTokenExpired` (`packages/domain/src/password-reset.ts`),
and a widened `AuthSessionPort` (`packages/domain/src/auth-session.ts`) with both
`issue` and `verify` in the formal interface. All of the above is typechecked, linted
and tested green.

Not yet started: the Drizzle migration for the three new schemas has not been
generated (`pnpm --filter @finch/db db:generate`); `apps/api/src/infrastructure/security/`
(real `crypto.randomUUID()`-backed `IdGenerator`, `hashPassword`/`verifyPassword`,
reset-token generation/hashing) does not exist yet; `PasswordAuthSessionAdapter` does
not exist yet and `AuthModule` still wires only `DevAuthSessionAdapter`;
`AUTH_SESSION_SECRET` has not been added to `packages/config`'s `secretConfigSchema`;
none of the new API endpoints (`/auth/signup`, `/auth/login`,
`/auth/password-reset/*`, `GET`/`PATCH /me`, the `finance` and `documents` modules)
exist; `apps/web` still calls nothing — it is 100% static mock data with no API
client. The full remaining task list lives in the plan this ADR was written
alongside; pick it up at "API (`apps/api`)" once the DB schema layer above has a
generated migration.

## References

- ADR-0015 (OIDC identity provider selection) — the decision this ADR is interim to
- ADR-0022 (provider abstraction) — the port/adapter shape this ADR follows
- ADR-0016 (money precision) — same "Node built-ins over new dependencies where they
  suffice" instinct
- `apps/api/src/infrastructure/auth/dev-auth-session.adapter.ts` — the token-shape
  precedent this ADR's adapter reuses
- Constitution §51 (data lifecycle & privacy), §76 (ADR trigger list)
