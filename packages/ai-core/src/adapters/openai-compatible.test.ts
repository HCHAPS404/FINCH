/**
 * OpenAI-compatible adapter against a real local HTTP server.
 *
 * The server stands in for Token Factory at the protocol level only: requests travel
 * over real HTTP, so headers, JSON bodies, status codes and timeouts are exercised the
 * way production exercises them.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { InferenceError } from '../inference-port.js';
import { OpenAiCompatibleInference } from './openai-compatible.js';

type Handler = (body: Record<string, unknown>, req: IncomingMessage, res: ServerResponse) => void;

let server: Server;
let baseUrl = '';
let handler: Handler = () => undefined;
let lastAuthorization: string | undefined;

beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString('utf8');
    });
    req.on('end', () => {
      lastAuthorization = req.headers.authorization;
      handler(JSON.parse(raw) as Record<string, unknown>, req, res);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}/v1/`;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) =>
    server.close(() => {
      resolve();
    }),
  );
});

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function adapter(timeoutMs = 2_000): OpenAiCompatibleInference {
  return new OpenAiCompatibleInference({ baseUrl, apiKey: 'test-key', timeoutMs });
}

const REQUEST = {
  model: 'tier-fast-model',
  messages: [{ role: 'user', content: 'hello' }] as const,
  maxOutputTokens: 64,
  temperature: 0.1,
};

describe('OpenAiCompatibleInference', () => {
  it('posts a chat completion and parses text, served model and usage', async () => {
    let received: Record<string, unknown> = {};
    handler = (body, _req, res) => {
      received = body;
      json(res, 200, {
        model: 'served-model',
        choices: [{ message: { content: 'Hi there.' } }],
        usage: { prompt_tokens: 12, completion_tokens: 3 },
      });
    };
    const result = await adapter().complete(REQUEST);
    expect(result).toEqual({
      text: 'Hi there.',
      servedModel: 'served-model',
      usage: { inputTokens: 12, outputTokens: 3 },
    });
    expect(lastAuthorization).toBe('Bearer test-key');
    expect(received).toMatchObject({ model: 'tier-fast-model', max_tokens: 64, stream: false });
  });

  it.each([
    [401, 'UNAUTHORIZED'],
    [403, 'UNAUTHORIZED'],
    [429, 'RATE_LIMITED'],
    [500, 'UNAVAILABLE'],
    [503, 'UNAVAILABLE'],
  ])('maps HTTP %i to %s without exposing the provider body', async (status, reason) => {
    handler = (_body, _req, res) => {
      json(res, status, { error: { message: 'echo of the prompt: hello' } });
    };
    const error = await adapter()
      .complete(REQUEST)
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(InferenceError);
    expect((error as InferenceError).reason).toBe(reason);
    expect((error as InferenceError).message).not.toContain('echo of the prompt');
  });

  it('rejects a response that does not match the schema', async () => {
    handler = (_body, _req, res) => {
      json(res, 200, { model: 'm', choices: [] });
    };
    await expect(adapter().complete(REQUEST)).rejects.toMatchObject({
      reason: 'INVALID_RESPONSE',
    });
  });

  it('rejects an empty answer', async () => {
    handler = (_body, _req, res) => {
      json(res, 200, { model: 'm', choices: [{ message: { content: '   ' } }] });
    };
    await expect(adapter().complete(REQUEST)).rejects.toMatchObject({
      reason: 'INVALID_RESPONSE',
    });
  });

  it('times out instead of hanging', async () => {
    handler = () => undefined; // never responds
    await expect(adapter(1_000).complete(REQUEST)).rejects.toMatchObject({ reason: 'TIMEOUT' });
  });

  it('reports an unreachable provider as unavailable', async () => {
    const unreachable = new OpenAiCompatibleInference({
      baseUrl: 'http://127.0.0.1:1/v1/',
      apiKey: 'test-key',
      timeoutMs: 2_000,
    });
    await expect(unreachable.complete(REQUEST)).rejects.toMatchObject({ reason: 'UNAVAILABLE' });
  });
});
