/**
 * Documents schema — RAW zone only (Constitution §12). No quarantine/scan/OCR status
 * states: the full Document Intelligence pipeline (§29) is not implemented, and
 * claiming otherwise in the schema would be dishonest. `status` is `'RAW'` until a
 * real scanner/classifier exists to move rows further through the pipeline.
 */
import { pgSchema, text, timestamp, bigint } from 'drizzle-orm/pg-core';
import { workspaces, parties, principals } from './identity.js';

export const documents = pgSchema('documents');

export const documentRows = documents.table('documents', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id')
    .notNull()
    .references(() => workspaces.id),
  partyId: text('party_id').references(() => parties.id),
  createdByPrincipalId: text('created_by_principal_id')
    .notNull()
    .references(() => principals.id),
  originalFilename: text('original_filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'bigint' }).notNull(),
  sha256: text('sha256').notNull(),
  storageKey: text('storage_key').notNull(),
  status: text('status').notNull().default('RAW'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});
