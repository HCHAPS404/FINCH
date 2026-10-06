/**
 * Finance schema — personal financial data entered directly by the user (debts,
 * cards). README §8.6 tenant-owned shape, Constitution §11 provenance columns.
 *
 * Money is `bigint` minor units, never float (ADR-0016, `finch/no-float-money`).
 * Interest rates are basis points (integer), not a float percentage, for the same
 * reason.
 */
import { pgSchema, text, timestamp, bigint, integer, date, char } from 'drizzle-orm/pg-core';
import { workspaces, parties, principals } from './identity.js';

export const finance = pgSchema('finance');

export const debts = finance.table('debts', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id')
    .notNull()
    .references(() => workspaces.id),
  partyId: text('party_id').references(() => parties.id),
  createdByPrincipalId: text('created_by_principal_id')
    .notNull()
    .references(() => principals.id),
  name: text('name').notNull(),
  creditor: text('creditor').notNull(),
  principalAmountMinor: bigint('principal_amount_minor', { mode: 'bigint' }).notNull(),
  currency: char('currency', { length: 3 }).notNull(),
  interestRateBps: integer('interest_rate_bps'),
  dueDate: date('due_date'),
  status: text('status').notNull().default('ACTIVE'),
  truthClass: text('truth_class').notNull().default('USER_ASSERTED'),
  sourceType: text('source_type').notNull().default('USER_INPUT'),
  observedAt: timestamp('observed_at', { withTimezone: true }).notNull().defaultNow(),
  effectiveAt: timestamp('effective_at', { withTimezone: true }).notNull().defaultNow(),
  ingestedAt: timestamp('ingested_at', { withTimezone: true }).notNull().defaultNow(),
  schemaVersion: integer('schema_version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Only `last_four` is ever stored — never a full card number (the one hard security
 * line in this table). This is a user-asserted record of a card the user already
 * holds, not a payment instrument this system can charge.
 */
export const cards = finance.table('cards', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id')
    .notNull()
    .references(() => workspaces.id),
  partyId: text('party_id').references(() => parties.id),
  createdByPrincipalId: text('created_by_principal_id')
    .notNull()
    .references(() => principals.id),
  issuer: text('issuer').notNull(),
  network: text('network'),
  lastFour: char('last_four', { length: 4 }).notNull(),
  creditLimitMinor: bigint('credit_limit_minor', { mode: 'bigint' }),
  currency: char('currency', { length: 3 }).notNull(),
  cutDay: integer('cut_day'),
  paymentDueDay: integer('payment_due_day'),
  truthClass: text('truth_class').notNull().default('USER_ASSERTED'),
  sourceType: text('source_type').notNull().default('USER_INPUT'),
  observedAt: timestamp('observed_at', { withTimezone: true }).notNull().defaultNow(),
  effectiveAt: timestamp('effective_at', { withTimezone: true }).notNull().defaultNow(),
  ingestedAt: timestamp('ingested_at', { withTimezone: true }).notNull().defaultNow(),
  schemaVersion: integer('schema_version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
