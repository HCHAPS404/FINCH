# Personal finance formulas (engine contract for the hackathon)

> Complements [colombia-credit.md](colombia-credit.md). Same rules: amounts as `bigint` in minor
> units, rates in arbitrary-precision decimal, explicit rounding, every formula in the Formula
> Registry with a version and independently verified golden vectors (S1-03). Everything that depends
> on a country (taxes, holidays, conventions) arrives as a parameter from `jurisdictions/<country>/`.

---

## 1. Income allocation — `budget.allocate@1` (Payday Autopilot, B1)

Input: `income` (Money), `income_date`, `next_income`, obligations with due dates, debts with
minimums, target and current buffer, goals with priority/date/suggested contribution, user rule
(`PAY_YOURSELF_FIRST(p)`, `RULE_50_30_20`, `CUSTOM`).

Deterministic layered algorithm (each layer consumes from `remaining`):

```text
1. obligations due ≤ next_income                         (ordered by date)
2. debt minimums due ≤ next_income                       (ordered by date)
3. "pay yourself first": p · income to savings, if the rule asks for it
4. buffer up to target, capped per cycle (parameter)
5. goals by priority; within equal priority, by date
6. surplus → chosen strategy: extra debt payment (avalanche) or savings/investing
7. free = remaining
```

- If `remaining < 0` in layers 1–2: **deficit** → nothing is allocated to layers 3+, the shortfall is
  flagged and a Decision Card is generated (C3 logic).
- **Invariant:** `Σ allocations + free = income` exactly (conservation test).
- Output: list of `(destination, amount, target_date, reason, layer)` + execution checklist.

Resolved definitions (version 1, implemented in `packages/financial-engine/src/budget/allocate.ts`):
obligations and minimums due after `next_income` are left for that income; ties keep the input order;
`RULE_50_30_20` means 20 % pay-yourself-first; the buffer layer is
`min(remaining, max(0, target − current), cap_per_cycle)`; goals take `min(remaining, suggested)` by
priority (1 first), then target date; the surplus layer sends `round(surplus_share · remaining)` to the
highest-rate debt (capped at its balance) or to savings. Rounding is `HALF_EVEN`, only in layers 3 and 6. On a deficit, layers 1–2 are listed in full, `free = 0` and `shortfall` is reported, so the
invariant reads `Σ allocations + free = income + shortfall`.

## 2. Envelope state — `budget.envelope_state@1` (B2)

`envelope_available = allocated − Σ expenses(envelope, cycle) ± transfers_between_envelopes`.
Alerts at 80 % and 100 %. Moving between envelopes conserves the cycle total.

Resolved definitions (version 1, `src/budget/envelope.ts`): alerts are measured against
`allocated + transfers_in − transfers_out`, only when something was spent, and the 80 % test is exact
integer arithmetic (`5 · spent ≥ 4 · budget`).

## 3. Financial health — `health.score@1` (B7)

Score 0–100 = Σ `weight_i · subscore_i`, with 0–100 subscores by published bands:

| Component              | Metric                                    | Initial weight |
| ---------------------- | ----------------------------------------- | -------------- |
| Debt load              | monthly instalments / net income          | 25             |
| Buffer                 | months of essential expenses covered      | 20             |
| Savings rate           | month's savings / income                  | 20             |
| Credit utilization     | card balances / total limit               | 15             |
| Punctuality            | on-time payments / payments in the period | 10             |
| Income diversification | 1 − concentration index (HHI) of sources  | 10             |

Weights and bands are versioned parameters; changing any of them creates `health.score@2`. Each
component shows "what would raise the score". **It is not a credit score.**

## 4. Net worth — `networth.compute@1` (B8)

`net_worth = Σ assets(base currency) − Σ liabilities(base currency)`, converted with `fx.convert@1`
at the snapshot date. Vehicles: straight-line or configurable-table depreciation (`ESTIMATED`).

## 5. Can I afford it? — `purchase.afford@1` (C1)

For a purchase `price` on date `t`, with options `cash` or `n instalments at rate i`:

