import { Global, Module, type DynamicModule } from '@nestjs/common';
import type { FinchConfig } from '@finch/config';
import { FINCH_CONFIG } from './config.tokens.js';

@Global()
@Module({})
export class FinchConfigModule {
  static forRoot(config: FinchConfig): DynamicModule {
    return {
      module: FinchConfigModule,
      providers: [{ provide: FINCH_CONFIG, useValue: config }],
      exports: [FINCH_CONFIG],
    };
  }
}
