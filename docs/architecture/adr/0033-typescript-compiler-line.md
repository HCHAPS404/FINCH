# ADR-0033: Pin TypeScript to the 6.0.x line, defer TypeScript 7

- **Status:** Accepted
- **Date:** 2026-09-17
- **Deciders:** HELL
- **Supersedes:** none (refines ADR-0002 `primary-language`)

## Context

README §56 and §57 require TypeScript in strict mode as the primary language, with
`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`
and `useUnknownInCatchVariables` all enabled. README §64 further requires architecture
fitness functions enforced partly through ESLint rules.

At scaffold time (2026-09-17) the npm registry reports:

| Package             | Version                                        | Relevant constraint                             |
| ------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `typescript`        | `7.0.2` on `latest`; `6.0.3` is the newest 6.x | —                                               |
| `typescript-eslint` | `8.70.0` (and canary `8.70.1-alpha.24`)        | `peerDependencies.typescript: ">=4.8.4 <6.1.0"` |

There is no `next`, `rc`, `beta` or `v9` dist-tag of `typescript-eslint` that widens
that range.

The consequence is concrete: adopting TypeScript 7 today places the compiler outside
the range `typescript-eslint` supports. That does not merely produce a warning — it
removes the type-aware rule set (`no-unsafe-*`, `no-floating-promises`,
`switch-exhaustiveness-check`, `no-unnecessary-condition`) that FINCH relies on to keep
the pure layers pure and to catch dropped promises in a financial worker.

In other words, taking the newest compiler would cost us a category of architecture
enforcement that README §64 treats as mandatory.

## Decision

Pin TypeScript to **6.0.3** across the monorepo, declared exactly (`save-exact=true`)
in every `package.json` and reproduced through `pnpm-lock.yaml`.

Adoption of TypeScript 7 is deferred until `typescript-eslint` publishes a stable
release whose peer range admits it. At that point a new ADR supersedes this one, after
a spike that verifies: type-aware rules still run; NestJS decorator metadata still
emits correctly; and the financial correctness harness produces identical results.

## Alternatives considered

**Adopt TypeScript 7.0.2 now and drop type-aware lint rules.** Rejected. It trades a
compiler speed improvement — real, but not on any critical path for a project at
scaffold stage — for the loss of an enforcement mechanism the architecture depends on.
The cost lands on correctness; the benefit lands on build time.

**Adopt TypeScript 7.0.2 and keep `typescript-eslint` anyway, ignoring the peer
warning.** Rejected. An unsupported compiler/parser pair produces silent false
negatives rather than loud failures: rules appear to run and quietly stop catching
things. That is the failure mode this project treats as worse than no check at all.

**Pin to 5.9.3** (the newest 5.x). Rejected as needlessly conservative. 6.0.3 is
stable, within the supported peer range, and closer to the eventual 7 migration.

**Adopt TypeScript 7 only in `packages/financial-engine`**, which has no lint
dependency on type-aware rules. Rejected: a split compiler version across a monorepo
creates declaration-file incompatibilities and makes `tsc -b` project references
unreliable, for no benefit.

## Consequences

### Positive

- Type-aware ESLint rules remain available, so §64 fitness enforcement stays intact.
- One compiler version across the monorepo; project references behave predictably.
- The migration to TS 7 becomes a deliberate, verified step rather than an accident.

### Negative

- We forgo the TypeScript 7 native compiler's performance improvement for now.
- We carry a known upgrade obligation that must be revisited; if left unattended it
  becomes technical debt.

### Neutral / accepted trade-offs

- `typescript-eslint@8.70.0` effectively sets the compiler ceiling. This dependency is
  recorded here so it is a known constraint rather than a surprise during an upgrade.

## Security impact

Positive but indirect. Retaining `@typescript-eslint/no-unsafe-*` and
`no-floating-promises` preserves detection of unvalidated `any`-typed data flowing from
an adapter into the domain, and of unawaited promises in worker code — a path by which
a financial side effect could be silently dropped.

## Privacy impact

None.

## Cost

None direct. Indirect: one deferred upgrade to track.

## Migration

None required — this is the initial pin. The future migration to TS 7 will be:

1. Confirm `typescript-eslint` stable supports the target compiler.
2. Bump in a branch; run `pnpm check` plus `pnpm financial:verify`.
3. Verify NestJS decorator metadata emission specifically.
4. Compare the financial correctness artifact byte-for-byte against the 6.0.3 baseline.
5. Supersede this ADR.

## Rollback

Change the pinned version and reinstall. No data, schema or API surface is affected.

## References

- npm registry, `typescript` dist-tags and `typescript-eslint@8.70.0`
  `peerDependencies`, both read 2026-09-17.
- README.md §56 (Toolchain Baseline), §57 (TypeScript Rules), §64 (Architecture
  Fitness Functions).
