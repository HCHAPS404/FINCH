/**
 * OpenAI-compatible chat completions adapter — Nebius Token Factory (ADR-0036).
 *
 * Token Factory exposes an OpenAI-compatible API, so this adapter speaks
 * `POST {baseUrl}chat/completions` with plain `fetch` rather than a vendor SDK: one
 * fewer supply-chain dependency (README §43) and nothing SDK-shaped for the rest of the
 * code to lean on.
 *
 * The response is validated with a schema before anything is read from it. Provider
 * error bodies are never propagated: they can echo prompt content (README §119).
 */
import { z } from 'zod';

import {
  InferenceError,
  type InferencePort,
  type InferenceRequest,
  type InferenceResponse,
} from '../inference-port.js';

export interface OpenAiCompatibleOptions {
  /** Base URL ending in `/v1/`, e.g. `https://api.tokenfactory.nebius.com/v1/`. */
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly timeoutMs: number;
  /** Injectable for tests; defaults to the global `fetch`. */
  readonly fetchFn?: typeof fetch;
}

const completionSchema = z.object({
  model: z.string().min(1),
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string().nullable() }),
      }),
    )
    .min(1),
  usage: z
    .object({
      prompt_tokens: z.number().int().nonnegative(),
      completion_tokens: z.number().int().nonnegative(),
    })
    .optional(),
});

function failureFor(status: number): InferenceError {
  if (status === 401 || status === 403) return new InferenceError('UNAUTHORIZED', status);
  if (status === 429) return new InferenceError('RATE_LIMITED', status);
  return new InferenceError('UNAVAILABLE', status);
}

export class OpenAiCompatibleInference implements InferencePort {
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: OpenAiCompatibleOptions) {
    const base = options.baseUrl.endsWith('/') ? options.baseUrl : `${options.baseUrl}/`;
    this.endpoint = new URL('chat/completions', base).toString();
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async complete(request: InferenceRequest): Promise<InferenceResponse> {
    let response: Response;
    try {
      response = await this.fetchFn(this.endpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          max_tokens: request.maxOutputTokens,
          temperature: request.temperature,
          stream: false,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new InferenceError('TIMEOUT');
      }
      throw new InferenceError('UNAVAILABLE');
    }

    if (!response.ok) {
      // Drain the body so the connection can be reused, but never read it into an
      // error: it may contain the prompt.
      await response.body?.cancel();
      throw failureFor(response.status);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new InferenceError('INVALID_RESPONSE', response.status);
    }

    const parsed = completionSchema.safeParse(payload);
    const content = parsed.success ? parsed.data.choices[0]?.message.content : undefined;
    if (!parsed.success || content === undefined || content === null || content.trim() === '') {
      throw new InferenceError('INVALID_RESPONSE', response.status);
    }

    const usage = parsed.data.usage;
    return {
      text: content,
      servedModel: parsed.data.model,
      usage:
        usage === undefined
          ? undefined
          : { inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens },
    };
  }
}
