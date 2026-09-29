/**
 * Canonical financial data — README §10, §11, §12.2.
 *
 * Every row carries its provenance (truth class, source type, source reference) so a
 * figure can always answer "where did this come from?" (Constitution §4.4).
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  numeric,
  pgSchema,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import {
  createdAt,
  currency,
  id,
  minorUnits,
  rateConvention,
  sourceType,
  truthClass,
} from './columns.js';
import { parties, workspaces } from './identity.js';

export const finance = pgSchema('finance');

export const accountKind = finance.enum('account_kind', [
  'CHECKING',
  'SAVINGS',
  'CASH',
  'CREDIT_CARD',
  'LOAN',
  'INVESTMENT',
]);
export const transactionStatus = finance.enum('transaction_status', [
  'PENDING',
  'POSTED',
  'REVERSED',
]);
export const cadence = finance.enum('cadence', [
  'WEEKLY',
  'BIWEEKLY',
  'SEMIMONTHLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
]);
export const incomeKind = finance.enum('income_kind', [
  'SALARY',
  'FEES',
  'RENT',
  'BUSINESS',
  'OTHER',
]);
export const insuranceBasis = finance.enum('insurance_basis', ['OUTSTANDING', 'ORIGINAL', 'FIXED']);

const workspaceRef = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: 'restrict' });

const provenance = () => ({
  truthClass: truthClass().notNull(),
  sourceType: sourceType().notNull(),
  sourceRef: text().notNull(),
  ingestedAt: createdAt(),
});

export const accounts = finance.table(
  'accounts',
  {
    id: id(),
    workspaceId: workspaceRef(),
    ownerPartyId: uuid().references(() => parties.id, { onDelete: 'restrict' }),
    kind: accountKind().notNull(),
    name: text().notNull(),
    institutionName: text(),
    currency: currency().notNull(),
    /** Last four digits at most. Full account numbers are never stored (README §53). */
    maskedNumber: text(),
    ...provenance(),
    closedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index('accounts_workspace').on(t.workspaceId),
    check('accounts_currency_iso', sql`${t.currency} ~ '^[A-Z]{3}$'`),
    check(
      'accounts_masked_last4',
      sql`${t.maskedNumber} IS NULL OR ${t.maskedNumber} ~ '^[0-9]{4}$'`,
    ),
  ],
);

export const balanceObservations = finance.table(
  'balance_observations',
  {
    id: id(),
    workspaceId: workspaceRef(),
    accountId: uuid()
      .notNull()
      .references(() => accounts.id, { onDelete: 'restrict' }),
    amountMinor: minorUnits().notNull(),
    currency: currency().notNull(),
    observedAt: timestamp({ withTimezone: true }).notNull(),
    ...provenance(),
  },
  (t) => [
    index('balance_observations_account_time').on(t.accountId, t.observedAt),
    index('balance_observations_workspace').on(t.workspaceId),
    check('balance_observations_currency_iso', sql`${t.currency} ~ '^[A-Z]{3}$'`),
  ],
);

export const transactions = finance.table(
  'transactions',
  {
    id: id(),
    workspaceId: workspaceRef(),
    accountId: uuid()
      .notNull()
      .references(() => accounts.id, { onDelete: 'restrict' }),
    /** Signed: negative is money leaving the account. */
    amountMinor: minorUnits().notNull(),
    currency: currency().notNull(),
    bookedOn: date().notNull(),
    description: text().notNull(),
    merchantNormalized: text(),
    category: text(),
    status: transactionStatus().notNull(),
    /** Deterministic key for deduplicating imports (docs/hackathon/08 E4). */
    dedupeKey: text().notNull(),
    ...provenance(),
  },
  (t) => [
    uniqueIndex('transactions_workspace_dedupe').on(t.workspaceId, t.dedupeKey),
    index('transactions_account_booked').on(t.accountId, t.bookedOn),
    check('transactions_currency_iso', sql`${t.currency} ~ '^[A-Z]{3}$'`),
  ],
);

