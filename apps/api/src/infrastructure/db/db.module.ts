/**
 * Composition root for the database handle — README §104. `@Global()` because nearly
 * every controller/guard needs `DATABASE`, and re-importing this module everywhere
 * would just be ceremony around a single process-lifetime connection pool.
 */
import { Global, Module, type DynamicModule } from '@nestjs/common';
import type { DbHandle } from '@finch/db';
import { DATABASE } from './db.tokens.js';

@Global()
@Module({})
export class DbModule {
  static forRoot(dbHandle: DbHandle): DynamicModule {
    return {
      module: DbModule,
      providers: [{ provide: DATABASE, useValue: dbHandle.db }],
      exports: [DATABASE],
    };
  }
}
