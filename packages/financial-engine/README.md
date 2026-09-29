# @finch/financial-engine

Pure, deterministic financial mathematics. README §14, ADR-0016, ADR-0017.

## Responsibility

Compute every figure FINCH shows, exactly and reproducibly, from its inputs alone.

## Owns

- `Money` — settled amounts as `bigint` ISO 4217 minor units; explicit rounding
  (`HALF_EVEN`, `HALF_UP`, `HALF_DOWN`, `UP`, `DOWN`, `CEILING`, `FLOOR`); no implicit
  currency conversion.
- `decimal` — arbitrary-precision decimals (decimal.js 10.6.0, isolated clone,
  40 significant digits, half-even) for rates, fractional powers, `ln`/`exp` and IRR.
  Refuses JS `number`, exponent notation and locale formats. Bridges to `Money` only
  with an explicit rounding mode (`decimalToMoney`, `moneyToDecimal`).
- The formula registry (`formulaId@version`): purpose, inputs, rounding, assumptions,
  reference, edge cases and test vectors for every formula.
- Currency definitions (COP, USD, EUR with their ISO exponents).
- The credit engine (`src/credit/`, task S1-01, spec `docs/financial-formulas/colombia-credit.md`):
  - `rate.convert@1` — `convertRate` / `parseQuote` / `QUOTES` (EA, MV, NAMV, …) between
    effective or nominal, any supported frequency, in arrears or in advance;
  - `amortization.french@1` — `frenchAmortization`: fixed instalment and full schedule in
    `Money`, half-even per period, last instalment clears the balance;
  - `credit.total_cost@1` — `totalCost`: insurance (on balance, on original, fixed), fees,
    upfront costs and GMF; monthly IRR by bisection (`solveMonthlyIrr`) and the real
    effective annual rate;
  - `credit.usury_check@1` — `usuryCheck`: agreed EA vs certified usury EA, margin in
    percentage points, and `STALE` when the certification window does not cover the date;
  - `credit.compare_refinance@1` — `compareRefinance`: instalment delta, nominal and PV
    savings, break-even month, longer-term alert, conservative truth propagation;
  - `debt.payoff_plan@1` — `payoffPlan`: AVALANCHE and SNOWBALL side by side, months to
    debt-free, total interest and payoff order.
- The cash-flow engine (`src/cashflow/`, same spec §7–§8): `cashflow.forecast_30d@1`
  (`forecast30d`, business-day shifts from a calendar parameter, nearest-rank P25 for
  variable income) and `cashflow.safe_to_spend@1` (`safeToSpend`), over clock-free civil
  dates (`toDayNumber`, `toIsoDate`).

Dependencies: `decimal.js` and, among workspace packages, only `@finch/contracts` (for
`TruthClass`), as dependency-cruiser enforces.

## Does not own

- I/O of any kind, frameworks, SDKs, ambient time or randomness (enforced by
  dependency-cruiser and the `pureLayers` ESLint block).
- Country rules (usury, GMF, withholding, holidays): they arrive as parameters from
  `jurisdictions/<CC>/` (README §36).
- Presentation and locale formatting.

## Invariants

- Money is never a binary float (Constitution §4.3; `finch/no-float-money`).
- Rounding is never implicit.
- A formula change creates a new version; registered versions are never edited (§14.2).
- `money.allocate` conserves the total exactly.
- A French schedule repays exactly the principal and ends at a zero balance; a higher rate
  never lowers total interest.
- Total cost decomposes exactly into interest + insurance + fees + GMF + upfront costs; no
  added charge ever lowers the real effective rate.

## Failure modes

Formula-domain errors throw `FinancialInputError` with a stable `code`
(`RATE_OUT_OF_DOMAIN`, `UNSUPPORTED_QUOTE`, `INVALID_TERM`, `INVALID_PRINCIPAL`,
`UNAMORTIZABLE_IN_MINOR_UNITS`, `INVALID_CHARGES`, `IRR_NOT_FOUND`, `INVALID_DATE`,
`INVALID_VALIDITY_PERIOD`, `INVALID_DEBT`, `DEBT_NEVER_AMORTIZES`, `UNTRUSTED_INPUT`, `INVALID_INCOME_HISTORY`), which the API maps to `FINCH_FINANCIAL_<code>`.
Other invalid input throws immediately (`RangeError`, `CurrencyMismatchError`): an unknown
currency, a fractional minor unit, too many decimals for the currency, division by zero,
a non-plain decimal string, invalid decimal places. The engine never returns a
partially valid number.

## Observability

None by design: the engine is pure. Callers record the formula ID, version and inputs
in a `CalcReceipt`.

## Tests

`pnpm --filter @finch/financial-engine test` and `pnpm financial:verify` (JSON artifact).
Golden vectors live in `test/vectors/<formulaId>@<version>.json` and are produced by
`test/vectors/generate_credit_vectors.py`, an independent implementation with Python's
`decimal` module at 60 digits that never runs this code (the reference IRR uses Newton's
method, the engine bisection, so they agree only if both are right); re-run it with `python3` after
changing a case. The founders' spreadsheet (task S1-03) re-derives a subset before a
formula informs a recommendation (README §15). Every vector recorded in the registry is
recomputed by `src/credit/formulas.test.ts`, so the registry cannot drift from the code.
