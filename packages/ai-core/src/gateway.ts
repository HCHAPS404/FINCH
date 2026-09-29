/**
 * AI Gateway — README §30, §31; docs/hackathon/04.
 *
 * The single path from FINCH to a language model. In this first version (walking
 * skeleton, S0-07) it enforces:
 *
 * 1. the kill switch `FEATURE_AI_EXPLANATIONS_ENABLED` (README §62);
 * 2. tier → model routing from configuration, with no silent rerouting;
 * 3. PII redaction before egress and restoration for the same user (§31);
 * 4. a hard cap on output tokens;
 * 5. an audit record per call that never contains prompt or answer text (ADR-0027);
 * 6. output tagged `GENERATED_NARRATIVE`, which can never be promoted (§3.3).
 *
 * Not yet here, and tracked for S1-04: prompt registry, the receipt verifier
 * (ProofCarryingAnswer), per-day and per-session budgets, guard model, fallback chain.
 */
import type { FinchErrorCode } from '@finch/contracts';
import { z } from 'zod';

import {
  InferenceError,
  type ChatMessage,
  type InferencePort,
  type InferenceUsage,
} from './inference-port.js';
import { redactPii, restorePii } from './redaction.js';
import { MODEL_TIERS, type ModelTier, type TierModels } from './tiers.js';

export const NARRATE_INPUT_MAX_CHARS = 4_000;

const narrateRequestSchema = z.object({
  tier: z.enum(MODEL_TIERS),
  system: z.string().min(1).max(8_000),
  userText: z.string().trim().min(1).max(NARRATE_INPUT_MAX_CHARS),
  correlationId: z.string().min(1).max(128),
});

export type NarrateRequest = z.infer<typeof narrateRequestSchema>;

export interface NarrateResult {
  readonly text: string;
  readonly truthClass: 'GENERATED_NARRATIVE';
  readonly tier: ModelTier;
  readonly model: string;
  readonly usage: InferenceUsage | undefined;
}

export type AiCallOutcome = 'OK' | 'BLOCKED' | 'FAILED';

/** One row of the `ai_calls` audit trail (docs/hackathon/04 §9). No content, ever. */
export interface AiCallRecord {
  readonly correlationId: string;
  readonly tier: ModelTier;
  readonly model: string | undefined;
  readonly outcome: AiCallOutcome;
  readonly failure: string | undefined;
  readonly inputTokens: number | undefined;
  readonly outputTokens: number | undefined;
  readonly latencyMs: number;
  readonly redactionsCount: number;
}

export interface AiAuditSink {
  record(entry: AiCallRecord): void;
}

export interface AiGatewayOptions {
  readonly port: InferencePort | undefined;
  readonly models: TierModels;
  readonly enabled: boolean;
  readonly maxOutputTokens: number;
  readonly audit: AiAuditSink;
  /** Monotonic milliseconds; injectable so latency is testable. */
  readonly now?: () => number;
}

/** A gateway refusal or failure, already mapped to the stable error taxonomy. */
export class AiGatewayError extends Error {
  readonly code: FinchErrorCode;

  constructor(code: FinchErrorCode, message: string) {
    super(message);
    this.name = 'AiGatewayError';
    this.code = code;
  }
}

const FAILURE_CODE: Readonly<Record<InferenceError['reason'], FinchErrorCode>> = {
  TIMEOUT: 'FINCH_PROVIDER_AI_TIMEOUT',
  UNAUTHORIZED: 'FINCH_PROVIDER_AI_UNAVAILABLE',
  RATE_LIMITED: 'FINCH_PROVIDER_AI_RATE_LIMITED',
  UNAVAILABLE: 'FINCH_PROVIDER_AI_UNAVAILABLE',
  INVALID_RESPONSE: 'FINCH_PROVIDER_AI_INVALID_RESPONSE',
};

export interface TierStatus {
  readonly tier: ModelTier;
  readonly model: string | null;
  readonly available: boolean;
}

export class AiGateway {
  private readonly options: AiGatewayOptions;
  private readonly now: () => number;

  constructor(options: AiGatewayOptions) {
    this.options = options;
    this.now = options.now ?? (() => performance.now());
  }

  /** What `/api/health` reports. Never includes the key or the base URL's credentials. */
  status(): { readonly enabled: boolean; readonly tiers: readonly TierStatus[] } {
    const hasPort = this.options.port !== undefined;
    return {
      enabled: this.options.enabled && hasPort,
      tiers: MODEL_TIERS.map((tier) => {
        const model = this.options.models[tier];
        return { tier, model: model ?? null, available: hasPort && model !== undefined };
      }),
    };
  }

  async narrate(input: NarrateRequest): Promise<NarrateResult> {
    const request = narrateRequestSchema.parse(input);
    const started = this.now();
    const model = this.options.models[request.tier];
    const base = { correlationId: request.correlationId, tier: request.tier, model };

    const refuse = (code: FinchErrorCode, reason: string, message: string): never => {
      this.options.audit.record({
        ...base,
        outcome: 'BLOCKED',
        failure: reason,
        inputTokens: undefined,
        outputTokens: undefined,
        latencyMs: this.now() - started,
        redactionsCount: 0,
      });
      throw new AiGatewayError(code, message);
    };

    if (!this.options.enabled) {
      return refuse('FINCH_PROVIDER_AI_DISABLED', 'KILL_SWITCH', 'AI explanations are disabled.');
    }
    const port = this.options.port;
    if (port === undefined) {
      return refuse('FINCH_PROVIDER_AI_UNAVAILABLE', 'NO_CREDENTIALS', 'AI is not configured.');
    }
    if (model === undefined) {
      return refuse(
        'FINCH_PROVIDER_AI_UNAVAILABLE',
        'TIER_UNCONFIGURED',
        `No model is configured for tier ${request.tier}.`,
      );
    }

    const redacted = redactPii(request.userText);
    const messages: readonly ChatMessage[] = [
      { role: 'system', content: request.system },
      { role: 'user', content: redacted.text },
    ];

    try {
      const response = await port.complete({
        model,
        messages,
        maxOutputTokens: this.options.maxOutputTokens,
        temperature: request.tier === 'FAST' ? 0.1 : 0.3,
      });
      this.options.audit.record({
        ...base,
        model: response.servedModel,
        outcome: 'OK',
        failure: undefined,
        inputTokens: response.usage?.inputTokens,
        outputTokens: response.usage?.outputTokens,
        latencyMs: this.now() - started,
        redactionsCount: redacted.replacements.size,
      });
      return {
        text: restorePii(response.text, redacted.replacements),
        truthClass: 'GENERATED_NARRATIVE',
        tier: request.tier,
        model: response.servedModel,
        usage: response.usage,
      };
    } catch (error) {
      const reason = error instanceof InferenceError ? error.reason : 'UNAVAILABLE';
      this.options.audit.record({
        ...base,
        outcome: 'FAILED',
        failure: reason,
        inputTokens: undefined,
        outputTokens: undefined,
        latencyMs: this.now() - started,
        redactionsCount: redacted.replacements.size,
      });
      throw new AiGatewayError(FAILURE_CODE[reason], 'The AI provider could not answer.');
    }
  }
}
