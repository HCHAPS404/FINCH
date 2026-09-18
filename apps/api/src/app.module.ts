import { Module, type DynamicModule } from '@nestjs/common';
import type { FinchConfig } from '@finch/config';
import type { DbHandle } from '@finch/db';
import { FinchConfigModule } from './config/finch-config.module.js';
import { DbModule } from './infrastructure/db/db.module.js';
import { AuthModule } from './infrastructure/auth/auth.module.js';
import { HealthModule } from './health/health.module.js';
import { WorkspacesModule } from './workspaces/workspaces.module.js';

@Module({})
export class AppModule {
  static forRoot(config: FinchConfig, dbHandle: DbHandle): DynamicModule {
    return {
      module: AppModule,
      imports: [
        FinchConfigModule.forRoot(config),
        DbModule.forRoot(dbHandle),
        AuthModule.forRoot(config),
        HealthModule,
        WorkspacesModule,
      ],
    };
  }
}
