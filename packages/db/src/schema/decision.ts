/**
 * Decisions — calculation receipts, Decision Cards and user-controlled memory.
 * README §16, §17; docs/hackathon/04 §3, §6.
 */
import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgSchema,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { createdAt, id, truthClass } from './columns.js';
import { workspaces } from './identity.js';

export const decision = pgSchema('decision');

export const decisionCardStatus = decision.enum('decision_card_status', [
  'OPEN',
  'DISMISSED',
  'ACTED',
  'SUPERSEDED',
]);
export const memoryKind = decision.enum('memory_kind', [
  'GOAL',
  'PREFERENCE',
  'CONTEXT',
  'CONSTRAINT',
]);

const workspaceRef = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: 'restrict' });

/**
 * CalcReceipt — every figure shown to a user (docs/hackathon/04 §3). Immutable via
 * trigger: a receipt is evidence and is never edited.
 */
export const calcReceipts = decision.table(
  'calc_receipts',
  {
    id: id(),
    workspaceId: workspaceRef(),
    skill: text().notNull(),
    formulaId: text().notNull(),
    formulaVersion: integer().notNull(),
    engineVersion: text().notNull(),
    /** Inputs with their provenance; amounts as strings of minor units, never floats. */
    inputs: jsonb().notNull(),
    inputsHash: text().notNull(),
    outputs: jsonb().notNull(),
    truthClass: truthClass().notNull(),
    computedAt: createdAt(),
  },
  (t) => [
    index('calc_receipts_workspace_time').on(t.workspaceId, t.computedAt),
    check('calc_receipts_formula_version_positive', sql`${t.formulaVersion} > 0`),
    check('calc_receipts_inputs_hash_hex', sql`${t.inputsHash} ~ '^[0-9a-f]{64}$'`),
    // A receipt is either deterministic or estimated; model narrative never is one.
    check(
      'calc_receipts_truth_class',
      sql`${t.truthClass} IN ('DERIVED_DETERMINISTIC', 'ESTIMATED')`,
    ),
  ],
);

/** Persisted as structure, not prose (README §17). */
export const decisionCards = decision.table(
  'decision_cards',
  {
    id: id(),
    workspaceId: workspaceRef(),
    kind: text().notNull(),
    status: decisionCardStatus().notNull().default('OPEN'),
    priority: smallint().notNull(),
    payload: jsonb().notNull(),
    receiptIds: uuid().array().notNull(),
    secondOpinion: jsonb(),
    supersededById: uuid(),
    createdAt: createdAt(),
    resolvedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index('decision_cards_workspace_status').on(t.workspaceId, t.status),
    check('decision_cards_priority', sql`${t.priority} BETWEEN 1 AND 5`),
  ],
);

/**
 * Semantic memory (A7). Written only on explicit request; "forget" sets forgottenAt and
 * a purge job deletes within 24 h. The embedding column arrives with S2-07 (pgvector),
 * once the hosting topology (S0-06) confirms the extension is available.
 */
export const memories = decision.table(
  'memories',
  {
    id: id(),
    workspaceId: workspaceRef(),
    kind: memoryKind().notNull(),
    text: text().notNull(),
    sourceMessageId: text(),
    createdAt: createdAt(),
    forgottenAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index('memories_active')
      .on(t.workspaceId)
      .where(sql`${t.forgottenAt} IS NULL`),
    check('memories_text_length', sql`char_length(${t.text}) BETWEEN 1 AND 2000`),
  ],
);
