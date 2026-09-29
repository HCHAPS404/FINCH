/**
 * POST /api/v1/assistant/turns — HTTP adapter for the Ask FINCH use case.
 *
 * Validates the body with zod at the boundary (README §19.2), applies the per-client
 * AI turn limit that protects inference credit (docs/hackathon/03 §6), and delegates.
 * No business logic lives here (README §57).
 */
import type { AiGateway } from '@finch/ai-core';
import { NARRATE_INPUT_MAX_CHARS } from '@finch/ai-core';
import { Body, Controller, HttpCode, Inject, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { CORRELATION_HEADER } from '../../../platform/correlation.js';
import { FinchHttpError } from '../../../platform/errors.js';
import type { FixedWindowLimiter } from '../../../platform/rate-limit.js';
import { AI_GATEWAY, AI_TURN_LIMITER } from '../../../platform/tokens.js';
import { askFinch, type AssistantAnswer } from '../application/ask-finch.js';

const turnSchema = z.strictObject({
  message: z.string().trim().min(1).max(NARRATE_INPUT_MAX_CHARS),
});

@Controller('api/v1/assistant')
export class AssistantController {
  constructor(
    @Inject(AI_GATEWAY) private readonly gateway: AiGateway,
    @Inject(AI_TURN_LIMITER) private readonly limiter: FixedWindowLimiter,
  ) {}

  @Post('turns')
  @HttpCode(200)
  async turn(@Body() body: unknown, @Req() request: FastifyRequest): Promise<AssistantAnswer> {
    const { message } = turnSchema.parse(body);
    const decision = this.limiter.check(request.ip);
    if (!decision.allowed) {
      throw new FinchHttpError(
        'FINCH_RATE_LIMIT_AI_TURNS',
        'Too many questions in a short time. Please wait a moment.',
        { 'retry-after': String(decision.retryAfterSeconds) },
      );
    }
    const correlationId = String(request.headers[CORRELATION_HEADER] ?? request.id);
    return askFinch(this.gateway, message, correlationId);
  }
}
