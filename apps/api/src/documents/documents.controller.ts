/**
 * Document upload/list/delete — RAW zone only (Constitution §12), ADR-0041.
 *
 * Upload is real `multipart/form-data` (`@fastify/multipart`, registered in
 * `main.ts`) — the file part's own `filename`/`mimetype` are used directly, no
 * separate JSON fields duplicate them. An earlier pass accepted JSON+base64 instead,
 * named at the time as a deliberate scope limit; this replaces it without touching
 * `DocumentStoragePort` or its adapter, exactly as that note predicted.
 *
 * No malware scan, OCR or classification (§29's full pipeline is not implemented) —
 * `status` is `'RAW'` for every row this controller writes.
 */
import { Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import type { FastifyRequest } from 'fastify';
import type { Database } from '@finch/db';
import { schema } from '@finch/db';
import { systemClock } from '@finch/domain';
import { DATABASE } from '../infrastructure/db/db.tokens.js';
import { AuthGuard } from '../infrastructure/auth/auth.guard.js';
import { CurrentPrincipal } from '../infrastructure/auth/principal.decorator.js';
import { AuthorizationGuard } from '../infrastructure/authorization/authorization.guard.js';
import { RequireCapability } from '../infrastructure/authorization/require-capability.decorator.js';
import { FinchHttpException } from '../common/errors/finch-http-exception.js';
import { firstOrThrow } from '../common/first-or-throw.js';
import { systemIdGenerator } from '../infrastructure/security/id-generator.adapter.js';
import {
  DOCUMENT_STORAGE_PORT,
  type DocumentStoragePort,
} from '../infrastructure/documents/document-storage.port.js';

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);
/** Kept in lockstep with the `@fastify/multipart` registration in `main.ts`. */
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB.

type DocumentRow = typeof schema.documentRows.$inferSelect;
interface DocumentResponse extends Omit<DocumentRow, 'sizeBytes'> {
  readonly sizeBytes: string;
}

function toResponse(row: DocumentRow): DocumentResponse {
  return { ...row, sizeBytes: row.sizeBytes.toString() };
}

@Controller('workspaces/:workspaceId/documents')
@UseGuards(AuthGuard, AuthorizationGuard)
export class DocumentsController {
  private readonly idGenerator = systemIdGenerator();

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(DOCUMENT_STORAGE_PORT) private readonly storage: DocumentStoragePort,
  ) {}

  @Get()
  @RequireCapability('documents.read')
  async list(@Param('workspaceId') workspaceId: string): Promise<DocumentResponse[]> {
    const rows = await this.db
      .select()
      .from(schema.documentRows)
      .where(eq(schema.documentRows.workspaceId, workspaceId));
    return rows.map(toResponse);
  }

  @Post()
  @RequireCapability('documents.write')
  async upload(
    @Param('workspaceId') workspaceId: string,
    @CurrentPrincipal() principalId: string,
    @Req() request: FastifyRequest,
  ): Promise<DocumentResponse> {
    const file = await request.file({ limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES } });
    if (file === undefined) {
      throw new FinchHttpException(
        'FINCH_VALIDATION_REQUEST_INVALID',
        'No file part found in the multipart request',
      );
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new FinchHttpException('FINCH_DOCUMENT_TYPE_NOT_ALLOWED', 'Unsupported file type');
    }

    const bytes = await file.toBuffer();
    if (bytes.length === 0 || file.file.truncated) {
      throw new FinchHttpException(
        'FINCH_DOCUMENT_TOO_LARGE',
        'File is empty or exceeds the size limit',
      );
    }

    const id = this.idGenerator.next('document');
    const storageKey = `${workspaceId}/${id}`;
    await this.storage.save(storageKey, bytes);

    const rows = await this.db
      .insert(schema.documentRows)
      .values({
        id,
        workspaceId,
        createdByPrincipalId: principalId,
        originalFilename: file.filename,
        mimeType: file.mimetype,
        sizeBytes: BigInt(bytes.length),
        sha256: createHash('sha256').update(bytes).digest('hex'),
        storageKey,
        uploadedAt: systemClock.now(),
      })
      .returning();
    return toResponse(firstOrThrow(rows));
  }

  @Delete(':id')
  @RequireCapability('documents.write')
  async remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ): Promise<{ readonly ok: true }> {
    const rows = await this.db
      .select()
      .from(schema.documentRows)
      .where(and(eq(schema.documentRows.workspaceId, workspaceId), eq(schema.documentRows.id, id)))
      .limit(1);
    const row = rows[0];
    if (row === undefined) {
      throw new FinchHttpException('FINCH_VALIDATION_NOT_FOUND', 'Document not found');
    }
    await this.storage.delete(row.storageKey);
    await this.db
      .delete(schema.documentRows)
      .where(and(eq(schema.documentRows.workspaceId, workspaceId), eq(schema.documentRows.id, id)));
    return { ok: true };
  }
}
