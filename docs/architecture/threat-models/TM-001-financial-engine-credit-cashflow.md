# TM-001 — Financial engine: credit and cash-flow formulas (S1-01)

| Field     | Value                                                                                    |
| --------- | ---------------------------------------------------------------------------------------- |
| Scope     | `packages/financial-engine/src/credit/**`, `packages/financial-engine/src/cashflow/**`   |
| Risk tier | **R1** — financial intelligence (forecast, comparison, safe-to-spend)                    |
| Task      | S1-09 (covers the formulas delivered by S1-01, PR #8)                                    |
| Status    | Proposed — review by the other founder required                                          |
| Date      | 2026-09-29                                                                               |
| Method    | STRIDE on data flows + financial-integrity threats specific to FINCH (Constitution §4.2) |

## 1. System context

The engine is a **pure library**: no I/O, no network, no clock, no randomness, no framework
(dependency-cruiser and the `pureLayers` ESLint block enforce it). It has no endpoint and stores
nothing. Its trust boundary is therefore the **call site**: every threat below materialises only
when an API module, the worker or an agent skill passes inputs in and shows outputs to a user.

```text
user / bank data / Tavily market data / LLM extraction
        │  (untrusted, validated with zod at the API boundary)
        ▼
apps/api module ── application service ──► @finch/financial-engine (pure)
        │                                           │
        │◄──────── result + formula@version ────────┘
        ▼
CalcReceipt (S1-05) ──► UI (every figure clickable to its receipt)
```

Assets: correctness of every figure shown to a user; the truth class of that figure; the user's
financial data passed as inputs (PII-adjacent); availability of the API worker that runs the math.

## 2. Threats and mitigations

| #   | STRIDE / class                      | Threat                                                                                                    | Mitigation in place (S1-01)                                                                                                                                                                 | Residual / owner                                                                                              |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| T1  | Tampering (integrity)               | A wrong formula produces a plausible but wrong figure that drives a user decision.                        | Versioned registry (`formulaId@version`); 56 golden vectors from an independent Python implementation; invariants; registry vectors recomputed in tests; CI `Unit · Financial correctness`. | Spreadsheet re-derivation by the founders (S1-03) pending; no formula informs a recommendation until then.    |
| T2  | Spoofing of truth                   | An LLM-extracted or model-generated value is treated as a fact and silently becomes "derived".            | `GENERATED_NARRATIVE` inputs are refused (`UNTRUSTED_INPUT`); any `ESTIMATED` input makes the output `ESTIMATED` (refinance, forecast, safe-to-spend).                                      | Call sites must pass the real truth class of each input; enforced when `CalcReceipt` lands (S1-05).           |
| T3  | Tampering (precision)               | Binary floating point or implicit rounding changes amounts.                                               | `Money` is bigint minor units; rates are 40-digit decimals; `number` is refused by `decimal()`; every rounding is explicit `HALF_EVEN`; lint rule `finch/no-float-money`.                   | None known.                                                                                                   |
| T4  | Tampering (stale jurisdiction data) | An expired usury ceiling makes an above-usury rate look legal, or the reverse.                            | `credit.usury_check@1` takes the certification window and the evaluation date as inputs and reports `STALE`; it never states that a charge is illegal.                                      | Source freshness and provenance come from the market-truth adapter (S2); wording reviewed by a lawyer (D-07). |
| T5  | Denial of service                   | Crafted inputs make the engine loop or allocate without bound (huge terms, many debts, pathological IRR). | Terms capped at 1,200 periods; payoff capped at 1,200 months; IRR bisection ≤ 200 iterations with ≤ 60 bracket doublings; forecast fixed at 31 days; `DEBT_NEVER_AMORTIZES` fails fast.     | The API must cap list sizes (debts, events, income history) with zod — to be added with each endpoint.        |
| T6  | Tampering (input domain)            | Negative fees, currency mixing or impossible dates yield nonsense that looks valid.                       | Stable `FinancialInputError` codes: `INVALID_CHARGES`, `INVALID_DATE`, `RATE_OUT_OF_DOMAIN`, …; `CurrencyMismatchError` on any mixed currency; no partial results are ever returned.        | None known.                                                                                                   |
| T7  | Information disclosure              | Inputs (balances, debts, income) leak through error messages or logs.                                     | Error messages contain no amounts; ids are caller-chosen opaque values; the engine has no logger.                                                                                           | Call sites must not log inputs unredacted (Constitution §4.18, `40-security-privacy`).                        |
| T8  | Repudiation                         | A past recommendation cannot be reproduced after a formula changes.                                       | Results carry `formula {formulaId, version}`; changing math requires a new version; the engine is deterministic (no clock: dates are inputs).                                               | Persisting receipts with inputs and version is S1-05 (`CalcReceipt`).                                         |
| T9  | Elevation (commercial bias)         | A partner commission changes a ranking or a refinance verdict.                                            | The formulas take no commission or partner input; `debt.payoff_plan` always returns both strategies.                                                                                        | Ranking code in the Opportunity Engine (S2) must keep this property (Constitution §4.15).                     |
| T10 | Supply chain                        | A compromised dependency alters arithmetic.                                                               | One runtime dependency (`decimal.js` 10.6.0, exact pin, frozen lockfile, `minimumReleaseAge`); dependency review and SBOM in CI; golden vectors would catch changed arithmetic.             | None known.                                                                                                   |

## 3. Explicitly out of scope

- Authorization and tenancy: the engine never sees a workspace; call sites enforce them server-side.
- Moving money: FINCH never moves money (ADR-0021); no output of these formulas triggers an action.

## 4. Verification

- `pnpm --filter @finch/financial-engine test` and `pnpm financial:verify` (192/192 at S1-01 merge).
- `pnpm architecture:check` proves the engine stays pure.
- Re-review this model when a formula gains a new version, when an endpoint exposes these formulas,
  or when `CalcReceipt` lands (S1-05).
