/**
 * Documents — metadata only. README §29; docs/hackathon/08 E1, E2.
 *
 * File bytes live in encrypted object storage under `storageKey`; this table never holds
 * document content. Uploads start QUARANTINED and are only usable once ACCEPTED.
 */
import { sql } from 'drizzle-orm';
import { check, date, index, integer, pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { createdAt, id } from './columns.js';
import { principals, workspaces } from './identity.js';

export const documents = pgSchema('documents');

export const documentKind = documents.enum('document_kind', [
  'RECEIPT',
  'INVOICE',
  'STATEMENT',
  'POLICY',
  'CONTRACT',
  'SOAT',
  'WARRANTY',
  'CERTIFICATE',
  'OTHER',
]);
export const documentStatus = documents.enum('document_status', [
  'QUARANTINED',
  'ACCEPTED',
  'REJECTED',
  'DELETED',
]);

/** Upload allowlist (docs/hackathon/03 §6). */
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/csv',
] as const;

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const documentRecords = documents.table(
  'documents',
  {
    id: id(),
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    kind: documentKind().notNull(),
    status: documentStatus().notNull().default('QUARANTINED'),
    mimeType: text().notNull(),
    sizeBytes: integer().notNull(),
    sha256: text().notNull(),
    storageKey: text().notNull(),
    uploadedByPrincipalId: uuid()
      .notNull()
      .references(() => principals.id, { onDelete: 'restrict' }),
    expiresOn: date(),
    createdAt: createdAt(),
    deletedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index('documents_workspace').on(t.workspaceId),
    index('documents_expiry')
      .on(t.workspaceId, t.expiresOn)
      .where(sql`${t.expiresOn} IS NOT NULL`),
    check(
      'documents_mime_allowlist',
      sql.raw(`mime_type IN (${ALLOWED_DOCUMENT_MIME_TYPES.map((m) => `'${m}'`).join(', ')})`),
    ),
    check(
      'documents_size',
      sql`${t.sizeBytes} BETWEEN 1 AND ${sql.raw(String(MAX_DOCUMENT_BYTES))}`,
    ),
    check('documents_sha256_hex', sql`${t.sha256} ~ '^[0-9a-f]{64}$'`),
    check(
      'documents_deleted_consistent',
      sql`(${t.status} = 'DELETED') = (${t.deletedAt} IS NOT NULL)`,
    ),
  ],
);
