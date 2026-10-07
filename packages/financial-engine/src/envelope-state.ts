/**
 * `budget.envelope_state@1` — docs/financial-formulas/personal-finance.md §2 (B2).
 * Tracks each envelope's available balance for the cycle: what was allocated, moved
 * in/out via transfers, and spent — plus the 80%/100% alert the UI surfaces.
 */
import { Money } from './money.js';
import { registerFormula } from './formula-registry.js';

export const ENVELOPE_ALERT_LEVELS = ['OK', 'WARNING_80', 'EXCEEDED_100'] as const;
export type EnvelopeAlertLevel = (typeof ENVELOPE_ALERT_LEVELS)[number];

export interface EnvelopeAllocation {
  readonly name: string;
  readonly allocated: Money;
}

export interface EnvelopeExpense {
  readonly envelope: string;
  readonly amount: Money;
}

export interface EnvelopeTransfer {
  readonly fromEnvelope: string;
  readonly toEnvelope: string;
  readonly amount: Money;
}

export interface EnvelopeStateInput {
  readonly envelopes: readonly EnvelopeAllocation[];
  readonly expenses: readonly EnvelopeExpense[];
  readonly transfers: readonly EnvelopeTransfer[];
}

export interface EnvelopeState {
  readonly name: string;
  readonly allocated: Money;
  /** `allocated` after transfers in/out. Σ netAllocated === Σ allocated, always. */
  readonly netAllocated: Money;
  readonly spent: Money;
  /** `netAllocated - spent`. Can go negative — an overspent envelope, not an error. */
  readonly available: Money;
  readonly alertLevel: EnvelopeAlertLevel;
}

export interface EnvelopeStateResult {
  readonly envelopes: readonly EnvelopeState[];
}

function alertLevelFor(netAllocated: Money, spent: Money): EnvelopeAlertLevel {
  if (!netAllocated.isPositive()) {
    return spent.isPositive() ? 'EXCEEDED_100' : 'OK';
  }
  const spentUnits = spent.minorUnits;
  const allocatedUnits = netAllocated.minorUnits;
  if (spentUnits * 100n >= allocatedUnits * 100n) return 'EXCEEDED_100';
  if (spentUnits * 100n >= allocatedUnits * 80n) return 'WARNING_80';
  return 'OK';
}

export function computeEnvelopeState(input: EnvelopeStateInput): EnvelopeStateResult {
  const known = new Set(input.envelopes.map((e) => e.name));
  for (const expense of input.expenses) {
    if (!known.has(expense.envelope)) {
      throw new RangeError(
        `budget.envelope_state@1: expense references unknown envelope '${expense.envelope}'.`,
      );
    }
  }
  for (const transfer of input.transfers) {
    if (!known.has(transfer.fromEnvelope) || !known.has(transfer.toEnvelope)) {
      throw new RangeError(
        `budget.envelope_state@1: transfer references an unknown envelope ` +
          `('${transfer.fromEnvelope}' -> '${transfer.toEnvelope}').`,
      );
    }
  }

  return {
    envelopes: input.envelopes.map((envelope) => {
      const currency = envelope.allocated.currency.code;

      const transferredIn = input.transfers
        .filter((t) => t.toEnvelope === envelope.name)
        .reduce((sum, t) => sum.add(t.amount), Money.zero(currency));
      const transferredOut = input.transfers
        .filter((t) => t.fromEnvelope === envelope.name)
        .reduce((sum, t) => sum.add(t.amount), Money.zero(currency));
      const netAllocated = envelope.allocated.add(transferredIn).subtract(transferredOut);

      const spent = input.expenses
        .filter((e) => e.envelope === envelope.name)
        .reduce((sum, e) => sum.add(e.amount), Money.zero(currency));

      return {
        name: envelope.name,
        allocated: envelope.allocated,
        netAllocated,
        spent,
        available: netAllocated.subtract(spent),
        alertLevel: alertLevelFor(netAllocated, spent),
      };
    }),
  };
}

registerFormula({
  formulaId: 'budget.envelope_state',
  version: 1,
  purpose:
    "Compute each envelope's available balance for the cycle from its allocation, " +
    'transfers in/out, and expenses, plus the 80%/100% spend alert.',
  inputs: [
    { name: 'envelopes', unit: 'list', description: 'Name + Money allocated for the cycle.' },
    { name: 'expenses', unit: 'list', description: 'Envelope name + Money spent.' },
    {
      name: 'transfers',
      unit: 'list',
      description: 'Money moved between two named envelopes this cycle.',
    },
  ],
  outputUnit: 'per-envelope (Money netAllocated, spent, available) + alert level',
  rounding: 'None — every operation is exact Money addition/subtraction.',
  assumptions: [
    'Every expense and transfer must reference an envelope declared in `envelopes`; an unknown ' +
      'name is a configuration error, not a silent no-op.',
    "A transfer always conserves the cycle total: what leaves one envelope's netAllocated " +
      "arrives in another's, never created or destroyed.",
    'An overspent envelope (available < 0) is a valid state, not an error — the UI surfaces it ' +
      'via alertLevel EXCEEDED_100, it does not reject the expense.',
  ],
  reference: 'docs/financial-formulas/personal-finance.md §2.',
  edgeCases: [
    'netAllocated at or below zero: alert is EXCEEDED_100 if anything was spent, else OK — the ' +
      '80/100 ratio is undefined against a non-positive base, so it is not used there.',
    'No expenses or transfers: available equals the original allocation for every envelope.',
    'Transfers that exactly zero out one envelope to fund another still conserve the total.',
  ],
  implementationPath: 'packages/financial-engine/src/envelope-state.ts#computeEnvelopeState',
  testVectors: [
    {
      description: 'Nominal: allocation, a transfer in, and expenses crossing 80%',
      inputs: { allocated: '200000', currency: 'COP' },
      expected: 'available reflects net allocation minus spend; alertLevel WARNING_80',
    },
    {
      description: 'Conservación: Σ netAllocated === Σ allocated after transfers',
      inputs: { envelopes: '3', transfers: '2' },
      expected: 'sum(netAllocated) === sum(allocated)',
    },
  ],
});
