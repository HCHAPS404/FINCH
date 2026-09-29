# Credit formulas — Colombia (engine contract for the hackathon)

> **Status:** proposed specification. Each formula enters the Formula Registry
> (`packages/financial-engine/src/formula-registry.ts`) with `formulaId`, `version`, assumptions,
> references and **independently verified golden vectors** (task S1-03) before it informs any
> recommendation (README §15).
>
> **Precision:** amounts are stored as `bigint` in minor units (ADR-0016). Rates and intermediate
> values use an arbitrary-precision decimal (≥ 34 significant digits). Fractional powers (`^(1/12)`)
> require decimal `ln`/`exp`: the library is decided in S0-13.
>
> **Rounding:** never implicit. By default, each period's interest is rounded to minor units with
> `HALF_EVEN` and the last instalment absorbs the residue. Rates are displayed as percentages with 2
> decimals.
>
> **Colombia-specific** rules (quoting conventions, usury, GMF) live in
> `jurisdictions/CO/rate-conventions/` and are injected as parameters. The core does not know them
> (README §36).

---

## 1. Rate conversion — `rate.convert@1`

Notation: `EA` = effective annual; `i_m` = effective monthly in arrears (MV); `NAMV` = nominal annual
compounded monthly in arrears; `i_a` = period rate paid in advance.

| Conversion                            | Formula                                                           |
| ------------------------------------- | ----------------------------------------------------------------- |
| Periodic in arrears → EA              | `EA = (1 + i_p)^m − 1`, with `m` periods per year (12 if monthly) |
| EA → periodic in arrears              | `i_p = (1 + EA)^(1/m) − 1`                                        |
| Nominal → periodic                    | `i_p = N / m`                                                     |
| Periodic → nominal                    | `N = i_p · m`                                                     |
| In advance → in arrears (same period) | `i_v = i_a / (1 − i_a)`                                           |
| In arrears → in advance               | `i_a = i_v / (1 + i_v)`                                           |

Edge cases: `i_a ≥ 1` → error; negative rates → allowed only with an explicit flag;
`m ∈ {1, 2, 4, 6, 12, 360, 365}`.

**Illustrative examples** (computed with a 40-digit decimal; **not** golden vectors until
independently verified):

| Input                               | Output                          |
| ----------------------------------- | ------------------------------- |
| 2.3 % MV → EA                       | 31.3734498399602… % EA          |
| 24 % EA → MV                        | 1.8087582483510674… % MV        |
| 24 % NAMV → MV                      | 2 % MV → 26.8241794562545… % EA |
| 2 % monthly in advance → in arrears | 2.0408163265306122… % MV        |

## 2. Fixed instalment (French system) — `amortization.french@1`

`C = P · i / (1 − (1 + i)^(−n))`; if `i = 0`, `C = P / n`.

Schedule: `interest_k = round(balance_{k−1} · i)`, `principal_k = C_r − interest_k`,
`balance_k = balance_{k−1} − principal_k`. `C_r` is the instalment rounded to minor units and the
last instalment adjusts the residue so that `balance_n = 0`.

Illustrative example: `P` = COP 10,000,000, `i` = 1.6 % MV, `n` = 36 → `C` ≈ COP 367,572.18.

## 3. Total cost and real effective rate — `credit.total_cost@1`

Monthly cash flows from the borrower's perspective:

```text
t=0 : + (P − upfront_costs)                              # net disbursement (credit study, fees)
t=k : − (C_k + insurance_k + handling_fee_k + other_k + gmf_k)   k = 1..n
```

- `insurance_k` by `insurance_basis`: `OUTSTANDING` (rate × balance), `ORIGINAL` (rate × P) or
  `FIXED`.
- `gmf_k`: jurisdiction parameter (4 × 1,000 on taxed debits). **VERIFY** exemptions and
  applicability case by case (Tax Statute, GMF regime). Defaults to `0` and is shown as an editable
  assumption.
- **Monthly IRR** `r` that makes `NPV = 0`: solved by bisection in decimal (tolerance `1e−12`, at
  most 200 iterations; bisection guarantees convergence when there is a sign change). Output:
  `real_effective_rate_EA = (1 + r)^12 − 1`, total paid, total interest, total insurance and total
  charges.

