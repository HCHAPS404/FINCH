# AI component cards (CRISP-ML(Q) phase 1)

Every AI component has an `ML-<n>.md` card before it is built (skill `ai-component`): task, metric
and threshold, what the model does **not** decide, output truth class, risk tier, dataset and
results.

| ID    | Component                                | Tier          | Card         |
| ----- | ---------------------------------------- | ------------- | ------------ |
| ML-1  | Intent and entity router                 | FAST          | pending (S1) |
| ML-2  | Reading bank notifications and emails    | FAST          | pending (S1) |
| ML-3  | Receipt, invoice and document extraction | VISION        | pending (S2) |
| ML-4  | Merchant and category normalization      | FAST          | pending (S2) |
| ML-5  | Agent with skills                        | AGENT         | pending (S1) |
| ML-6  | NL search → DSL                          | AGENT         | pending (S3) |
| ML-7  | Second opinion                           | DEEP          | pending (S2) |
| ML-8  | Semantic memory                          | EMBED         | pending (S2) |
| ML-9  | Anomaly baseline                         | deterministic | pending (S2) |
| ML-10 | Input/output safety                      | GUARD         | pending (S1) |

Reference: `docs/architecture/SOFTWARE-ARCHITECTURE.md` §5.
