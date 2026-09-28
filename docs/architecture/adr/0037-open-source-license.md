# ADR-0037: Apache-2.0 license and open-core boundary

- **Status:** Proposed. **Requires founders' decision D-01** (`docs/hackathon/07`).
- **Date:** 2026-09-28
- **Deciders:** HELL, Nairy
- **Supersedes:** `"license": "UNLICENSED"` in the root `package.json`.

## Context

The hackathon requires a public repository with an OSI open source license detectable by GitHub
and shown in the repository's About panel. The repository is currently private and unlicensed.
Today it holds the architecture baseline and foundation code only. FINCH is intended to become a
company, so what is opened, and under which terms, has lasting consequences.

## Decision

The FINCH monorepo is published under **Apache License 2.0**, with a root `LICENSE`, a `NOTICE`
file and a `TRADEMARKS.md` stating that the FINCH name and logo are not licensed (Apache-2.0 §6).
The root `package.json` license field becomes `"Apache-2.0"`. Packages stay `"private": true` so
that nothing is published to npm by accident.

**Open-core boundary** for the future:

- _Open_: the financial engine, contracts, AI gateway patterns, evals and the reference app.
- _Private_ (separate repositories, created when they exist): partner and provider integrations
  under NDA or contract, production infrastructure configuration, proprietary data, risk models,
  and anything a partner contract requires to remain confidential.

## Alternatives considered

- **MIT.** Simpler, but has no explicit patent grant. Apache-2.0 is the stronger default for a
  company codebase.
- **MPL-2.0.** File-level copyleft. Acceptable, but less familiar to fintech partners.
- **A separate public hackathon repository, keeping this one private.** Rejected (ADR-0035): it
  duplicates work, and the rule that the repo "must contain all necessary source code" would force
  the same code public anyway.
- **Source-available licenses (BSL, etc.).** Not OSI-approved, so they do not satisfy the rules.

## Consequences

### Positive

- Complies with the rules.
- An auditable engine builds trust with users, judges and partners.
- The patent grant protects contributors and users.

### Negative

- Competitors can reuse the open code. The moat must come from execution, data, partnerships,
  brand and regulatory readiness.

### Neutral / accepted trade-offs

- Brand protection relies on trademark registration (decision D-09), not on copyright.

## Security impact

Public code increases scrutiny, which is acceptable because FINCH holds no secret-by-obscurity
controls. Before the repo goes public: `pnpm security:check`, gitleaks over the full history, and
rotation of any key that ever touched the repo.

## Privacy impact

None. No personal data exists in the repository (Constitution §4.18).

## Cost

None direct.

## Migration

Add `LICENSE`, `NOTICE` and `TRADEMARKS.md`, update `package.json`, verify the About panel, then
flip visibility.

## Rollback

Code already published under Apache-2.0 stays available under it. Only future code can be
relicensed or kept private. **This is not reversible for what is published**, which is why this ADR
requires the explicit founders' decision D-01.

## References

- https://www.apache.org/licenses/LICENSE-2.0
- Hackathon Official Rules, Submission Requirements
