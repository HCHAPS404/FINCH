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

## Failure modes

Invalid input throws immediately (`RangeError`, `CurrencyMismatchError`): an unknown
currency, a fractional minor unit, too many decimals for the currency, division by zero,
a non-plain decimal string, invalid decimal places. The engine never returns a
partially valid number.

## Observability

None by design: the engine is pure. Callers record the formula ID, version and inputs
in a `CalcReceipt`.

## Tests

`pnpm --filter @finch/financial-engine test` (76 tests) and `pnpm financial:verify`
(JSON artifact). Decimal reference values were computed independently with Python's
`decimal` module; formula golden vectors are verified in an independent spreadsheet
(task S1-03) before a formula informs a recommendation (README §15).
