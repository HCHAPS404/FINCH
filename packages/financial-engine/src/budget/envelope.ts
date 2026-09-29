/**
 * budget.envelope_state@1 — state of one budget envelope in a cycle (B2).
 * Spec: docs/financial-formulas/personal-finance.md §2.
 *
 *   budget    = allocated + Σ transfers in − Σ transfers out
 *   available = budget − Σ expenses
 *   alert     = LIMIT_100 if spent ≥ budget, WARN_80 if spent ≥ 0.8 · budget, else NONE
 *               (only when something was spent; compared exactly as 5·spent ≥ 4·budget)
 *
 * No rounding: sums of minor units. Moving money between envelopes conserves the cycle
 * total because a transfer is an `out` on one envelope and the same `in` on another.
 */
import { FinancialInputError } from '../errors.js';
import { CurrencyMismatchError, Money } from '../money.js';

export interface EnvelopeInput {
  readonly allocated: Money;
  readonly expenses: readonly Money[];
  readonly transfersIn: readonly Money[];
  readonly transfersOut: readonly Money[];
}

export interface EnvelopeState {
  readonly formula: { readonly formulaId: 'budget.envelope_state'; readonly version: 1 };
  readonly spent: Money;
  readonly available: Money;
  readonly alert: 'NONE' | 'WARN_80' | 'LIMIT_100';
}

export function envelopeState(input: EnvelopeInput): EnvelopeState {
  const code = input.allocated.currency.code;
  const sum = (values: readonly Money[]): bigint => {
    let total = 0n;
    for (const value of values) {
      if (value.currency.code !== code) throw new CurrencyMismatchError(code, value.currency.code);
      if (value.minorUnits < 0n) {
        throw new FinancialInputError(
          'INVALID_CHARGES',
          'Envelope movements must be non-negative.',
        );
      }
      total += value.minorUnits;
    }
    return total;
  };
  const spent = sum(input.expenses);
  const budget = sum([input.allocated]) + sum(input.transfersIn) - sum(input.transfersOut);
  const alert =
    spent > 0n && spent >= budget
      ? 'LIMIT_100'
      : spent > 0n && 5n * spent >= 4n * budget
        ? 'WARN_80'
        : 'NONE';
  return {
    formula: { formulaId: 'budget.envelope_state', version: 1 },
    spent: Money.fromMinorUnits(spent, code),
    available: Money.fromMinorUnits(budget - spent, code),
    alert,
  };
}
