/**
 * Audit — README §14 (audit ≠ application log), ADR-0027; docs/hackathon/04 §9.
 *
 * Both tables are append-only: a trigger in the migrations rejects UPDATE and DELETE.
 * Neither stores prompt text, answers, documents or other personal content.
 */
import { sql } from 'drizzle-orm';
import { check, index, integer, jsonb, pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { id } from './columns.js';
import { principals, workspaces } from './identity.js';

export const audit = pgSchema('audit');

export const auditOutcome = audit.enum('audit_outcome', ['ALLOWED', 'DENIED', 'FAILED']);
export const aiCallOutcome = audit.enum('ai_call_outcome', ['OK', 'BLOCKED', 'FAILED']);
export const aiTier = audit.enum('ai_tier', ['FAST', 'AGENT', 'DEEP']);

export const auditEvents = audit.table(
  'audit_events',
  {
    id: id(),
    workspaceId: uuid().references(() => workspaces.id, { onDelete: 'restrict' }),
    actorPrincipalId: uuid().references(() => principals.id, { onDelete: 'restrict' }),
    action: text().notNull(),
    resourceType: text().notNull(),
    resourceId: text(),
    outcome: auditOutcome().notNull(),
    correlationId: text().notNull(),
    /** Identifiers and reason codes only — never balances, documents or free text. */
    metadata: jsonb()
      .notNull()
      .default(sql`'{}'::jsonb`),
    occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_events_workspace_time').on(t.workspaceId, t.occurredAt),
    index('audit_events_correlation').on(t.correlationId),
  ],
);

/** Mirrors `AiCallRecord` in @finch/ai-core. */
export const aiCalls = audit.table(
  'ai_calls',
  {
    id: id(),
    correlationId: text().notNull(),
    workspaceId: uuid().references(() => workspaces.id, { onDelete: 'restrict' }),
    tier: aiTier().notNull(),
    model: text(),
    promptId: text(),
    outcome: aiCallOutcome().notNull(),
    failure: text(),
    inputTokens: integer(),
    outputTokens: integer(),
    latencyMs: integer().notNull(),
    redactionsCount: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ai_calls_time').on(t.createdAt),
    index('ai_calls_correlation').on(t.correlationId),
    check(
      'ai_calls_counts_nonnegative',
      sql`${t.latencyMs} >= 0 AND ${t.redactionsCount} >= 0 AND coalesce(${t.inputTokens}, 0) >= 0 AND coalesce(${t.outputTokens}, 0) >= 0`,
    ),
  ],
);
