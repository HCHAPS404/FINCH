# apps/web

Customer-facing web application.

> **Status:** boundary only. No implementation yet — see _Unblocked by_.
>
> This package intentionally declares **no `build` or `test` script**. A script that
> echoes and exits 0 would report green in CI while building nothing, which is exactly
> the silent shortcut README §42 forbids. Turbo skips tasks a package does not declare,
> so the absence is honest and harmless. Scripts arrive with the implementation.

**Planned stack:** Next.js 16.3.5 · React 19.2.3 · TanStack Query 5.103.1

## Owns

- Customer web experience and its routing.
- Client-side session handling.

## Does not own

- Anything admin — apps/admin is a separate surface and is never merged into this one (§33.2, §52).
- Authorization decisions (§12).

## Invariants

- Sensitive authenticated responses use private/no-store cache policies (§116).
- Stale, estimated and verified values are visually distinguishable (§116).
- No analytics event carries a denylisted property; CI enforces it (§53).

## Unblocked by

FIN-012
