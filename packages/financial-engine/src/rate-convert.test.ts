/**
 * `rate.convert@1` tests — docs/financial-formulas/colombia-credit.md §1 and §9
 * ("vectores golden requeridos": each direction, m ∈ {12,4,1}, anticipada, rate 0,
 * high rate, error i_a >= 1).
 *
 * The four "worked example" assertions reproduce the doc's own illustrative numbers
 * (§1, computed there with a 40-digit decimal calculator) — the doc itself labels
 * these as "no son golden vectors hasta la verificación independiente" (S1-05). They
 * are kept here as a strong regression check, not claimed as the independent
 * verification that task still requires.
 */
import { describe, it, expect } from 'vitest';
import {
  Rate,
  periodicToEffectiveAnnual,
  effectiveAnnualToPeriodic,
  nominalToPeriodic,
  periodicToNominal,
  anticipatedToDue,
  dueToAnticipated,
} from './rate-convert.js';

function closeTo(actual: string, expected: string, decimalPlaces = 10): void {
  const diff = new Rate(actual).minus(expected).abs();
  expect(diff.lessThan(new Rate(10).pow(-decimalPlaces))).toBe(true);
}

describe('rate.convert@1 — worked examples from colombia-credit.md §1', () => {
  it('2.3% monthly (due) -> EA', () => {
    closeTo(periodicToEffectiveAnnual('0.023', 12), '0.313734498399602', 12);
  });

  it('24% EA -> monthly (due)', () => {
    closeTo(effectiveAnnualToPeriodic('0.24', 12), '0.018087582483510674', 15);
  });

  it('24% NAMV -> monthly, then that monthly rate -> EA', () => {
    const monthly = nominalToPeriodic('0.24', 12);
    closeTo(monthly, '0.02', 15);
    closeTo(periodicToEffectiveAnnual(monthly, 12), '0.268241794562545', 12);
  });

  it('2% monthly anticipated -> due', () => {
    closeTo(anticipatedToDue('0.02'), '0.020408163265306122', 15);
  });
});

describe('rate.convert@1 — golden vectors (colombia-credit.md §9)', () => {
  it.each([1, 4, 12] as const)('periodic <-> EA round-trips exactly for m=%i', (m) => {
    const periodic = '0.015';
    const ea = periodicToEffectiveAnnual(periodic, m);
    const roundTripped = effectiveAnnualToPeriodic(ea, m);
    closeTo(roundTripped, periodic, 20);
  });

  it('nominal <-> periodic round-trips for every allowed periodsPerYear', () => {
    for (const m of [1, 2, 4, 6, 12, 360, 365] as const) {
      const nominal = '0.12';
      const periodic = nominalToPeriodic(nominal, m);
      expect(periodicToNominal(periodic, m)).toBe(nominal);
    }
  });

  it('anticipated <-> due round-trips', () => {
    const due = anticipatedToDue('0.05');
    closeTo(dueToAnticipated(due), '0.05', 20);
  });

  it('a rate of exactly 0 round-trips through every conversion unchanged', () => {
    expect(periodicToEffectiveAnnual('0', 12)).toBe('0');
    expect(effectiveAnnualToPeriodic('0', 12)).toBe('0');
    expect(nominalToPeriodic('0', 12)).toBe('0');
    expect(periodicToNominal('0', 12)).toBe('0');
    expect(anticipatedToDue('0')).toBe('0');
    expect(dueToAnticipated('0')).toBe('0');
  });

  it('a high rate (> 100% EA) is accepted, not capped', () => {
    const periodic = effectiveAnnualToPeriodic('5', 12); // 500% EA
    expect(new Rate(periodic).isPositive()).toBe(true);
    closeTo(periodicToEffectiveAnnual(periodic, 12), '5', 10);
  });

  it('error explicativo: anticipatedToDue rejects i_a >= 1', () => {
    expect(() => anticipatedToDue('1')).toThrow(/>= 1/);
    expect(() => anticipatedToDue('1.5')).toThrow(/>= 1/);
  });

  it('error explicativo: a negative rate is rejected without the explicit opt-in', () => {
    expect(() => periodicToEffectiveAnnual('-0.01', 12)).toThrow(/allowNegative/);
    expect(() => nominalToPeriodic('-0.12', 12)).toThrow(/allowNegative/);
    expect(() => periodicToNominal('-0.01', 12)).toThrow(/allowNegative/);
    expect(periodicToEffectiveAnnual('-0.01', 12, { allowNegative: true })).toBeDefined();
    expect(nominalToPeriodic('-0.12', 12, { allowNegative: true })).toBe('-0.01');
    expect(periodicToNominal('-0.01', 12, { allowNegative: true })).toBe('-0.12');
  });

  it('error explicativo: dueToAnticipated rejects i_v = -1', () => {
    expect(() => dueToAnticipated('-1', { allowNegative: true })).toThrow(/undefined/);
  });

  it('error explicativo: an unsupported periodsPerYear is rejected', () => {
    expect(() => periodicToEffectiveAnnual('0.01', 7)).toThrow(/periodsPerYear/);
  });

  it('error explicativo: a non-numeric rate string is rejected', () => {
    expect(() => periodicToEffectiveAnnual('not-a-number', 12)).toThrow(/Invalid argument/);
  });
});