/** Card terms. One row per CREDIT_CARD account. */
export const creditCards = finance.table(
  'credit_cards',
  {
    accountId: uuid()
      .primaryKey()
      .references(() => accounts.id, { onDelete: 'restrict' }),
    workspaceId: workspaceRef(),
    creditLimitMinor: minorUnits().notNull(),
    currency: currency().notNull(),
    cutoffDay: smallint().notNull(),
    paymentDay: smallint().notNull(),
    /** Agreed remunerative rate as quoted, e.g. 2.3 with convention MV. */
    rateValue: numeric({ precision: 12, scale: 6 }).notNull(),
    rateConvention: rateConvention().notNull(),
    handlingFeeMinor: minorUnits()
      .notNull()
      .default(sql`0`),
    ...provenance(),
  },
  (t) => [
    index('credit_cards_workspace').on(t.workspaceId),
    check(
      'credit_cards_days',
      sql`${t.cutoffDay} BETWEEN 1 AND 31 AND ${t.paymentDay} BETWEEN 1 AND 31`,
    ),
    check('credit_cards_limit_positive', sql`${t.creditLimitMinor} > 0`),
    check('credit_cards_currency_iso', sql`${t.currency} ~ '^[A-Z]{3}$'`),
  ],
);

/** Loan terms. One row per LOAN account. */
export const loans = finance.table(
  'loans',
  {
    accountId: uuid()
      .primaryKey()
      .references(() => accounts.id, { onDelete: 'restrict' }),
    workspaceId: workspaceRef(),
    principalMinor: minorUnits().notNull(),
    outstandingMinor: minorUnits().notNull(),
    instalmentMinor: minorUnits().notNull(),
    currency: currency().notNull(),
    rateValue: numeric({ precision: 12, scale: 6 }).notNull(),
    rateConvention: rateConvention().notNull(),
    termMonths: smallint().notNull(),
    remainingInstalments: smallint().notNull(),
    paymentDay: smallint().notNull(),
    insuranceBasis: insuranceBasis(),
    insuranceRateValue: numeric({ precision: 12, scale: 6 }),
    ...provenance(),
  },
  (t) => [
    index('loans_workspace').on(t.workspaceId),
    check(
      'loans_terms_consistent',
      sql`${t.termMonths} > 0 AND ${t.remainingInstalments} BETWEEN 0 AND ${t.termMonths}`,
    ),
    check(
      'loans_outstanding_bounded',
      sql`${t.outstandingMinor} BETWEEN 0 AND ${t.principalMinor}`,
    ),
    check('loans_payment_day', sql`${t.paymentDay} BETWEEN 1 AND 31`),
    check('loans_currency_iso', sql`${t.currency} ~ '^[A-Z]{3}$'`),
  ],
);

export const incomeStreams = finance.table(
  'income_streams',
  {
    id: id(),
    workspaceId: workspaceRef(),
    partyId: uuid().references(() => parties.id, { onDelete: 'restrict' }),
    name: text().notNull(),
    kind: incomeKind().notNull(),
    /** For variable income this is the conservative (p25) estimate, marked ESTIMATED. */
    amountMinor: minorUnits().notNull(),
    currency: currency().notNull(),
    cadence: cadence().notNull(),
    expectedDay: smallint(),
    variable: boolean().notNull().default(false),
    ...provenance(),
  },
  (t) => [
    index('income_streams_workspace').on(t.workspaceId),
    check('income_streams_positive', sql`${t.amountMinor} > 0`),
    check('income_streams_day', sql`${t.expectedDay} IS NULL OR ${t.expectedDay} BETWEEN 1 AND 31`),
    check('income_streams_currency_iso', sql`${t.currency} ~ '^[A-Z]{3}$'`),
  ],
);

export const obligations = finance.table(
  'obligations',
  {
    id: id(),
    workspaceId: workspaceRef(),
    name: text().notNull(),
    category: text().notNull(),
    amountMinor: minorUnits().notNull(),
    currency: currency().notNull(),
    cadence: cadence().notNull(),
    dueDay: smallint().notNull(),
    essential: boolean().notNull(),
    ...provenance(),
  },
  (t) => [
    index('obligations_workspace').on(t.workspaceId),
    check('obligations_positive', sql`${t.amountMinor} > 0`),
    check('obligations_due_day', sql`${t.dueDay} BETWEEN 1 AND 31`),
    check('obligations_currency_iso', sql`${t.currency} ~ '^[A-Z]{3}$'`),
  ],
);
