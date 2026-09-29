# ADR-0016: Monetary precision representation

- **Status:** Accepted
- **Date:** 2026-09-17 (decision) · 2026-09-29 (context, alternatives and decimal library
  recorded, task S0-13)
- **Deciders:** HELL
- **Normative source:** Constitution §4.3, §14.1

## Context

FINCH shows people what a loan, a card or a deposit really costs. A figure that is off by
one peso because of binary floating point is a correctness defect, and in a comparison
it can flip a recommendation. Two different kinds of number appear:

- **settled amounts** (a balance, an instalment, a fee): always a whole number of minor
  units of a currency;
- **rates and intermediates** (2.3 % MV, `(1 + EA)^(1/12)`, an IRR iteration): not
  amounts, and they need fractional powers, `ln` and `exp`
  (docs/financial-formulas/colombia-credit.md §1, §3).

JavaScript's `number` is an IEEE-754 double: `0.1 + 0.2 !== 0.3`, and 16–17 significant
digits are not enough to carry a 36-month IRR without drift. `bigint` is exact but has no
fractions.

## Decision

Settled amounts are `bigint` counts of ISO 4217 minor units (`Money`). Rates and
intermediate calculations use **decimal.js 10.6.0** through an isolated clone in
`packages/financial-engine/src/decimal.ts`: 40 significant digits, `ROUND_HALF_EVEN`,
no exponent notation, JS `number` refused at the boundary. Converting back to `Money`
always states a `RoundingMode`. Binary floating point is never an authoritative money
representation; enforced by the `finch/no-float-money` ESLint rule.

## Alternatives considered

| Option                                  | Why not                                                                                                                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `number` everywhere                     | Not exact; the defect this ADR exists to prevent.                                                                                                                             |
| `bigint` only, rates as scaled integers | Exact for `+ − ×`, but fractional powers, `ln` and `exp` (rate conversion, IRR) would need a hand-written numeric library — more code to verify than the formulas themselves. |
| big.js                                  | Small and exact, but `pow` accepts integer exponents only; `(1 + EA)^(1/12)` is impossible.                                                                                   |
| bignumber.js                            | Arbitrary precision, but no `ln`/`exp` and non-integer `pow` are not supported.                                                                                               |
| TC39 `Decimal` proposal                 | Not available in Node 24; revisit when it ships.                                                                                                                              |
| decimal.js (chosen)                     | Arbitrary precision with non-integer `pow`, `ln`, `exp`; MIT; zero dependencies; published 2025-07-06, beyond the repo's minimum release age.                                 |

## Consequences

### Positive

- Every rate conversion in the formula specs is computable exactly to 40 digits; the
  S0-13 tests match independent Python `decimal` references (e.g. 2.3 % MV →
  31.3734498399602126928988680233144321 % EA).
- An isolated clone means no other code can change FINCH's precision globally.

### Negative

- One more runtime dependency in the engine, and decimals are slower than `number`.
  Acceptable: the engine computes per user request, not per market tick.
- `pow` with fractional exponents is correct to the configured precision, not
  infinitely; tests compare at 30–35 significant digits.

### Neutral / accepted trade-offs

- Locale formats (`2,3 %`, `4.200.000`) are parsed at the boundary, never in the engine.

## Security impact

None to the trust boundaries. Supply-chain surface grows by one zero-dependency package,
pinned exactly and covered by the lockfile policy, dependency review and SBOM.

## Privacy impact

None.

## Cost

None (MIT).

## Migration

None: no formula used floating point before this decision.

## Rollback

Replace the implementation behind `decimal.ts`; callers depend on the module's
functions, not on decimal.js directly.

## References

- Constitution §4.3, §14.1
- docs/financial-formulas/colombia-credit.md, personal-finance.md
- `packages/financial-engine/src/decimal.ts`, `decimal.test.ts`
