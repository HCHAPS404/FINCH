/**
 * Decimal module — ADR-0016, task S0-13.
 *
 * Reference values were computed independently with Python's `decimal` module at 60
 * significant digits (not with this code), and match the illustrative examples in
 * docs/financial-formulas/colombia-credit.md §1–§2. They prove the library can carry
 * the rate conversions the engine needs; the formulas themselves (rate.convert@1,
 * amortization.french@1) get their own golden vectors in S1-01.
 */
import { describe, expect, it } from 'vitest';

import {
  DECIMAL_PRECISION,
  decimal,
  decimalToMoney,
  moneyToDecimal,
  roundDecimal,
} from './decimal.js';
import { Money, ROUNDING_MODES } from './money.js';

/** Compare to `digits` significant digits, independent of the last-digit rounding. */
function significant(value: string, digits: number): string {
  return decimal(value).toSignificantDigits(digits).toFixed();
}

describe('precision (independent Python decimal references)', () => {
  it('uses 40 significant digits', () => {
    expect(DECIMAL_PRECISION).toBe(40);
    expect(decimal('1').dividedBy(decimal('3')).toFixed()).toBe(
      '0.3333333333333333333333333333333333333333',
    );
  });

  it('periodic in arrears → EA: 2.3 % MV = 31.3734498399602126928988680233144321 % EA', () => {
    const ea = decimal('1.023').pow(12).minus(1).times(100);
    expect(ea.toFixed()).toBe('31.3734498399602126928988680233144321');
  });

  it('EA → periodic with a fractional power: 24 % EA → 1.80875824835106745313… % MV', () => {
    const monthly = decimal('1.24').pow(decimal('1').dividedBy(12)).minus(1).times(100);
    expect(monthly.toSignificantDigits(35).toFixed()).toBe(
      significant('1.80875824835106745313530841617513954339', 35),
    );
  });

  it('in advance → in arrears: 2 % → 2.04081632653061224489795918367… %', () => {
    const arrears = decimal('0.02').dividedBy(decimal('1').minus('0.02')).times(100);
    expect(arrears.toSignificantDigits(35).toFixed()).toBe(
      significant('2.04081632653061224489795918367346938775', 35),
    );
  });

  it('French instalment: COP 10,000,000 at 1.6 % MV over 36 months ≈ 367,572.18', () => {
    const i = decimal('0.016');
    const c = decimal('10000000')
      .times(i)
      .dividedBy(decimal('1').minus(i.plus(1).pow(-36)));
    expect(c.toSignificantDigits(30).toFixed()).toBe(
      significant('367572.181573347415924858933630562841707', 30),
    );
    expect(decimalToMoney(c, 'COP', 'HALF_EVEN').toDecimalString()).toBe('367572.18');
  });

  it('ln and exp at 30+ significant digits', () => {
    expect(decimal('2').ln().toSignificantDigits(35).toFixed()).toBe(
      significant('0.693147180559945309417232121458176568075', 35),
    );
    expect(decimal('1').exp().toSignificantDigits(35).toFixed()).toBe(
      significant('2.71828182845904523536028747135266249775', 35),
    );
  });
});

describe('decimal() input discipline', () => {
  it('accepts plain decimal strings, bigints and decimals', () => {
    expect(decimal('-0.015').toFixed()).toBe('-0.015');
    expect(decimal(123n).toFixed()).toBe('123');
    expect(decimal(decimal('1.5')).toFixed()).toBe('1.5');
  });

  it.each(['1e5', 'NaN', 'Infinity', '2,3', '1.', '.5', '', ' 1', '0x10'])(
    'rejects %j',
    (input) => {
      expect(() => decimal(input)).toThrow(RangeError);
    },
  );
});

describe('rounding is explicit', () => {
  it.each([
    ['HALF_EVEN', '2.5', '2'],
    ['HALF_EVEN', '3.5', '4'],
    ['HALF_UP', '2.5', '3'],
    ['HALF_DOWN', '2.5', '2'],
    ['UP', '2.1', '3'],
    ['DOWN', '2.9', '2'],
    ['CEILING', '-2.9', '-2'],
    ['FLOOR', '-2.1', '-3'],
  ] as const)('%s rounds %s to %s', (mode, input, expected) => {
    expect(roundDecimal(decimal(input), 0, mode).toFixed()).toBe(expected);
  });

  it('maps every engine rounding mode', () => {
    for (const mode of ROUNDING_MODES) {
      expect(() => roundDecimal(decimal('1.25'), 1, mode)).not.toThrow();
    }
  });

  it('rejects invalid decimal places', () => {
    expect(() => roundDecimal(decimal('1'), -1, 'HALF_EVEN')).toThrow(RangeError);
    expect(() => roundDecimal(decimal('1'), 1.5, 'HALF_EVEN')).toThrow(RangeError);
  });
});

describe('Money bridge', () => {
  it('round-trips Money exactly', () => {
    const money = Money.fromDecimalString('4200000.55', 'COP');
    expect(moneyToDecimal(money).toFixed()).toBe('4200000.55');
    expect(decimalToMoney(moneyToDecimal(money), 'COP', 'HALF_EVEN').equals(money)).toBe(true);
  });

  it('rounds to the minor unit with the stated mode', () => {
    expect(decimalToMoney(decimal('10.005'), 'USD', 'HALF_EVEN').toDecimalString()).toBe('10.00');
    expect(decimalToMoney(decimal('10.005'), 'USD', 'HALF_UP').toDecimalString()).toBe('10.01');
    expect(decimalToMoney(decimal('-10.005'), 'USD', 'FLOOR').toDecimalString()).toBe('-10.01');
  });
});
