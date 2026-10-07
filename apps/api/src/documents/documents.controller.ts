/**
 * Document upload/list/delete — RAW zone only (Constitution §12), ADR-0041.
 *
 * Upload is a JSON body with base64 content, not `multipart/form-data`: the Fastify
 * adapter this API runs on (`@nestjs/platform-fastify`) has no multipart parser wired
 * in, and adding one is a separate decision from proving the storage port and CRUD
 * work end to end. This is named here as a deliberate scope limit for this pass, not
 * silently assumed — swapping to multipart later changes only this controller's
 * request parsing, not `DocumentStoragePort` or its adapter.
 *
 * No malware scan, OCR or classification (§29's full pipeline is not implemented) —
 * `status` is `'RAW'` for every row this controller writes.
 */
import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
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
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB.

const uploadSchema = z.object({
  originalFilename: z.string().min(1),
  mimeType: z.string().min(1),
  contentBase64: z.string().min(1),
});

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
    @Body() body: unknown,
  ): Promise<DocumentResponse> {
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) {
      throw new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Invalid upload payload');
    }
    if (!ALLOWED_MIME_TYPES.has(parsed.data.mimeType)) {
      throw new FinchHttpException('FINCH_DOCUMENT_TYPE_NOT_ALLOWED', 'Unsupported file type');
    }

    const bytes = Buffer.from(parsed.data.contentBase64, 'base64');
    if (bytes.length === 0 || bytes.length > MAX_SIZE_BYTES) {
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
        originalFilename: parsed.data.originalFilename,
        mimeType: parsed.data.mimeType,
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
