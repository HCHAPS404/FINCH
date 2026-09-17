# evals

Evaluation harnesses (README §32, §63).

```
financial/       formula correctness beyond unit tests: golden vectors, cross-checks
ai/              explanation fidelity, number preservation, prompt injection, PII leakage
authorization/   cross-workspace and cross-resource attack scenarios
documents/       extraction accuracy and malicious-document handling
```

> **Status: structure only.** Foundation ships no AI runtime and no document pipeline,
> so there is nothing yet to evaluate in `ai/` or `documents/`.
>
> `pnpm ai:eval` deliberately reports **PENDING** rather than exiting green. A harness
> that claims success while testing nothing is worse than an absent one, because it
> converts "untested" into "verified" in everyone's mental model.

The financial correctness harness that _does_ run today lives with the code it tests,
in `packages/financial-engine/src/money.test.ts` — 48 assertions across golden vectors,
seeded property-based invariants and boundary cases.
