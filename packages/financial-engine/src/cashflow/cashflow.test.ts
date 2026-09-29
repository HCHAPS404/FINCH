/**
 * cashflow.forecast_30d@1 and cashflow.safe_to_spend@1 — golden vectors (independent
 * Python reference using `datetime`) and invariants. colombia-credit.md §7–§8.
 */
import type { TruthClass } from '@finch/contracts';
import { describe, expect, it } from 'vitest';

import { loadVectors } from '../../test/load-vectors.js';
import { FinancialInputError } from '../errors.js';
import { getFormula } from '../formula-registry.js';
import { Money } from '../money.js';
import { isoWeekday, toDayNumber, toIsoDate } from './civil-date.js';
import {
  conservativeIncome,
  forecast30d,
  type CashflowEvent,
  type DateShift,
  type ForecastInput,
} from './forecast.js';
import './formulas.js';
import { safeToSpend } from './safe-to-spend.js';

interface EventInput {
  id: string;
  kind: 'INCOME' | 'OBLIGATION';
  date: string;
  shift: DateShift;
  amount?: string;
  truth?: TruthClass;
  history?: string[];
}

interface Inputs {
  today: string;
  currency: string;
  startingBalance: string;
  buffer: string;
  weekend: number[];
  holidays: string[];
  events: EventInput[];
}

function toInput(v: Inputs): ForecastInput {
  const money = (value: string): Money => Money.fromMinorUnits(BigInt(value), v.currency);
  return {
    today: v.today,
    startingBalance: money(v.startingBalance),
    startingBalanceTruth: 'OBSERVED',
    buffer: money(v.buffer),
    calendar: { weekend: v.weekend, holidays: v.holidays },
    events: v.events.map((e): CashflowEvent => {
      const base = { id: e.id, date: e.date, shift: e.shift };
      if (e.history !== undefined)
        return { ...base, kind: 'INCOME', history: e.history.map(money) };
      return {
        ...base,
        kind: e.kind,
        amount: money(e.amount ?? ''),
        truthClass: e.truth ?? 'OBSERVED',
      };
    }),
  };
}

const forecastFile = loadVectors<
  Inputs,
  {
    series: { date: string; balance: string }[];
    firstDeficit: { date: string; shortfall: string } | 'none';
    minimum: { date: string; balance: string };
    truthClass: string;
  }
>('cashflow.forecast_30d@1.json');

const stsFile = loadVectors<
  Inputs,
  { safeToSpend: string; windowEnd: string; nextIncomeKnown: string; truthClass: string }
>('cashflow.safe_to_spend@1.json');

describe('cashflow.forecast_30d@1 golden vectors', () => {
  for (const vector of forecastFile.vectors) {
    it(vector.description, () => {
      const r = forecast30d(toInput(vector.inputs));
      expect(
        r.series.map((p) => ({ date: p.date, balance: p.balance.minorUnits.toString() })),
      ).toEqual(vector.expected.series);
      expect(
        r.firstDeficit === null
          ? 'none'
          : {
              date: r.firstDeficit.date,
              shortfall: r.firstDeficit.shortfall.minorUnits.toString(),
            },
      ).toEqual(vector.expected.firstDeficit);
      expect({ date: r.minimum.date, balance: r.minimum.balance.minorUnits.toString() }).toEqual(
        vector.expected.minimum,
      );
      expect(r.truthClass).toBe(vector.expected.truthClass);
    });
  }
});

describe('cashflow.safe_to_spend@1 golden vectors', () => {
  for (const vector of stsFile.vectors) {
    it(vector.description, () => {
      const r = safeToSpend(toInput(vector.inputs));
      expect(r.safeToSpend.minorUnits.toString()).toBe(vector.expected.safeToSpend);
      expect(r.windowEnd).toBe(vector.expected.windowEnd);
      expect(String(r.nextIncomeKnown)).toBe(vector.expected.nextIncomeKnown);
      expect(r.truthClass).toBe(vector.expected.truthClass);
    });
  }
});

describe('civil dates', () => {
  it('round-trips every day across four centuries boundaries', () => {
    for (let day = toDayNumber('1899-12-25'); day <= toDayNumber('1900-03-05'); day += 1) {
      expect(toDayNumber(toIsoDate(day))).toBe(day);
    }
    for (let day = toDayNumber('1999-12-25'); day <= toDayNumber('2000-03-05'); day += 1) {
      expect(toDayNumber(toIsoDate(day))).toBe(day);
    }
  });

  it('knows fixed reference points', () => {
    expect(toDayNumber('1970-01-01')).toBe(0);
    expect(toIsoDate(-1)).toBe('1969-12-31');
    expect(toIsoDate(toDayNumber('2028-02-28') + 1)).toBe('2028-02-29');
    expect(isoWeekday(toDayNumber('2026-10-15'))).toBe(4); // a Thursday
    expect(isoWeekday(toDayNumber('1969-12-28'))).toBe(7); // a Sunday
  });

  it.each(['2026-02-29', '2026-00-10', '2026-04-31', '26-10-15', '2026-10-15T00:00'])(
    'rejects %j',
    (text) => {
      expect(() => toDayNumber(text)).toThrow(FinancialInputError);
    },
  );
});

