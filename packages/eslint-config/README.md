# @finch/eslint-config

Shared ESLint flat config and the FINCH Constitution rules. README §57, §64.

## Owns

- Layers: `base` (all files), `typed` (strict + stylistic type-checked TypeScript),
  `nestApps` (decorated Nest module classes allowed in `apps/api` and `apps/worker`),
  `pureLayers` (no frameworks, I/O, ambient time or randomness in domain,
  financial-engine and contracts), `repoScripts`, `tests`.
- Custom rules in `rules/`: `finch/no-float-money` (§4.3) and
  `finch/no-pii-analytics` (§53).

## Invariants

- Adding or relaxing a rule is an architecture change and needs an ADR (§76). The
  `nestApps` exemption is scoped to decorated classes in the two NestJS apps only.
- Rules are never disabled to make a change pass (AGENTS.md).

## Tests

Exercised by `pnpm lint` over the whole repository; `pnpm architecture:check` covers
boundaries that ESLint cannot see.
