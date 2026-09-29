/**
 * Transactional outbox — README §21.1. Rows are written in the same transaction as the
 * state change they describe; the worker publishes and stamps `publishedAt`.
 */
import { sql } from 'drizzle-orm';
import { index, integer, jsonb, pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { createdAt, id } from './columns.js';
import { workspaces } from './identity.js';

export const integration = pgSchema('integration');

export const outboxEvents = integration.table(
  'outbox_events',
  {
    id: id(),
    eventType: text().notNull(),
    eventVersion: integer().notNull(),
    workspaceId: uuid().references(() => workspaces.id, { onDelete: 'restrict' }),
    aggregateType: text().notNull(),
    aggregateId: text().notNull(),
    producer: text().notNull(),
    correlationId: text().notNull(),
    causationId: text(),
    payload: jsonb().notNull(),
    occurredAt: createdAt(),
    publishedAt: timestamp({ withTimezone: true }),
    attempts: integer().notNull().default(0),
  },
  (t) => [
    index('outbox_events_unpublished')
      .on(t.occurredAt)
      .where(sql`${t.publishedAt} IS NULL`),
  ],
);
