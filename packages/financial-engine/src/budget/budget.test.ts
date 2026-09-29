/**
 * budget.allocate@1 and budget.envelope_state@1 — golden vectors (independent Python
 * reference) and invariants. personal-finance.md §1–§2.
 */
import { describe, expect, it } from 'vitest';

import { loadVectors } from '../../test/load-vectors.js';
import { decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { getFormula } from '../formula-registry.js';
import { Money } from '../money.js';
import { budgetAllocate, type AllocateInput } from './allocate.js';
import { envelopeState } from './envelope.js';
import './formulas.js';

interface AllocateInputs {
  income: string;
  nextIncome: string;
  obligations: { id: string; amount: string; dueDate: string }[];
  debts: { id: string; minimum: string; dueDate: string; rate: string; balance: string }[];
  rule: { kind: 'NONE' | 'RULE_50_30_20' | 'PAY_YOURSELF_FIRST'; rate?: string };
  buffer: { target: string; current: string; capPerCycle: string };
  goals: { id: string; priority: string; targetDate: string; suggested: string }[];
  strategy: 'DEBT_AVALANCHE' | 'SAVINGS';
  surplusShare: string;
}

const cop = (value: string | bigint): Money => Money.fromMinorUnits(BigInt(value), 'COP');

function toInput(v: AllocateInputs): AllocateInput {
  return {
    income: cop(v.income),
    nextIncome: v.nextIncome,
    obligations: v.obligations.map((o) => ({
      id: o.id,
      amount: cop(o.amount),
      dueDate: o.dueDate,
    })),
    debts: v.debts.map((d) => ({
      id: d.id,
      minimum: cop(d.minimum),
      dueDate: d.dueDate,
      monthlyRate: decimal(d.rate),
      balance: cop(d.balance),
    })),
    rule:
      v.rule.kind === 'PAY_YOURSELF_FIRST'
        ? { kind: 'PAY_YOURSELF_FIRST', rate: decimal(v.rule.rate ?? '') }
        : { kind: v.rule.kind },
    buffer: {
      target: cop(v.buffer.target),
      current: cop(v.buffer.current),
      capPerCycle: cop(v.buffer.capPerCycle),
    },
    goals: v.goals.map((g) => ({
      id: g.id,
      priority: Number(g.priority),
      targetDate: g.targetDate,
      suggested: cop(g.suggested),
    })),
    strategy: v.strategy,
    surplusShare: decimal(v.surplusShare),
  };
}

const allocateFile = loadVectors<
  AllocateInputs,
  {
    lines: { layer: string; destination: string; amount: string }[];
    free: string;
    shortfall: string;
  }
>('budget.allocate@1.json');

const envelopeFile = loadVectors<
  { allocated: string; expenses: string[]; transfersIn: string[]; transfersOut: string[] },
  { spent: string; available: string; alert: string }
>('budget.envelope_state@1.json');

describe('budget.allocate@1 golden vectors', () => {
  for (const vector of allocateFile.vectors) {
    it(vector.description, () => {
      const r = budgetAllocate(toInput(vector.inputs));
      expect(
        r.lines.map((l) => ({
          layer: l.layer,
          destination: l.destination,
          amount: l.amount.minorUnits.toString(),
        })),
      ).toEqual(vector.expected.lines);
      expect(r.free.minorUnits.toString()).toBe(vector.expected.free);
      expect(r.shortfall.minorUnits.toString()).toBe(vector.expected.shortfall);
    });
  }
});

describe('budget.allocate@1 invariants', () => {
  it('conserves the income exactly: Σ allocations + free = income + shortfall', () => {
    for (const vector of allocateFile.vectors) {
      for (const income of [0n, 1n, 199_999_999n, 450_000_001n, 10_000_000_000n]) {
        const r = budgetAllocate({ ...toInput(vector.inputs), income: cop(income) });
        const total = r.lines.reduce((s, l) => s + l.amount.minorUnits, 0n) + r.free.minorUnits;
        expect(total).toBe(income + r.shortfall.minorUnits);
        expect(r.free.minorUnits >= 0n).toBe(true);
      }
    }
  });

  it('refuses shares outside [0, 1] and negative amounts', () => {
    const base = toInput(allocateFile.vectors[0]!.inputs);
    expect(() => budgetAllocate({ ...base, surplusShare: decimal('1.1') })).toThrow(
      FinancialInputError,
    );
    expect(() => budgetAllocate({ ...base, income: cop(-1n) })).toThrow(FinancialInputError);
  });
});

describe('budget.envelope_state@1 golden vectors', () => {
  for (const vector of envelopeFile.vectors) {
    it(vector.description, () => {
      const v = vector.inputs;
      const r = envelopeState({
        allocated: cop(v.allocated),
        expenses: v.expenses.map(cop),
        transfersIn: v.transfersIn.map(cop),
        transfersOut: v.transfersOut.map(cop),
      });
      expect(r.spent.minorUnits.toString()).toBe(vector.expected.spent);
      expect(r.available.minorUnits.toString()).toBe(vector.expected.available);
      expect(r.alert).toBe(vector.expected.alert);
    });
  }
});

describe('budget.envelope_state@1 invariants', () => {
  it('a transfer between two envelopes conserves the cycle total', () => {
    const a = envelopeState({
      allocated: cop(100n),
      expenses: [cop(30n)],
      transfersIn: [],
      transfersOut: [cop(20n)],
    });
    const b = envelopeState({
      allocated: cop(50n),
      expenses: [cop(10n)],
      transfersIn: [cop(20n)],
      transfersOut: [],
    });
    expect(a.available.minorUnits + b.available.minorUnits).toBe(150n - 40n);
  });
});

describe('budget registry entries', () => {
  it('budget.allocate@1 vectors reproduce', () => {
    for (const v of getFormula('budget.allocate', 1).testVectors) {
      const base = toInput(allocateFile.vectors[0]!.inputs);
      const r = budgetAllocate({ ...base, income: cop(v.inputs['income'] ?? '') });
      expect(
        `${r.free.minorUnits.toString()}/${r.shortfall.minorUnits.toString()}`,
        v.description,
      ).toBe(v.expected);
    }
  });

  it('budget.envelope_state@1 vectors reproduce', () => {
    for (const v of getFormula('budget.envelope_state', 1).testVectors) {
      const r = envelopeState({
        allocated: cop(v.inputs['allocated'] ?? ''),
        expenses: [cop(v.inputs['spent'] ?? '')],
        transfersIn: [],
        transfersOut: [],
      });
      expect(r.alert, v.description).toBe(v.expected);
    }
  });
});
