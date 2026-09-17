# Contributing to FINCH

`README.md` is the architecture authority. `AGENTS.md` is normative for AI agents.
Read both before your first change.

## Setup

```bash
git clone https://github.com/HCHAPS404/FINCH.git
cd FINCH
corepack enable          # ships with Node 24 LTS
pnpm install --frozen-lockfile
pnpm env:doctor          # verify your toolchain before anything else
pnpm dev:infra           # PostgreSQL 18.6 in Docker
```

Node **24.21.0** is pinned in `.nvmrc` and enforced by `engines`. Use `fnm`, `nvm` or
`mise` to select it. `engine-strict` is on: an install under the wrong Node will fail
rather than produce a subtly different lockfile.

## Before you open a pull request

```bash
pnpm check    # lint + format:check + typecheck + architecture:check + test
```

## Branching

Trunk-oriented. `main` is always deployable. No permanent `develop` branch without an
ADR.

```
feat/FIN-123-short-description
fix/FIN-456-short-description
security/FIN-789-short-description
chore/FIN-012-short-description
spike/FIN-345-short-description
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat(financial-engine): add money value object
fix(auth): enforce workspace ownership
test(financial-engine): add amortization golden vectors
docs(architecture): add tenancy ADR
```

**No AI attribution trailers.** See `AGENTS.md` §1. Authorship in this repository
belongs to the human who made the change.

Keep pull requests small and coherent. Do not mix cosmetic refactoring, schema changes
and financial logic in one diff when it can be avoided.

## Architecture changes

If your change needs a new database, a new runtime, a service extraction, EKS, Kafka,
Temporal as core workflow, a core vendor, an authorization change, a payment or ledger
change, a new trust boundary, a data residency change, or a breaking contract —
**stop**. Write an ADR in `docs/architecture/adr/` using `0000-template.md` and get it
accepted first. See README §76.

The architecture fitness functions are executable clauses of that constitution. If one
blocks you, the answer is never to relax the rule. Either your design should change,
or the rule genuinely should — and that is an ADR.

## Definition of Done

A feature is not done because it compiles. See README §75 for the full checklist:
spec, risk tier, authorization rules, privacy and purpose, threat impact, API and
event contracts, migrations, provenance, tests, accessibility, localization, analytics
allowlisting, observability, stale/offline/error states, idempotency, feature flag and
kill path, rollback, documentation, artifacts, green CI.

## Test data

Synthetic only. Production data never reaches a development environment (README §79,
Constitution §4.18). Synthetic Colombian personas live in `fixtures/colombia/`.
