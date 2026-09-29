/**
 * Planning — goals, envelopes and immutable Financial Twin snapshots. README §13.
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  jsonb,
  pgSchema,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { createdAt, currency, id, minorUnits } from './columns.js';
import { workspaces } from './identity.js';

export const planning = pgSchema('planning');

export const envelopeKind = planning.enum('envelope_kind', [
  'ESSENTIAL',
  'DEBT',
  'SAVINGS',
  'INVESTMENT',
  'LEISURE',
  'OTHER',
]);

const workspaceRef = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: 'restrict' });

export const goals = planning.table(
  'goals',
  {
    id: id(),
    workspaceId: workspaceRef(),
    name: text().notNull(),
    targetMinor: minorUnits().notNull(),
    currency: currency().notNull(),
    targetDate: date(),
    priority: smallint().notNull(),
    shared: boolean().notNull().default(false),
    createdAt: createdAt(),
    archivedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index('goals_workspace').on(t.workspaceId),
    check('goals_target_positive', sql`${t.targetMinor} > 0`),
    check('goals_priority', sql`${t.priority} BETWEEN 1 AND 10`),
    check('goals_currency_iso', sql`${t.currency} ~ '^[A-Z]{3}$'`),
  ],
);

/** One envelope per name per budget cycle (B2). Allocations come from budget.allocate. */
export const envelopes = planning.table(
  'envelopes',
  {
    id: id(),
    workspaceId: workspaceRef(),
    name: text().notNull(),
    kind: envelopeKind().notNull(),
    cycleStart: date().notNull(),
    allocatedMinor: minorUnits().notNull(),
    currency: currency().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('envelopes_workspace_cycle_name').on(t.workspaceId, t.cycleStart, t.name),
    check('envelopes_allocated_nonnegative', sql`${t.allocatedMinor} >= 0`),
    check('envelopes_currency_iso', sql`${t.currency} ~ '^[A-Z]{3}$'`),
  ],
);

/**
 * Immutable Financial Twin snapshots (README §13). A trigger in the migrations rejects
 * UPDATE and DELETE: a simulation must always be able to cite the exact state it used.
 */
export const financialSnapshots = planning.table(
  'financial_snapshots',
  {
    id: id(),
    workspaceId: workspaceRef(),
    generatedAt: createdAt(),
    /** SHA-256 of the canonical payload; verified by the domain on read. */
    checksum: text().notNull(),
    payload: jsonb().notNull(),
    ruleVersions: jsonb().notNull(),
  },
  (t) => [
    index('financial_snapshots_workspace_time').on(t.workspaceId, t.generatedAt),
    check('financial_snapshots_checksum_hex', sql`${t.checksum} ~ '^[0-9a-f]{64}$'`),
  ],
);
