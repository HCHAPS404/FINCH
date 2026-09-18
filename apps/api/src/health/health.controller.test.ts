/**
 * `HealthController` tests — README §102.4 (`/health` is process-liveness only,
 * `/ready` additionally proves the database is reachable).
 */
import { describe, it, expect, vi } from 'vitest';
import type { Database } from '@finch/db';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('reports ok without touching the database', () => {
    const db = { execute: vi.fn() } as unknown as Database;
    const controller = new HealthController(db);

    expect(controller.health()).toEqual({ status: 'ok' });
    expect(db.execute).not.toHaveBeenCalled();
  });

  it('reports ready once a database round trip succeeds', async () => {
    const db = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as Database;
    const controller = new HealthController(db);

    await expect(controller.ready()).resolves.toEqual({ status: 'ready' });
    expect(db.execute).toHaveBeenCalledTimes(1);
  });

  it('propagates a database failure instead of reporting ready', async () => {
    const db = {
      execute: vi.fn().mockRejectedValue(new Error('connection refused')),
    } as unknown as Database;
    const controller = new HealthController(db);

    await expect(controller.ready()).rejects.toThrow('connection refused');
  });
});
