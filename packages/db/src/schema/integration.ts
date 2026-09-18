/**
 * Integration schema — README §21.1, §21.2, §24.2.
 *
 * The transactional outbox. A domain state change and its outbox row are written in
 * the SAME database transaction (README §21.1) — that invariant lives in how callers
 * use this table, not in the table definition itself, but the columns below mirror
 * `EventEnvelope`/`OutboxRecord` in `@finch/contracts` exactly so nothing is lost
 * translating between the two.
 */
import { pgSchema, text, integer, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

export const integration = pgSchema('integration');

export const outbox = integration.table('outbox', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Deduplication key — README §21.2. Consumers MUST treat a repeat as a no-op. */
  eventId: text('event_id').notNull().unique(),
  eventType: text('event_type').notNull(),
  eventVersion: integer('event_version').notNull(),
  workspaceId: text('workspace_id').notNull(),
  aggregateType: text('aggregate_type').notNull(),
  aggregateId: text('aggregate_id').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  producer: text('producer').notNull(),
  correlationId: text('correlation_id').notNull(),
  causationId: text('causation_id'),
  traceId: text('trace_id'),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
});