1. Recompute the forecast (`cashflow.forecast_30d`, extended to the plan horizon) with the new flow.
2. Deterministic verdict:
   - `YES` if the projected balance never falls below the buffer and no essential envelope goes
     negative;
   - `YES_WITH_ADJUSTMENT` if it falls below the buffer but recovers before the next income, stating
     which envelope to adjust;
   - `WAIT` if there is a deficit → earliest date `t*` at which it would be `YES`;
   - `NOT_RECOMMENDED` if it compromises obligations.
3. Financing cost: `interest = Σ instalments − price` (French amortization) and the opportunity cost
   of paying cash at the user's savings rate.

## 6. "What if…?" scenarios — `scenario.project@1` (C2)

Monthly projection over `H` months on a **copy** of the snapshot with parameterized changes (Δ income,
new debt, new recurring expense, one-off event). Outputs per month: balance, total debt, net worth,
goal progress. Up to 3 comparable scenarios. Never mutates canonical state.

## 7. Storm mode — `stress.runway@1` (C3)

`runway_months = available_liquidity / monthly_essential_expenses` with optional cuts: expenses by
tier (essential / reducible / removable). Output: runway without cuts, with cuts, and payment
priority order (legal obligations and housing → debt minimums → the rest).

## 8. Goals — `goals.plan@1` (C4)

For each goal `g`: `required_contribution_g = (target_g − saved_g) / remaining_months_g` (or, with an
expected return, the annuity formula at rate `r`). If `Σ contributions > savings_capacity`, allocation
by priority and reachable dates are recomputed → explicit trade-offs (`goal X is delayed k months`).

## 9. Net return on deposits — `deposit.net_return@1` (D1)

```text
gross_return      = principal · ((1 + EA)^(term_days/365) − 1)      # day-count basis: parameter per country/product
withholding       = gross_return · withholding_rate(country, product) # VERIFY current rate (CO)
net_return        = gross_return − withholding − costs
net_EA            = (1 + net_return/principal)^(365/term_days) − 1
real_net_EA       = (1 + net_EA)/(1 + expected_inflation) − 1         # inflation: official source, date
```

## 10. Exchange rate — `fx.convert@1` (G3)

`target_amount = round(source_amount · rate(source→target, date))` with a cited reference rate
(source, date, time). Markup of a real conversion: `markup = reference_rate/applied_rate − 1`.

## 11. Remittance cost — `fx.remittance_cost@1` (D5)

`total_cost = fee + amount_sent · (reference_rate − offered_rate)/reference_rate`, expressed in the
source currency and as a % of the transfer; `received = (amount_sent − fee) · offered_rate`.

## 12. Recurring detection — `recurring.detect@1` (D2)

Group transactions by normalized merchant; recurring when ≥ 3 occurrences with a mean interval in
{7, 14, 30, 90, 365} ± tolerance (parameter) and amount coefficient of variation ≤ threshold. Price
rise: last amount > previous median · (1 + threshold).

## 13. Shared-expense settlement — `split.settle@1` (F1)

Balance per member = paid − owed (by rule: equal parts, proportional to declared income, fixed
amounts). Settlement: greedy matching of largest debtor ↔ largest creditor until settled; produces
≤ `n − 1` transfers. Invariant: `Σ balances = 0`.

## 14. Protection gaps — `protection.gaps@1` (F2)

Published, versioned rules, e.g.: buffer < 3 months of essential expenses → high gap; dependants > 0
without declared life cover → gap; the same insurance type charged on ≥ 2 products → possible
duplication. Educational only.

## 15. Educational investment projection — `invest.project@1` (C5)

Future value of periodic contributions `A` at monthly rate `r` over `n` months:
`FV = A · ((1 + r)^n − 1)/r` (+ initial principal `C·(1+r)^n`), for 3 scenarios of `r`
(conservative/base/optimistic, parameters with a source or an explicit assumption), net of taxes and
inflation with the same parameters as §9.

## Minimum vectors

Each formula in this document enters with ≥ 4 golden vectors covering: nominal case, edge (zero, a
single element), conservation (where applicable) and explanatory error.
