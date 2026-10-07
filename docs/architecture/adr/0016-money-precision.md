# ADR-0016: Monetary precision representation

- **Status:** Accepted
- **Date:** 2026-09-17
- **Deciders:** HELL
- **Normative source:** README.md Constitution §4.3, §14.1

## Context

> **Outstanding.** The decision below is recorded from README.md, which README §2 establishes as the architecture authority. This file exists so the decision is discoverable and supersedable in the normal way. The forces and measurements that justify it have not yet been written out here.

## Decision

Settled amounts are bigint counts of ISO 4217 minor units. Rates and intermediate calculations use arbitrary-precision decimals. Binary floating point is never an authoritative money representation. Implemented in packages/financial-engine; enforced by the finch/no-float-money ESLint rule.

**Addendum, 2026-10-07 (closes S0-13 — "librería decimal (potencias fraccionarias)"):**
the arbitrary-precision decimal library for rates and intermediate calculations is
**`decimal.js`** (10.6.0, MIT, zero runtime dependencies). It is needed specifically
for `docs/financial-formulas/colombia-credit.md`'s `rate.convert@1` and related
formulas, which require fractional-exponent rate conversion (e.g. `(1+EA)^(1/m) − 1`)
at ≥34 significant digits — `bigint`/`Money` alone cannot express a fractional power.
Not yet added as a dependency or used anywhere in the codebase as of this addendum;
this records the choice so whoever implements `colombia-credit.md` next does not
re-litigate it.

## Alternatives considered

**Decimal library for fractional-power rate math (addendum, 2026-10-07):**

| Library               | Fractional `pow()`                                   | `ln`/`log`/`exp`                  | Configurable precision                       | Runtime deps |
| --------------------- | ---------------------------------------------------- | --------------------------------- | -------------------------------------------- | ------------ |
| `decimal.js` 10.6.0   | Yes — documented explicitly                          | Yes (`.ln()`, `.log()`, `.exp()`) | Yes (`Decimal.set({ precision, rounding })`) | 0            |
| `bignumber.js` 11.1.5 | **No** — its own docs say to use decimal.js for this | None                              | Yes                                          | 0            |
| `big.js` 7.0.1        | **No**                                               | None                              | Partial                                      | 0            |

`bignumber.js` and `big.js` were ruled out on the first requirement: neither supports a
non-integer exponent, which `rate.convert@1` needs unconditionally. `decimal.js` is
from the same author as `bignumber.js` (MikeMcl) — it is the tool built specifically
for this case. It ships its own TypeScript types (`decimal.d.ts`), has no native
bindings (pure computation, holds `packages/financial-engine`'s no-I/O purity
contract per §14 and is not in `.dependency-cruiser.cjs`'s `INFRASTRUCTURE_MODULES`
list), and its ~284 KB size is irrelevant here since this package never ships to a
browser bundle.

> **Outstanding** for the original 2026-09-17 decision (bigint minor units as the
> settled-money representation, vs. storing money as a decimal type throughout): not
> yet written. The addendum above only covers the narrower decimal-library choice for
> rates, added later under S0-13.

## Consequences

> **Outstanding.** Positive, negative and accepted trade-offs to be recorded.

## Security impact

> **Outstanding.**

## Privacy impact

> **Outstanding.**

## Cost

> **Outstanding.**

## Migration

> **Outstanding.**

## Rollback

> **Outstanding.**

## References

- README.md Constitution §4.3, §14.1
- `docs/architecture/adr/0000-template.md`
