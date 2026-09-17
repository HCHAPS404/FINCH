# fixtures

Test data. **Synthetic only** — production data never reaches a development
environment (Constitution §4.18, README §79).

```
colombia/     synthetic Colombian financial personas
providers/    recorded provider payloads for contract tests
documents/    synthetic documents for the extraction pipeline
```

## Personas (README §80)

```
salaried_simple          salaried_multi_debt      freelancer_variable
household_shared         credit_card_heavy        saver_goal_oriented
microbusiness_owner
```

These exist so realistic scenarios — a household with shared goals, an independent
worker with variable income, a debt-heavy card user — can be tested end to end without
a single piece of real PII.

> **Status: structure only.** Personas are authored alongside `packages/db` seeds
> (FIN-007).
