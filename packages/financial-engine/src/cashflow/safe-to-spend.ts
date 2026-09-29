/**
 * cashflow.safe_to_spend@1 — what can be spent today without breaking the buffer
 * before the next income. Spec: docs/financial-formulas/colombia-credit.md §8.
 *
 *   STS = max(0, min_{d ∈ [today, next_income]} projected_balance_d − buffer)
 *
 * `next_income` is the first day after today with an income event in the forecast.
 * Without a known next income inside the 30-day horizon, the whole horizon is used and
 * `nextIncomeKnown` is false, so the UI can say the figure is bounded by the horizon.
 * Conservative by design: money needed before payday cannot be spent today.
 */
import { Money } from '../money.js';
import { FORECAST_HORIZON_DAYS, forecast30d, type ForecastInput } from './forecast.js';

export interface SafeToSpendResult {
  readonly formula: { readonly formulaId: 'cashflow.safe_to_spend'; readonly version: 1 };
  readonly safeToSpend: Money;
  /** Last day of the window the minimum was taken over. */
  readonly windowEnd: string;
  readonly nextIncomeKnown: boolean;
  readonly truthClass: 'DERIVED_DETERMINISTIC' | 'ESTIMATED';
}

export function safeToSpend(input: ForecastInput): SafeToSpendResult {
  const projection = forecast30d(input);
  const today = projection.series[0]?.date ?? input.today;
  const nextIncome = projection.incomeDates.find((date) => date > today);
  const last = projection.series[FORECAST_HORIZON_DAYS]?.date ?? today;
  const windowEnd = nextIncome ?? last;

  let lowest: bigint | undefined;
  for (const point of projection.series) {
    if (point.date > windowEnd) break;
    if (lowest === undefined || point.balance.minorUnits < lowest)
      lowest = point.balance.minorUnits;
  }
  const headroom = (lowest ?? 0n) - input.buffer.minorUnits;

  return {
    formula: { formulaId: 'cashflow.safe_to_spend', version: 1 },
    safeToSpend: Money.fromMinorUnits(headroom > 0n ? headroom : 0n, input.buffer.currency.code),
    windowEnd,
    nextIncomeKnown: nextIncome !== undefined,
    truthClass: projection.truthClass,
  };
}
