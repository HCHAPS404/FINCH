# ADR-0042: NestJS lint scope and dependency release age

- **Status:** Accepted
- **Date:** 2026-09-29
- **Deciders:** HELL
- **Supersedes:** none

## Context

Building the API walking skeleton (task S0-07) surfaced two tooling conflicts.

1. **`@typescript-eslint/no-extraneous-class`.** The strict preset rejects classes with
   only static members or no members. NestJS modules are, by design, decorated classes
   (`@Module({...}) class AppModule {}`); dynamic modules add a static `register()`.
   The rule flagged the API's composition root.
2. **pnpm `minimumReleaseAge`.** pnpm 11 refuses packages published less than a day
   ago (a supply-chain protection against compromised releases, which are usually caught
   within hours). NestJS 12.1.1 was published 15 hours before we installed it; pnpm
   offered to add a `minimumReleaseAgeExclude` entry to `pnpm-workspace.yaml`.

## Decision

1. Exempt **decorated** classes from `no-extraneous-class`, and only in the NestJS apps
   (`apps/api`, `apps/worker`), through the rule's own `allowWithDecorator` option in the
   `nestApps` block of `@finch/eslint-config`. Everywhere else the rule is unchanged.
2. Never add `minimumReleaseAgeExclude` entries. When a wanted version is too new, pin the
   newest version that satisfies the policy (here NestJS 12.1.0, published 2026-09-23) and
   upgrade once it ages.

## Alternatives considered

| Option                              | Why not                                                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Inline `eslint-disable` in `app.ts` | Hides a framework convention as a one-off; the next Nest module would repeat it.                          |
| Turn the rule off for the API       | Also removes the check for undecorated static-only classes, which are a real smell.                       |
| Accept pnpm's automatic exclude     | Weakens a supply-chain control to save a day; forbidden by AGENTS.md ("never weaken a security control"). |

## Consequences

- Nest modules lint cleanly; undecorated static-only classes are still errors.
- Dependencies can lag the latest release by up to a day; fixes for an urgent CVE still
  go through this ADR's rule (pin the newest eligible version, or record a new ADR for an
  exception).

## Security impact

Positive: the release-age protection stays intact.

## Privacy impact

None.

## Cost

None.

## Rollback

Remove the `nestApps` block; the API's module classes would then need restructuring.

## References

- `packages/eslint-config/index.js` (`nestApps`), `apps/api/src/app.ts`
- `apps/api/package.json` (NestJS 12.1.0)
- ADR-0007 (backend stack), ADR-0034 (toolchain pinning)