describe('cashflow invariants', () => {
  const cop = (value: bigint): Money => Money.fromMinorUnits(value, 'COP');
  const base: ForecastInput = {
    today: '2026-10-15',
    startingBalance: cop(100_000_000n),
    startingBalanceTruth: 'OBSERVED',
    buffer: cop(10_000_000n),
    calendar: { weekend: [6, 7], holidays: [] },
    events: [
      {
        id: 'rent',
        kind: 'OBLIGATION',
        date: '2026-10-20',
        amount: cop(60_000_000n),
        truthClass: 'OBSERVED',
      },
      {
        id: 'pay',
        kind: 'INCOME',
        date: '2026-10-30',
        amount: cop(200_000_000n),
        truthClass: 'OBSERVED',
      },
    ],
  };

  it('the last balance equals the start plus every in-horizon event', () => {
    const r = forecast30d(base);
    expect(r.series).toHaveLength(31);
    expect(r.series.at(-1)?.balance.minorUnits).toBe(240_000_000n);
  });

  it('events outside the horizon are ignored', () => {
    const r = forecast30d({
      ...base,
      events: [
        {
          id: 'past',
          kind: 'OBLIGATION',
          date: '2026-10-14',
          amount: cop(1n),
          truthClass: 'OBSERVED',
        },
        {
          id: 'late',
          kind: 'OBLIGATION',
          date: '2026-11-15',
          amount: cop(1n),
          truthClass: 'OBSERVED',
        },
      ],
    });
    expect(r.series.every((p) => p.balance.minorUnits === 100_000_000n)).toBe(true);
  });

  it('safe to spend never exceeds today’s balance minus the buffer, and is never negative', () => {
    for (const start of [0n, 5_000_000n, 70_000_000n, 500_000_000n]) {
      const r = safeToSpend({ ...base, startingBalance: cop(start) });
      expect(r.safeToSpend.minorUnits >= 0n).toBe(true);
      expect(r.safeToSpend.minorUnits <= (start > 10_000_000n ? start - 10_000_000n : 0n)).toBe(
        true,
      );
    }
  });

  it('a larger buffer never raises safe to spend', () => {
    const small = safeToSpend(base).safeToSpend.minorUnits;
    const large = safeToSpend({ ...base, buffer: cop(30_000_000n) }).safeToSpend.minorUnits;
    expect(large <= small).toBe(true);
  });

  it('nearest-rank 25th percentile picks an observed amount', () => {
    expect(conservativeIncome([cop(30n), cop(10n), cop(20n)]).minorUnits).toBe(10n);
    expect(conservativeIncome([cop(40n), cop(10n), cop(30n), cop(20n), cop(50n)]).minorUnits).toBe(
      20n,
    );
    expect(() => conservativeIncome([cop(1n), cop(2n)])).toThrow(FinancialInputError);
  });

  it('refuses model-generated inputs, negative amounts and a calendar without business days', () => {
    expect(() => forecast30d({ ...base, startingBalanceTruth: 'GENERATED_NARRATIVE' })).toThrow(
      FinancialInputError,
    );
    expect(() =>
      forecast30d({
        ...base,
        events: [
          {
            id: 'x',
            kind: 'OBLIGATION',
            date: '2026-10-20',
            amount: cop(-1n),
            truthClass: 'OBSERVED',
          },
        ],
      }),
    ).toThrow(FinancialInputError);
    expect(() =>
      forecast30d({ ...base, calendar: { weekend: [1, 2, 3, 4, 5, 6, 7], holidays: [] } }),
    ).toThrow(FinancialInputError);
  });
});

describe('cash-flow registry entries', () => {
  function parse(v: Readonly<Record<string, string>>): ForecastInput {
    const cop = (value: string): Money => Money.fromMinorUnits(BigInt(value), 'COP');
    const { today = '', startingBalance = '', buffer = '', events = '' } = v;
    return {
      today,
      startingBalance: cop(startingBalance),
      startingBalanceTruth: 'OBSERVED',
      buffer: cop(buffer),
      calendar: { weekend: [6, 7], holidays: [] },
      events: events.split(';').map((entry): CashflowEvent => {
        const [id = '', kind = '', date = '', amount = ''] = entry.split(':');
        expect(kind === 'INCOME' || kind === 'OBLIGATION').toBe(true);
        return {
          id,
          kind: kind === 'INCOME' ? 'INCOME' : 'OBLIGATION',
          date,
          amount: cop(amount),
          truthClass: 'OBSERVED',
        };
      }),
    };
  }

  it('cashflow.forecast_30d@1 vectors reproduce', () => {
    for (const v of getFormula('cashflow.forecast_30d', 1).testVectors) {
      const deficit = forecast30d(parse(v.inputs)).firstDeficit;
      expect(
        deficit === null ? 'none' : `${deficit.date}:${deficit.shortfall.minorUnits.toString()}`,
        v.description,
      ).toBe(v.expected);
    }
  });

  it('cashflow.safe_to_spend@1 vectors reproduce', () => {
    for (const v of getFormula('cashflow.safe_to_spend', 1).testVectors) {
      expect(safeToSpend(parse(v.inputs)).safeToSpend.minorUnits.toString(), v.description).toBe(
        v.expected,
      );
    }
  });
});
