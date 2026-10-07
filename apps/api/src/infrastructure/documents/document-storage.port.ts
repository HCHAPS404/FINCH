/**
 * Storage port for document bytes — ADR-0041, ADR-0022 (provider abstraction). One
 * adapter for now (`LocalDiskStorageAdapter`); swapping to S3 later is a new adapter
 * against this same port, not a change to any caller.
 */
export interface DocumentStoragePort {
  save(key: string, bytes: Buffer): Promise<void>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

export const DOCUMENT_STORAGE_PORT = Symbol('DOCUMENT_STORAGE_PORT');
