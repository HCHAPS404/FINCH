/**
 * GET /api/health — liveness plus the facts a judge or operator needs to see:
 * which environment, which build, and which models serve each AI tier.
 *
 * It never calls the provider (a health probe must not spend inference credit) and
 * never reports secrets.
 */
import type { AiGateway } from '@finch/ai-core';
import type { FinchConfig } from '@finch/config';
import { Controller, Get, Inject } from '@nestjs/common';

import { AI_GATEWAY, BUILD_INFO, CONFIG, type BuildInfo } from '../../platform/tokens.js';

@Controller('api/health')
export class HealthController {
  constructor(
    @Inject(CONFIG) private readonly config: FinchConfig,
    @Inject(AI_GATEWAY) private readonly gateway: AiGateway,
    @Inject(BUILD_INFO) private readonly build: BuildInfo,
  ) {}

  @Get()
  health(): Record<string, unknown> {
    const ai = this.gateway.status();
    return {
      status: 'ok',
      service: this.build.service,
      version: this.build.version,
      commit: this.build.commit ?? null,
      environment: this.config.public.finchEnv,
      ai: {
        provider: this.config.ai.provider,
        endpointHost: new URL(this.config.ai.baseUrl).host,
        enabled: ai.enabled,
        tiers: ai.tiers,
      },
    };
  }
}
