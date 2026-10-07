/**
 * `budget.envelope_state@1` tests — golden vectors per
 * docs/financial-formulas/personal-finance.md "Vectores mínimos" (nominal, borde,
 * conservación, error explicativo).
 */
import { describe, it, expect } from 'vitest';
import { Money } from './money.js';
import { computeEnvelopeState, type EnvelopeStateInput } from './envelope-state.js';

const COP = 'COP';
const cop = (amount: string): Money => Money.fromDecimalString(amount, COP);

describe('computeEnvelopeState — golden vectors (personal-finance.md §2)', () => {
  it('nominal: allocation, expense and a transfer in, crossing the 80% alert', () => {
    const input: EnvelopeStateInput = {
      envelopes: [
        { name: 'Mercado', allocated: cop('200000') },
        { name: 'Transporte', allocated: cop('100000') },
      ],
      expenses: [
        { envelope: 'Mercado', amount: cop('170000') },
        { envelope: 'Transporte', amount: cop('20000') },
      ],
      transfers: [{ fromEnvelope: 'Transporte', toEnvelope: 'Mercado', amount: cop('30000') }],
    };

    const result = computeEnvelopeState(input);
    const mercado = result.envelopes.find((e) => e.name === 'Mercado');
    const transporte = result.envelopes.find((e) => e.name === 'Transporte');

    // Mercado: 200,000 + 30,000 transfer in = 230,000 net; spent 170,000 -> 73.9% -> OK
    expect(mercado?.netAllocated.toDecimalString()).toBe('230000.00');
    expect(mercado?.available.toDecimalString()).toBe('60000.00');
    expect(mercado?.alertLevel).toBe('OK');

    // Transporte: 100,000 - 30,000 transfer out = 70,000 net; spent 20,000 -> 28.6% -> OK
    expect(transporte?.netAllocated.toDecimalString()).toBe('70000.00');
    expect(transporte?.available.toDecimalString()).toBe('50000.00');
    expect(transporte?.alertLevel).toBe('OK');
  });

  it('nominal: spend crossing exactly 80% and exactly 100%', () => {
    const input: EnvelopeStateInput = {
      envelopes: [
        { name: 'A', allocated: cop('1000') },
        { name: 'B', allocated: cop('1000') },
      ],
      expenses: [
        { envelope: 'A', amount: cop('800') },
        { envelope: 'B', amount: cop('1000') },
      ],
      transfers: [],
    };

    const result = computeEnvelopeState(input);

    expect(result.envelopes.find((e) => e.name === 'A')?.alertLevel).toBe('WARNING_80');
    expect(result.envelopes.find((e) => e.name === 'B')?.alertLevel).toBe('EXCEEDED_100');
  });

  it('borde: a single envelope with no expenses or transfers keeps the full allocation', () => {
    const input: EnvelopeStateInput = {
      envelopes: [{ name: 'Ahorro', allocated: cop('50000') }],
      expenses: [],
      transfers: [],
    };

    const result = computeEnvelopeState(input);

    expect(result.envelopes).toHaveLength(1);
    expect(result.envelopes[0]?.available.toDecimalString()).toBe('50000.00');
    expect(result.envelopes[0]?.alertLevel).toBe('OK');
  });

  it('borde: an envelope allocated zero is EXCEEDED_100 the moment anything is spent', () => {
    const input: EnvelopeStateInput = {
      envelopes: [{ name: 'Imprevistos', allocated: cop('0') }],
      expenses: [{ envelope: 'Imprevistos', amount: cop('1') }],
      transfers: [],
    };

    const result = computeEnvelopeState(input);

    expect(result.envelopes[0]?.alertLevel).toBe('EXCEEDED_100');
    expect(result.envelopes[0]?.available.toDecimalString()).toBe('-1.00');
  });

  it('conservación: transfers never change the sum of netAllocated across envelopes', () => {
    const input: EnvelopeStateInput = {
      envelopes: [
        { name: 'A', allocated: cop('500000') },
        { name: 'B', allocated: cop('300000') },
        { name: 'C', allocated: cop('0') },
      ],
      expenses: [],
      transfers: [
        { fromEnvelope: 'A', toEnvelope: 'C', amount: cop('123456') },
        { fromEnvelope: 'B', toEnvelope: 'C', amount: cop('1') },
        { fromEnvelope: 'C', toEnvelope: 'A', amount: cop('99999') },
      ],
    };

    const result = computeEnvelopeState(input);
    const totalAllocated = input.envelopes.reduce(
      (sum, e) => sum.add(e.allocated),
      Money.zero(COP),
    );
    const totalNet = result.envelopes.reduce((sum, e) => sum.add(e.netAllocated), Money.zero(COP));

    expect(totalNet.equals(totalAllocated)).toBe(true);
  });

  it('error explicativo: an expense against an unknown envelope throws', () => {
    const input: EnvelopeStateInput = {
      envelopes: [{ name: 'Mercado', allocated: cop('100000') }],
      expenses: [{ envelope: 'No existe', amount: cop('1000') }],
      transfers: [],
    };

    expect(() => computeEnvelopeState(input)).toThrow(/unknown envelope/);
  });

  it('error explicativo: a transfer to/from an unknown envelope throws', () => {
    const input: EnvelopeStateInput = {
      envelopes: [{ name: 'Mercado', allocated: cop('100000') }],
      expenses: [],
      transfers: [{ fromEnvelope: 'Mercado', toEnvelope: 'Fantasma', amount: cop('1') }],
    };

    expect(() => computeEnvelopeState(input)).toThrow(/unknown envelope/);
  });
});
