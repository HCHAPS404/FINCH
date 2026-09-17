# apps/desktop

Windows, macOS and Linux desktop application.

> **Status:** boundary only. No implementation yet — see _Unblocked by_.
>
> This package intentionally declares **no `build` or `test` script**. A script that
> echoes and exits 0 would report green in CI while building nothing, which is exactly
> the silent shortcut README §42 forbids. Turbo skips tasks a package does not declare,
> so the absence is honest and harmless. Scripts arrive with the implementation.

**Planned stack:** Tauri 2 (CLI 2.11.4) · React · Vite · minimal privileged Rust layer

## Owns

- Desktop experience and its local cache.

## Does not own

- Financial truth — the local cache is never a source of truth (§116).
- Broad native privilege; the Rust layer stays minimal and explicitly scoped (§33.3).

## Invariants

- The updater requires an explicit chain of trust; a compromised update compromises the client (§122).
- The local cache may be larger than mobile's, but it is still a cache (§116).

## Unblocked by

FIN-014
