/**
 * AI Gateway policy — README §30, §31, §62; docs/hackathon/04.
 */
import { describe, expect, it } from 'vitest';

import { AiGateway, AiGatewayError, type AiCallRecord } from './gateway.js';
import {
  InferenceError,
  type InferencePort,
  type InferenceRequest,
  type InferenceResponse,
} from './inference-port.js';

class RecordingPort implements InferencePort {
  readonly requests: InferenceRequest[] = [];
  constructor(private readonly reply: (request: InferenceRequest) => InferenceResponse) {}
  complete(request: InferenceRequest): Promise<InferenceResponse> {
    this.requests.push(request);
    return Promise.resolve(this.reply(request));
  }
}

class FailingPort implements InferencePort {
  constructor(private readonly error: Error) {}
  complete(): Promise<InferenceResponse> {
    return Promise.reject(this.error);
  }
}

function setup(overrides: {
  port?: InferencePort | undefined;
  enabled?: boolean;
  models?: Partial<Record<'FAST' | 'AGENT' | 'DEEP', string>>;
}) {
  const records: AiCallRecord[] = [];
  let clock = 0;
  const gateway = new AiGateway({
    port: 'port' in overrides ? overrides.port : undefined,
    enabled: overrides.enabled ?? true,
    models: overrides.models ?? { FAST: 'fast-model' },
    maxOutputTokens: 256,
    audit: { record: (entry) => records.push(entry) },
    now: () => (clock += 5),
  });
  return { gateway, records };
}

const REQUEST = {
  tier: 'FAST' as const,
  system: 'You are FINCH.',
  userText: 'My email is laura.demo@example.com. Can I afford it?',
  correlationId: 'corr-1',
};

describe('AiGateway.narrate', () => {
  it('redacts before egress, restores for the user and tags the output', async () => {
    const port = new RecordingPort((request) => ({
      text: `I saw ${request.messages[1]?.content.includes('<EMAIL_1>') ? '<EMAIL_1>' : '?'}.`,
      servedModel: 'fast-model',
      usage: { inputTokens: 20, outputTokens: 4 },
    }));
    const { gateway, records } = setup({ port });
    const result = await gateway.narrate(REQUEST);

    const sent = port.requests[0]?.messages.map((m) => m.content).join('\n') ?? '';
    expect(sent).not.toContain('laura.demo@example.com');
    expect(result.text).toBe('I saw laura.demo@example.com.');
    expect(result.truthClass).toBe('GENERATED_NARRATIVE');
    expect(port.requests[0]?.maxOutputTokens).toBe(256);
    expect(records).toEqual([
      expect.objectContaining({ outcome: 'OK', redactionsCount: 1, inputTokens: 20 }),
    ]);
  });

  it('never writes prompt or answer text into the audit record', async () => {
    const port = new RecordingPort(() => ({
      text: 'secret answer text',
      servedModel: 'fast-model',
      usage: undefined,
    }));
    const { gateway, records } = setup({ port });
    await gateway.narrate(REQUEST);
    const serialized = JSON.stringify(records);
    expect(serialized).not.toContain('secret answer text');
    expect(serialized).not.toContain('afford');
    expect(serialized).not.toContain('laura.demo');
  });

  it('honours the kill switch without calling the provider', async () => {
    const port = new RecordingPort(() => ({ text: 'x', servedModel: 'm', usage: undefined }));
    const { gateway, records } = setup({ port, enabled: false });
    await expect(gateway.narrate(REQUEST)).rejects.toMatchObject({
      code: 'FINCH_PROVIDER_AI_DISABLED',
    });
    expect(port.requests).toHaveLength(0);
    expect(records[0]).toMatchObject({ outcome: 'BLOCKED', failure: 'KILL_SWITCH' });
  });

  it('refuses a tier with no configured model instead of rerouting', async () => {
    const port = new RecordingPort(() => ({ text: 'x', servedModel: 'm', usage: undefined }));
    const { gateway } = setup({ port, models: { FAST: 'fast-model' } });
    await expect(gateway.narrate({ ...REQUEST, tier: 'DEEP' })).rejects.toMatchObject({
      code: 'FINCH_PROVIDER_AI_UNAVAILABLE',
    });
    expect(port.requests).toHaveLength(0);
  });

  it('refuses when no credentials are configured', async () => {
    const { gateway } = setup({ port: undefined });
    await expect(gateway.narrate(REQUEST)).rejects.toBeInstanceOf(AiGatewayError);
  });

  it.each([
    ['TIMEOUT', 'FINCH_PROVIDER_AI_TIMEOUT'],
    ['RATE_LIMITED', 'FINCH_PROVIDER_AI_RATE_LIMITED'],
    ['UNAUTHORIZED', 'FINCH_PROVIDER_AI_UNAVAILABLE'],
    ['INVALID_RESPONSE', 'FINCH_PROVIDER_AI_INVALID_RESPONSE'],
  ] as const)('maps provider failure %s to %s', async (reason, code) => {
    const { gateway, records } = setup({ port: new FailingPort(new InferenceError(reason)) });
    await expect(gateway.narrate(REQUEST)).rejects.toMatchObject({ code });
    expect(records[0]).toMatchObject({ outcome: 'FAILED', failure: reason });
  });

  it('treats an unexpected error as provider unavailability', async () => {
    const { gateway } = setup({ port: new FailingPort(new Error('boom')) });
    await expect(gateway.narrate(REQUEST)).rejects.toMatchObject({
      code: 'FINCH_PROVIDER_AI_UNAVAILABLE',
    });
  });

  it('rejects empty or oversized input before any call', async () => {
    const port = new RecordingPort(() => ({ text: 'x', servedModel: 'm', usage: undefined }));
    const { gateway } = setup({ port });
    await expect(gateway.narrate({ ...REQUEST, userText: '   ' })).rejects.toThrow();
    await expect(gateway.narrate({ ...REQUEST, userText: 'a'.repeat(4_001) })).rejects.toThrow();
    expect(port.requests).toHaveLength(0);
  });
});

describe('AiGateway.status', () => {
  it('reports each tier and whether it can answer', () => {
    const port = new RecordingPort(() => ({ text: 'x', servedModel: 'm', usage: undefined }));
    const { gateway } = setup({ port, models: { FAST: 'fast-model', AGENT: 'agent-model' } });
    expect(gateway.status()).toEqual({
      enabled: true,
      tiers: [
        { tier: 'FAST', model: 'fast-model', available: true },
        { tier: 'AGENT', model: 'agent-model', available: true },
        { tier: 'DEEP', model: null, available: false },
      ],
    });
  });

  it('reports disabled when there are no credentials', () => {
    const { gateway } = setup({ port: undefined });
    expect(gateway.status().enabled).toBe(false);
    expect(gateway.status().tiers.every((t) => !t.available)).toBe(true);
  });
});
