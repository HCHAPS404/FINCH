/**
 * InferencePort — the only way the gateway reaches a model (README §27, §30).
 *
 * The port speaks FINCH's vocabulary (model ID, messages, token cap). Provider
 * specifics — URL shapes, auth headers, error bodies — stay inside an adapter.
 */

export interface ChatMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

export interface InferenceRequest {
  readonly model: string;
  readonly messages: readonly ChatMessage[];
  readonly maxOutputTokens: number;
  readonly temperature: number;
}

export interface InferenceUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
}

export interface InferenceResponse {
  readonly text: string;
  /** The model the provider reports having served, which may differ from the request. */
  readonly servedModel: string;
  readonly usage: InferenceUsage | undefined;
}

/** Why a provider call failed, in terms the gateway can act on. */
export type InferenceFailureReason =
  'TIMEOUT' | 'UNAUTHORIZED' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'INVALID_RESPONSE';

/**
 * Raised by adapters. Carries a reason and an HTTP status when there was one — never
 * the provider's response body, which may echo prompt content (README §119).
 */
export class InferenceError extends Error {
  readonly reason: InferenceFailureReason;
  readonly providerStatus: number | undefined;

  constructor(reason: InferenceFailureReason, providerStatus?: number) {
    super(
      `Inference failed: ${reason}${providerStatus === undefined ? '' : ` (HTTP ${String(providerStatus)})`}`,
    );
    this.name = 'InferenceError';
    this.reason = reason;
    this.providerStatus = providerStatus;
  }
}

export interface InferencePort {
  complete(request: InferenceRequest): Promise<InferenceResponse>;
}
