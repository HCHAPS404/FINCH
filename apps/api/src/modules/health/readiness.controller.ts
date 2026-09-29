/**
 * GET /api/ready — readiness, distinct from liveness (`/api/health`).
 *
 * Returns 503 when a dependency the API cannot serve without is down, so a load
 * balancer or platform health check stops routing traffic instead of letting users hit
 * errors (README §48, §126). Reports states only, never connection details.
 */
import { ping, type DatabaseHandle } from '@finch/db';
import { Controller, Get, Inject, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import { DATABASE } from '../../platform/tokens.js';

export type DependencyState = 'up' | 'down' | 'not_configured';

@Controller('api/ready')
export class ReadinessController {
  constructor(@Inject(DATABASE) private readonly database: DatabaseHandle | null) {}

  @Get()
  async ready(
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<{ status: 'ready' | 'not_ready'; database: DependencyState }> {
    const database: DependencyState =
      this.database === null ? 'not_configured' : (await ping(this.database.db)) ? 'up' : 'down';
    const ready = database === 'up';
    void reply.status(ready ? 200 : 503);
    return { status: ready ? 'ready' : 'not_ready', database };
  }
}
