# apps/admin

Internal admin and operations surface. A separate application and a critical security boundary.

> **Status:** boundary only. No implementation yet — see _Unblocked by_.
>
> This package intentionally declares **no `build` or `test` script**. A script that
> echoes and exits 0 would report green in CI while building nothing, which is exactly
> the silent shortcut README §42 forbids. Turbo skips tasks a package does not declare,
> so the absence is honest and harmless. Scripts arrive with the implementation.

**Planned stack:** Next.js 16.3.5 · React 19.2.3

## Owns

- Connection health, support cases, masked user lookup, audit viewer.
- Feature flags, DLQ metadata, provider health (§52).

## Does not own

- Unrestricted impersonation, plaintext secrets, direct balance edits, payment approval on a user's behalf, or unrestricted document download — all forbidden by default (§52).

## Invariants

- Admin is not unrestricted access (Constitution §4.17).
- Every admin action produces an audit event (§52).
- Support principals see masked values only (§9).

## Unblocked by

FIN-013
