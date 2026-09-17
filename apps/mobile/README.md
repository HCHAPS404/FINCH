# apps/mobile

Android and iOS application.

> **Status:** boundary only. No implementation yet — see _Unblocked by_.
>
> This package intentionally declares **no `build` or `test` script**. A script that
> echoes and exits 0 would report green in CI while building nothing, which is exactly
> the silent shortcut README §42 forbids. Turbo skips tasks a package does not declare,
> so the absence is honest and harmless. Scripts arrive with the implementation.

**Planned stack:** Expo SDK 57.0.23 · React Native 0.86.3 · React 19.2.3 (versions fixed by the Expo SDK, not by npm latest)

## Owns

- Mobile experience, secure storage of small client secrets, local authentication.

## Does not own

- Financial truth. The device holds a cache, never a source of truth (§116).
- Authorization decisions (§12).

## Invariants

- Provider credentials, full documents and raw bank payloads are never persisted on device (§116).
- Device biometrics prove local presence, not backend identity (§117).
- An R2+ action is not complete until the server confirms it (§116).

## Unblocked by

FIN-011. Note: iOS builds are not possible on Linux; they require EAS Build or macOS (see the bootstrap report, risk R-09).
