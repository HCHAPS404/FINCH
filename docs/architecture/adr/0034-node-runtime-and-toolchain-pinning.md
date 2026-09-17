# ADR-0034: Pin the Node runtime to 24.21.0 LTS and reproduce the toolchain via corepack

- **Status:** Accepted
- **Date:** 2026-09-17
- **Deciders:** HELL

## Context

README §56 specifies Node.js 24 LTS as the runtime baseline, and §81 documents the
developer bootstrap as `corepack enable` followed by
`pnpm install --frozen-lockfile`.

Verified against `https://nodejs.org/dist/index.json` on 2026-09-17:

| Line | Newest                 | LTS?         |
| ---- | ---------------------- | ------------ |
| 26.x | v26.9.0                | no — Current |
| 24.x | **v24.21.0 `Krypton`** | **yes**      |
| 22.x | v22.23.2 `Jod`         | yes (older)  |

The development machine used for this scaffold had Node **v26.8.2** active, with no
version manager installed and `corepack` absent from `PATH`.

The absence of `corepack` initially looked like a defect in the documented bootstrap.
It is not: installing Node 24.21.0 from the official distribution showed `corepack
0.36.0` present in its `bin/` directory. Corepack was unbundled from Node after the 24
line, so it is missing precisely _because_ the active runtime was Node 26. **README §81
is correct as written, provided the pinned Node is active.** No README change is
required.

Two concerns follow. First, a runtime mismatch in a financial codebase is not cosmetic:
Node major versions differ in `Intl` behaviour, timezone data, and `Error.cause`
serialization — all of which touch date handling and audit output. Second, a
mismatched install can silently produce a different dependency resolution than the one
that was reviewed.

## Decision

Pin the Node runtime to **24.21.0** and the package manager to **pnpm 11.26.0**, and
make the mismatch loud rather than silent:

1. `.nvmrc` contains `24.21.0`, so `fnm use` / `nvm use` / `mise` select it.
2. `package.json` declares `engines.node: ">=24.21.0 <25.0.0"` and
   `engines.pnpm: ">=11.26.0 <12.0.0"`.
3. `package.json` declares `packageManager: "pnpm@11.26.0"`, which corepack activates.
4. `.npmrc` sets `engine-strict=true`, so installing under the wrong runtime **fails**
   rather than producing a subtly different lockfile.
5. `scripts/env-doctor.mjs` reports the exact mismatch with a remediation instruction,
   and `pnpm env:doctor` is the first step of the documented bootstrap.
6. CI sets `NODE_VERSION: '24.21.0'` in one place in `.github/workflows/pr-gate.yml`.

No version manager is mandated. `fnm`, `nvm` and `mise` all honour `.nvmrc`; the choice
is a developer preference, and `env:doctor` verifies the outcome rather than the means.

## Alternatives considered

**Track Node Current (26.x).** Rejected. README §56 specifies LTS, and a financial
platform gains nothing from being on a line that receives no long-term support. The
`Intl`/ICU and timezone-data differences between majors are a correctness concern for a
system that stores UTC and presents `America/Bogota`.

**Pin only through `engines` without `engine-strict`.** Rejected. `engines` without
strict enforcement is advisory: it prints a warning that people learn to scroll past,
and the install proceeds anyway. The point of the pin is that a wrong runtime cannot
quietly produce a lockfile nobody reviewed.

**Mandate a specific version manager and commit its config.** Rejected as unnecessary
coupling. `.nvmrc` is understood by all the common managers; `env:doctor` verifies the
result regardless of how it was achieved.

**Change README §81 to drop `corepack enable`.** Rejected once the cause was
understood. §81 is accurate for the pinned runtime; changing it would have encoded a
wrong conclusion drawn from an unpinned machine.

## Consequences

### Positive

- Reproducible installs: CI, every developer machine, and every agent resolve the same
  dependency graph.
- A wrong runtime fails immediately and legibly rather than producing a divergent build.
- `env:doctor` turns a class of confusing downstream failures into one clear message.

### Negative

- Developers must install Node 24.21.0 before their first `pnpm install`. This is a
  real onboarding step, mitigated by `.nvmrc` and the `env:doctor` remediation text.
- `engine-strict=true` blocks installs on any unpinned machine, including throwaway
  containers. This is the intended behaviour.

### Neutral / accepted trade-offs

- The pin must be revisited when the 24 line approaches end of life, or when a
  dependency requires a newer runtime.

## Security impact

Minor and positive. Pinning the runtime and package manager narrows the supply-chain
surface: a reviewed lockfile resolves identically everywhere, so an install cannot
quietly pull a different dependency graph than the one that passed dependency review.

## Privacy impact

None.

## Cost

None direct. One onboarding step per developer machine.

## Migration

None — initial pin.

## Rollback

Change `.nvmrc`, `engines` and the CI `NODE_VERSION`, and reinstall. Nothing persistent
depends on this decision.

## References

- `https://nodejs.org/dist/index.json`, read 2026-09-17: v24.21.0 is the current
  `Krypton` LTS release; v26.x is Current.
- Node 24.21.0 official Linux x64 distribution, SHA-256 verified against
  `https://nodejs.org/dist/v24.21.0/SHASUMS256.txt`, contains `corepack 0.36.0`.
- README.md §56 (Toolchain Baseline), §81 (Bootstrap).
