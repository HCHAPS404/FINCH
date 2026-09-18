/**
 * Health/readiness — README §102.4.
 *
 * `/health` answers "is the process up"; `/ready` additionally answers "can it serve a
 * request that touches the database." Load balancers and orchestrators treat the two
 * differently, so they stay separate endpoints rather than one flag.
 */
import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Database } from '@finch/db';
import { DATABASE } from '../infrastructure/db/db.tokens.js';

@Controller()
export class HealthController {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  @Get('health')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready(): Promise<{ status: 'ready' }> {
    await this.db.execute(sql`select 1`);
    return { status: 'ready' };
  }
}
