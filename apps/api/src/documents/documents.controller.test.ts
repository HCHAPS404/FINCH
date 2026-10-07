/**
 * `DocumentsController` tests — ADR-0041, Constitution §12 (RAW zone only). Real
 * Postgres (see `test-support/postgres-test-db.ts`) plus the real
 * `LocalDiskStorageAdapter` against a throwaway temp directory, so this exercises the
 * actual storage port wiring, not a stand-in for it. The multipart request itself is
 * faked at the `request.file()` boundary — `@fastify/multipart`'s own parsing is its
 * problem to test, not this controller's.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FastifyRequest } from 'fastify';
import { schema, type Database } from '@finch/db';
import { createTestDatabase, type TestDatabase } from '../test-support/postgres-test-db.js';
import { LocalDiskStorageAdapter } from '../infrastructure/documents/local-disk-storage.adapter.js';
import { DocumentsController } from './documents.controller.js';

let testDb: TestDatabase;
let db: Database;
let storageDir: string;
let storage: LocalDiskStorageAdapter;
const principalId = 'principal-documents-owner';
const workspaceId = 'workspace-documents-1';

beforeAll(async () => {
  testDb = await createTestDatabase();
  db = testDb.db;
  await db.insert(schema.principals).values({ id: principalId, type: 'HUMAN' });
  await db.insert(schema.workspaces).values({ id: workspaceId, type: 'PERSONAL' });
  storageDir = await mkdtemp(join(tmpdir(), 'finch-documents-test-'));
  storage = new LocalDiskStorageAdapter(storageDir);
}, 120_000);

afterAll(async () => {
  await testDb.teardown();
  await rm(storageDir, { recursive: true, force: true });
});

interface FakeFileOptions {
  readonly filename?: string;
  readonly mimetype?: string;
  readonly content?: string;
  readonly truncated?: boolean;
  readonly noFile?: boolean;
}

function fakeMultipartRequest(options: FakeFileOptions = {}): FastifyRequest {
  const {
    filename = 'cedula.pdf',
    mimetype = 'application/pdf',
    content = 'hello finch',
  } = options;
  const file =
    options.noFile === true
      ? undefined
      : {
          filename,
          mimetype,
          toBuffer: () => Promise.resolve(Buffer.from(content)),
          file: { truncated: options.truncated ?? false },
        };
  return { file: () => Promise.resolve(file) } as unknown as FastifyRequest;
}

describe('DocumentsController', () => {
  it('uploads a document, persisting the bytes on disk and metadata in RAW status', async () => {
    const controller = new DocumentsController(db, storage);

    const created = await controller.upload(workspaceId, principalId, fakeMultipartRequest());

    expect(created.status).toBe('RAW');
    expect(created.sizeBytes).toBe(String(Buffer.byteLength('hello finch')));
    const stored = await readFile(join(storageDir, created.storageKey));
    expect(stored.toString()).toBe('hello finch');
  });

  it('rejects a request with no file part', async () => {
    const controller = new DocumentsController(db, storage);

    await expect(
      controller.upload(workspaceId, principalId, fakeMultipartRequest({ noFile: true })),
    ).rejects.toMatchObject({ code: 'FINCH_VALIDATION_REQUEST_INVALID' });
  });

  it('rejects a disallowed mime type', async () => {
    const controller = new DocumentsController(db, storage);

    await expect(
      controller.upload(
        workspaceId,
        principalId,
        fakeMultipartRequest({ mimetype: 'application/zip' }),
      ),
    ).rejects.toMatchObject({ code: 'FINCH_DOCUMENT_TYPE_NOT_ALLOWED' });
  });

  it('rejects an empty file', async () => {
    const controller = new DocumentsController(db, storage);

    await expect(
      controller.upload(workspaceId, principalId, fakeMultipartRequest({ content: '' })),
    ).rejects.toMatchObject({ code: 'FINCH_DOCUMENT_TOO_LARGE' });
  });

  it('rejects a file truncated by the size limit', async () => {
    const controller = new DocumentsController(db, storage);

    await expect(
      controller.upload(workspaceId, principalId, fakeMultipartRequest({ truncated: true })),
    ).rejects.toMatchObject({ code: 'FINCH_DOCUMENT_TOO_LARGE' });
  });

  it('list only returns documents scoped to the requested workspace', async () => {
    const controller = new DocumentsController(db, storage);
    const otherWorkspaceId = 'workspace-documents-2';
    await db.insert(schema.workspaces).values({ id: otherWorkspaceId, type: 'PERSONAL' });
    await controller.upload(workspaceId, principalId, fakeMultipartRequest({ filename: 'a.pdf' }));
    await controller.upload(
      otherWorkspaceId,
      principalId,
      fakeMultipartRequest({ filename: 'b.pdf' }),
    );

    const rows = await controller.list(otherWorkspaceId);

    expect(rows.every((row) => row.workspaceId === otherWorkspaceId)).toBe(true);
    expect(rows.some((row) => row.originalFilename === 'b.pdf')).toBe(true);
    expect(rows.some((row) => row.originalFilename === 'a.pdf')).toBe(false);
  });

  it('remove deletes both the DB row and the bytes on disk', async () => {
    const controller = new DocumentsController(db, storage);
    const created = await controller.upload(workspaceId, principalId, fakeMultipartRequest());
    const path = join(storageDir, created.storageKey);
    await expect(readFile(path)).resolves.toBeDefined();

    await expect(controller.remove(workspaceId, created.id)).resolves.toEqual({ ok: true });

    await expect(readFile(path)).rejects.toThrow();
    await expect(controller.remove(workspaceId, created.id)).rejects.toMatchObject({
      code: 'FINCH_VALIDATION_NOT_FOUND',
    });
  });
});
