/**
 * Local-disk `DocumentStoragePort` adapter — ADR-0041. No cloud credentials needed
 * for this pass; `documentsStorageDir` is a configured path (`DOCUMENTS_STORAGE_DIR`),
 * never hardcoded, so swapping the deployment target later touches config, not code.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, sep } from 'node:path';
import type { DocumentStoragePort } from './document-storage.port.js';

export class LocalDiskStorageAdapter implements DocumentStoragePort {
  constructor(private readonly baseDir: string) {}

  private resolve(key: string): string {
    // `key` is always a server-generated storage key (never a raw client filename),
    // but resolve-and-check anyway so a future caller mistake cannot escape baseDir.
    const resolved = normalize(join(this.baseDir, key));
    const base = normalize(this.baseDir + sep);
    if (!resolved.startsWith(base)) {
      throw new Error(`Refusing to resolve a storage key outside the storage directory: ${key}`);
    }
    return resolved;
  }

  async save(key: string, bytes: Buffer): Promise<void> {
    const path = this.resolve(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, bytes);
  }

  async read(key: string): Promise<Buffer> {
    return readFile(this.resolve(key));
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }
}
