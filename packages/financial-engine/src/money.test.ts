/**
 * Financial correctness harness for Money — README §15, §102.16.
 *
 * Three layers, per README §15:
 *   1. Golden vectors — known inputs with independently-reasoned expected outputs.
 *   2. Invariants — properties that must hold for EVERY input, not just chosen ones.
 *   3. Boundary and regression cases — where real financial bugs actually live.
 *
 * These tests are the reason the engine can be trusted. They run before anything is
 * allowed to call itself a recommendation.
 */
import { describe, it, expect } from 'vitest';
import { Money, divideRounded, sumMoney, CurrencyMismatchError } from './money.js';

// ---------------------------------------------------------------------------
// 1. The defect this module exists to prevent.
// ---------------------------------------------------------------------------

describe('binary floating point is not a money representation', () => {
  it('reproduces the classic float defect, then shows Money is immune', () => {
    // This is not a hypothetical: it is why Constitution §4.3 exists.
    expect(0.1 + 0.2).not.toBe(0.3);

    const a = Money.fromDecimalString('0.10', 'USD');
    const b = Money.fromDecimalString('0.20', 'USD');
    expect(a.add(b).toDecimalString()).toBe('0.30');
    expect(a.add(b).minorUnits).toBe(30n);
  });

  it('stays exact across ten thousand accumulations', () => {
    // A float accumulator drifts measurably here; bigint cannot.
    let total = Money.zero('COP');
    const cent = Money.fromMinorUnits(1n, 'COP');
    for (let i = 0; i < 10_000; i += 1) total = total.add(cent);

    expect(total.minorUnits).toBe(10_000n);
    expect(total.toDecimalString()).toBe('100.00');
  });

  it('does not expose a toNumber escape hatch', () => {
    const money = Money.fromDecimalString('1.00', 'USD');
    expect((money as unknown as Record<string, unknown>)['toNumber']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 2. Golden vectors — construction and serialization.
// ---------------------------------------------------------------------------

describe('golden vectors: parsing and formatting', () => {
  const VECTORS: readonly [string, string, bigint, string][] = [
    // input,        currency, expected minor units, expected round-trip
    ['0', 'COP', 0n, '0.00'],
    ['0.00', 'COP', 0n, '0.00'],
    ['1', 'COP', 100n, '1.00'],
    ['1.5', 'COP', 150n, '1.50'],
    ['1234.56', 'COP', 123_456n, '1234.56'],
    ['-1234.56', 'COP', -123_456n, '-1234.56'],
    ['0.01', 'USD', 1n, '0.01'],
    ['-0.01', 'USD', -1n, '-0.01'],
    ['4200000', 'COP', 420_000_000n, '4200000.00'],
    ['999999999999.99', 'USD', 99_999_999_999_999n, '999999999999.99'],
  ];

  it.each(VECTORS)('parses %s %s to %s minor units', (input, currency, minor, formatted) => {
    const money = Money.fromDecimalString(input, currency);
    expect(money.minorUnits).toBe(minor);
    expect(money.toDecimalString()).toBe(formatted);
  });

  it('refuses more precision than the currency has', () => {
    // Silently truncating here would destroy money without telling anyone.
    expect(() => Money.fromDecimalString('1.005', 'USD')).toThrow(RangeError);
  });

  it('refuses malformed input rather than coercing it', () => {
    for (const bad of ['', 'abc', '1.2.3', '1,50', '1e5', ' ', '--1']) {
      expect(() => Money.fromDecimalString(bad, 'USD')).toThrow(TypeError);
    }
  });

  it('refuses fractional minor units', () => {
    expect(() => Money.fromMinorUnits(1.5, 'USD')).toThrow(TypeError);
  });

  it('serializes amounts as strings so no JSON parser can float them', () => {
    const json = Money.fromDecimalString('1234.56', 'COP').toJSON();
    expect(json).toEqual({ amount: '1234.56', currency: 'COP', minorUnits: '123456' });
    expect(typeof json.amount).toBe('string');
    expect(typeof json.minorUnits).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// 3. Currency safety.
// ---------------------------------------------------------------------------

describe('currency is never coerced implicitly', () => {
  it('refuses to add different currencies', () => {
    const cop = Money.fromDecimalString('100.00', 'COP');
    const usd = Money.fromDecimalString('100.00', 'USD');
    expect(() => cop.add(usd)).toThrow(CurrencyMismatchError);
    expect(() => cop.subtract(usd)).toThrow(CurrencyMismatchError);
    expect(() => cop.compare(usd)).toThrow(CurrencyMismatchError);
  });

  it('treats equal amounts in different currencies as unequal', () => {
    const cop = Money.fromDecimalString('100.00', 'COP');
    const usd = Money.fromDecimalString('100.00', 'USD');
    expect(cop.equals(usd)).toBe(false);
  });

  it('rejects an unknown currency instead of guessing its precision', () => {
    expect(() => Money.zero('XYZ')).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// 4. Rounding — golden vectors per mode.
// ---------------------------------------------------------------------------

describe('golden vectors: divideRounded', () => {
  // 5/2 = 2.5 exactly at the half-way point, which is where modes disagree.
  const HALFWAY: readonly [Parameters<typeof divideRounded>[2], bigint][] = [
    ['HALF_UP', 3n],
    ['HALF_DOWN', 2n],
    ['HALF_EVEN', 2n], // 2 is even, so it stays
    ['UP', 3n],
    ['DOWN', 2n],
    ['CEILING', 3n],
    ['FLOOR', 2n],
  ];

  it.each(HALFWAY)('5/2 with %s rounds to %s', (mode, expected) => {
    expect(divideRounded(5n, 2n, mode)).toBe(expected);
  });

  it('applies banker’s rounding symmetrically', () => {
    // HALF_EVEN pulls toward the even neighbour: 2.5 to 2, 3.5 to 4.
    expect(divideRounded(5n, 2n, 'HALF_EVEN')).toBe(2n);
    expect(divideRounded(7n, 2n, 'HALF_EVEN')).toBe(4n);
  });

  it('handles negatives per mode, not per accident', () => {
    expect(divideRounded(-5n, 2n, 'FLOOR')).toBe(-3n);
    expect(divideRounded(-5n, 2n, 'CEILING')).toBe(-2n);
    expect(divideRounded(-5n, 2n, 'HALF_UP')).toBe(-3n);
    expect(divideRounded(-5n, 2n, 'DOWN')).toBe(-2n);
    expect(divideRounded(-5n, 2n, 'UP')).toBe(-3n);
  });

  it('is exact when the division is exact, in every mode', () => {
    for (const mode of ['HALF_UP', 'HALF_EVEN', 'UP', 'DOWN', 'CEILING', 'FLOOR'] as const) {
      expect(divideRounded(100n, 4n, mode)).toBe(25n);
      expect(divideRounded(-100n, 4n, mode)).toBe(-25n);
    }
  });

  it('refuses division by zero', () => {
    expect(() => divideRounded(1n, 0n, 'HALF_UP')).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// 5. Rate application.
// ---------------------------------------------------------------------------

describe('golden vectors: applying a rate', () => {
  it('applies 12.75% to 1,000,000 COP exactly', () => {
    // 1,000,000.00 COP = 100,000,000 centavos. 12.75% = 1275/10000.
    // 100,000,000 * 1275 / 10000 = 12,750,000 centavos = 127,500.00 COP.
    const principal = Money.fromDecimalString('1000000.00', 'COP');
    const interest = principal.multiplyByRatio(1275n, 10_000n, 'HALF_EVEN');
    expect(interest.toDecimalString()).toBe('127500.00');
  });

  it('rounds a non-terminating rate exactly once, where asked', () => {
    // 100.00 USD at 1/3 = 33.3333... -> 33.33
    const amount = Money.fromDecimalString('100.00', 'USD');
    expect(amount.multiplyByRatio(1n, 3n, 'HALF_UP').toDecimalString()).toBe('33.33');
    expect(amount.multiplyByRatio(2n, 3n, 'HALF_UP').toDecimalString()).toBe('66.67');
    expect(amount.multiplyByRatio(2n, 3n, 'DOWN').toDecimalString()).toBe('66.66');
  });

  it('requires an integer for multiplyByInteger so rounding is never implicit', () => {
    const amount = Money.fromDecimalString('100.00', 'USD');
    expect(() => amount.multiplyByInteger(1.5)).toThrow(TypeError);
    expect(amount.multiplyByInteger(3).toDecimalString()).toBe('300.00');
  });

  it('refuses a zero denominator', () => {
    const amount = Money.fromDecimalString('100.00', 'USD');
    expect(() => amount.multiplyByRatio(1n, 0n, 'HALF_UP')).toThrow(RangeError);
    expect(() => amount.divideByInteger(0, 'HALF_UP')).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// 6. Allocation — the invariant that protects against lost centavos.
// ---------------------------------------------------------------------------

describe('allocation conserves the total', () => {
  it('splits 100 into three parts without losing a cent', () => {
    // The naive answer is 33.33 x 3 = 99.99, silently destroying one cent.
    const parts = Money.fromDecimalString('100.00', 'USD').split(3);
    expect(parts.map((p) => p.toDecimalString())).toEqual(['33.34', '33.33', '33.33']);
    expect(sumMoney(parts, 'USD').toDecimalString()).toBe('100.00');
  });

  it('allocates by weight and still conserves the total', () => {
    // A 70/30 split of 0.05 cannot be done proportionally without a remainder rule.
    const parts = Money.fromDecimalString('0.05', 'USD').allocate([70, 30]);
    expect(sumMoney(parts, 'USD').minorUnits).toBe(5n);
    expect(parts.map((p) => p.minorUnits)).toEqual([4n, 1n]);
  });

  it('conserves the total for negative amounts too', () => {
    const parts = Money.fromDecimalString('-100.00', 'USD').split(3);
    expect(sumMoney(parts, 'USD').toDecimalString()).toBe('-100.00');
  });

  it('is deterministic: the same input always produces the same split', () => {
    const source = Money.fromDecimalString('1000.01', 'COP');
    const first = source.allocate([1, 1, 1, 1, 1, 1, 1]);
    const second = source.allocate([1, 1, 1, 1, 1, 1, 1]);
    expect(first.map((m) => m.minorUnits)).toEqual(second.map((m) => m.minorUnits));
  });

  it('rejects degenerate weights instead of producing nonsense', () => {
    const money = Money.fromDecimalString('10.00', 'USD');
    expect(() => money.allocate([])).toThrow(RangeError);
    expect(() => money.allocate([0, 0])).toThrow(RangeError);
    expect(() => money.allocate([-1, 2])).toThrow(RangeError);
    expect(() => money.split(0)).toThrow(RangeError);
    expect(() => money.split(1.5)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// 7. Property-based invariants — README §15.
//
// Deterministic pseudo-random generation: a seeded LCG, so a failure is reproducible
// from the seed alone. A financial test suite that cannot reproduce its own failure
// is not evidence of anything.
// ---------------------------------------------------------------------------

function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

describe('invariants (property-based, seeded)', () => {
  const SEED = 20_260_917;
  const ITERATIONS = 2_000;

  it('allocate never creates or destroys a minor unit', () => {
    const random = makeRandom(SEED);
    for (let i = 0; i < ITERATIONS; i += 1) {
      const minor = BigInt(Math.floor((random() - 0.5) * 2_000_000));
      const partCount = 1 + Math.floor(random() * 9);
      const drawn = Array.from({ length: partCount }, () => Math.floor(random() * 100));
      // An all-zero draw is a legitimate random outcome but not a legitimate input:
      // allocate rejects a zero total weight. Substitute a single unit weight rather
      // than mutating `drawn`, which `every` would have narrowed to `0[]`.
      const weights = drawn.some((w) => w !== 0)
        ? drawn
        : drawn.map((_, index) => (index === 0 ? 1 : 0));

      const money = Money.fromMinorUnits(minor, 'COP');
      const parts = money.allocate(weights);

      const recombined = parts.reduce((sum, p) => sum + p.minorUnits, 0n);
      expect(recombined, `seed=${SEED} i=${i} minor=${minor} weights=${weights.join(',')}`).toBe(
        minor,
      );
      expect(parts).toHaveLength(partCount);
    }
  });

  it('add and subtract are exact inverses', () => {
    const random = makeRandom(SEED + 1);
    for (let i = 0; i < ITERATIONS; i += 1) {
      const a = Money.fromMinorUnits(BigInt(Math.floor((random() - 0.5) * 1e9)), 'USD');
      const b = Money.fromMinorUnits(BigInt(Math.floor((random() - 0.5) * 1e9)), 'USD');
      expect(a.add(b).subtract(b).equals(a)).toBe(true);
    }
  });

  it('addition is commutative and associative', () => {
    const random = makeRandom(SEED + 2);
    for (let i = 0; i < 500; i += 1) {
      const pick = (): Money =>
        Money.fromMinorUnits(BigInt(Math.floor((random() - 0.5) * 1e9)), 'USD');
      const [a, b, c] = [pick(), pick(), pick()];
      expect(a.add(b).equals(b.add(a))).toBe(true);
      expect(
        a
          .add(b)
          .add(c)
          .equals(a.add(b.add(c))),
      ).toBe(true);
    }
  });

  it('decimal string round-trips without loss', () => {
    const random = makeRandom(SEED + 3);
    for (let i = 0; i < ITERATIONS; i += 1) {
      const minor = BigInt(Math.floor((random() - 0.5) * 1e12));
      const money = Money.fromMinorUnits(minor, 'COP');
      const reparsed = Money.fromDecimalString(money.toDecimalString(), 'COP');
      expect(reparsed.minorUnits, `seed=${SEED + 3} i=${i} minor=${minor}`).toBe(minor);
    }
  });

  it('negate is an involution and preserves magnitude', () => {
    const random = makeRandom(SEED + 4);
    for (let i = 0; i < 500; i += 1) {
      const money = Money.fromMinorUnits(BigInt(Math.floor((random() - 0.5) * 1e9)), 'USD');
      expect(money.negate().negate().equals(money)).toBe(true);
      expect(money.negate().absolute().equals(money.absolute())).toBe(true);
    }
  });

  it('DOWN never rounds away from zero and UP never rounds toward it', () => {
    const random = makeRandom(SEED + 5);
    for (let i = 0; i < ITERATIONS; i += 1) {
      const dividend = BigInt(Math.floor((random() - 0.5) * 1e9));
      const divisor = BigInt(1 + Math.floor(random() * 1000));

      const down = divideRounded(dividend, divisor, 'DOWN');
      const up = divideRounded(dividend, divisor, 'UP');
      const absDown = down < 0n ? -down : down;
      const absUp = up < 0n ? -up : up;

      expect(absDown <= absUp).toBe(true);
      // DOWN truncates toward zero, which is exactly bigint division.
      expect(down).toBe(dividend / divisor);
    }
  });
});

// ---------------------------------------------------------------------------
// 8. Immutability.
// ---------------------------------------------------------------------------

describe('Money is immutable', () => {
  it('never mutates the receiver', () => {
    const original = Money.fromDecimalString('100.00', 'USD');
    original.add(Money.fromDecimalString('50.00', 'USD'));
    original.multiplyByInteger(10);
    original.allocate([1, 1, 1]);
    expect(original.toDecimalString()).toBe('100.00');
  });

  it('is frozen', () => {
    const money = Money.fromDecimalString('100.00', 'USD');
    expect(Object.isFrozen(money)).toBe(true);
  });
});