## 4. Usury check — `credit.usury_check@1`

- Parameter: `usury_rate_EA` per credit type (consumer and ordinary, microcredit, etc.), certified by
  the Financial Superintendence. In Colombia, the usury rate is 1.5 times the certified current
  banking interest rate (Commercial Code, art. 884). **VERIFY** the current certification frequency
  per credit type.
- The usury rate enters as an `input` with provenance (`PUBLIC_REFERENCE`/`PROVIDER`: SFC URL via
  Tavily, effective date) and freshness.
- Compares the **agreed remunerative interest rate, in EA**, with the usury rate. Outputs:
  `status ∈ {BELOW, AT_OR_ABOVE}` and `margin_pp`.
- **Explicit assumption:** which charges count for usury purposes is a legal matter. The engine
  reports agreed rate vs usury and the total cost (§3) separately. It never states that a charge is
  illegal: it says "the agreed rate exceeds the current certified usury rate", with the source.
  Validate the wording with a lawyer (D-07).

## 5. Balance-transfer comparison — `credit.compare_refinance@1`

Inputs: current debt (balance, rate, remaining instalments and charges) and offer (rate, term,
insurance, switching costs).

- `total_current = Σ remaining payments` (with charges) and `total_offer = Σ payments` + switching
  costs.
- `nominal_savings = total_current − total_offer`.
- `pv_savings` discounted at the user's opportunity rate (parameter; defaults to their savings rate,
  marked `USER_ASSERTED` or `ESTIMATED`).
- `break_even_month` = first `k` in which cumulative savings ≥ switching costs.
- `instalment_delta` = new instalment − current instalment. The longer-term alert applies when the
  instalment drops but the total paid rises.

Output with truth class `DERIVED_DETERMINISTIC`, **unless** any input is `ESTIMATED`, in which case the
output inherits `ESTIMATED` (conservative propagation).

## 6. Debt payoff plan — `debt.payoff_plan@1`

Strategies: `AVALANCHE` (highest EA first) and `SNOWBALL` (smallest balance first). Monthly
simulation with minimum payments plus a surplus `extra`. Outputs: months until debt-free, total
interest and payment order. Both strategies are included so the user can compare; FINCH does not hide
the alternative.

## 7. 30-day cash-flow forecast — `cashflow.forecast_30d@1`

`balance_d = balance_{d−1} + income_d − obligations_d`, with `d = today..today+30`.

- Fixed income: known date and amount (`USER_ASSERTED`/`OBSERVED`).
- Variable income: **conservative estimate** (25th percentile of the last 3–6 available months) →
  the whole series becomes `ESTIMATED`.
- Colombian holidays and business days (`jurisdictions/CO/calendar`) to shift payment dates.
- Outputs: daily series, `first_deficit {day, amount}` (balance < `buffer`) and projected minimum.

## 8. Safe to spend today — `cashflow.safe_to_spend@1`

`STS = max(0, min_{d ∈ [today, next_income]} projected_balance_d − buffer)`

Conservative by design: what will be needed before the next income cannot be spent today. `buffer`
is a user preference (a `CONSTRAINT` memory).

## 9. Required golden vectors (minimum per formula)

| Formula                    | Minimum cases                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `rate.convert`             | 12: each direction, `m` ∈ {12, 4, 1}, in advance, rate 0, high rate (> 100 % EA), error `i_a ≥ 1` |
| `amortization.french`      | 6: `i = 0`, `n = 1`, `n = 360`, small amounts (rounding), last-instalment residue                 |
| `credit.total_cost`        | 6: no charges (IRR = rate), insurance on balance and on original, upfront costs, GMF              |
| `credit.usury_check`       | 4: below, equal, above and _STALE_ source                                                         |
| `credit.compare_refinance` | 6: savings, loss from longer term, break-even in month 1 and never, `ESTIMATED` input             |
| `debt.payoff_plan`         | 4: both strategies, `extra = 0`, impossible debt (payment < interest) → explanatory error         |
| `cashflow.forecast_30d`    | 4: no deficit, deficit, holiday, variable income                                                  |
| `cashflow.safe_to_spend`   | 3: positive, zero and no known next income                                                        |
