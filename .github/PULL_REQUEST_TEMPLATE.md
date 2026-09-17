## Summary

<!-- What changes, and why. Link the FIN issue. -->

Closes FIN-

## Risk tier

<!-- README §18. Delete the ones that do not apply. -->

- [ ] **R0** — information / visualization / education
- [ ] **R1** — financial intelligence (forecast, comparison, safe-to-spend)
- [ ] **R2** — external non-monetary action
- [ ] **R3** — money movement _(requires independent security review)_
- [ ] **R4** — custody / ledger-critical _(not in v1)_

## Architecture

- [ ] No new architecture decision, **or** an Accepted ADR covers it: `ADR-____`
- [ ] `pnpm architecture:check` passes
- [ ] No new cross-boundary dependency
- [ ] Module README (§98) updated if the contract changed

## Financial correctness

<!-- Delete this section only if the change touches no financial value. -->

- [ ] No money represented as a JS `number`
- [ ] Formula versioned, with test vectors
- [ ] Golden vectors and invariants added or updated
- [ ] Provenance and truth class set correctly on every new value
- [ ] `pnpm financial:verify` passes

## Security & privacy

- [ ] Authorization evaluated server-side; negative tests added
- [ ] No secret in code, config, logs or client bundle
- [ ] No PII or raw financial value in logs or analytics properties
- [ ] Threat notes written (required for R1+)
- [ ] Input validated at the boundary

## Data

- [ ] Every new tenant-owned table/column carries `workspace_id`
- [ ] Migration is expand-only in this release (§72)
- [ ] Rollback path described below

## Tests

<!-- What you ran, and what it proved. Not "tests pass". -->

## Evidence

<!-- Attach or link: test report, coverage, OpenAPI diff, schema diff,
     financial correctness report, architecture graph, screenshots. -->

## Rollback

<!-- How to undo this safely. "Revert the commit" is only true if it is. -->

## Known limitations

<!-- What this deliberately does not do. Be specific. -->

---

<!-- Authorship: no AI attribution trailers. See AGENTS.md §1. -->
