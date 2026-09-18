/**
 * `FinchExceptionFilter` tests — README §58, §119 (stable error shape, no raw
 * internal/provider text ever reaches a client).
 */
import { describe, it, expect, vi } from 'vitest';
import { NotFoundException, BadRequestException, type ArgumentsHost } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { runWithCorrelation } from '@finch/observability';
import { FinchHttpException } from '../errors/finch-http-exception.js';
import { FinchExceptionFilter } from './finch-exception.filter.js';

function hostFor(reply: FastifyReply): ArgumentsHost {
  return {
    switchToHttp: () => ({ getResponse: () => reply }),
  } as unknown as ArgumentsHost;
}

function fakeReply(): FastifyReply {
  const reply = {
    status: vi.fn(),
    send: vi.fn(),
  } as unknown as FastifyReply;
  vi.mocked(reply.status).mockReturnValue(reply);
  return reply;
}

describe('FinchExceptionFilter', () => {
  it('maps a FinchHttpException to its declared code, namespace status and details', () => {
    const filter = new FinchExceptionFilter();
    const reply = fakeReply();
    const exception = new FinchHttpException('FINCH_VALIDATION_REQUEST_INVALID', 'Bad input', [
      { field: 'amount', issue: 'must be positive' },
    ]);

    runWithCorrelation({ correlationId: 'corr-1', causationId: null }, () => {
      filter.catch(exception, hostFor(reply));
    });

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      error: {
        code: 'FINCH_VALIDATION_REQUEST_INVALID',
        message: 'Bad input',
        correlationId: 'corr-1',
        details: [{ field: 'amount', issue: 'must be positive' }],
      },
    });
  });

  it('maps a NestJS NotFoundException to FINCH_VALIDATION_NOT_FOUND', () => {
    const filter = new FinchExceptionFilter();
    const reply = fakeReply();

    filter.catch(new NotFoundException('nope'), hostFor(reply));

    expect(reply.status).toHaveBeenCalledWith(404);
    const [body] = vi.mocked(reply.send).mock.calls[0] as [{ error: { code: string } }];
    expect(body.error.code).toBe('FINCH_VALIDATION_NOT_FOUND');
  });

  it('maps any other NestJS HttpException to FINCH_VALIDATION_REQUEST_INVALID', () => {
    const filter = new FinchExceptionFilter();
    const reply = fakeReply();

    filter.catch(new BadRequestException('nope'), hostFor(reply));

    expect(reply.status).toHaveBeenCalledWith(400);
    const [body] = vi.mocked(reply.send).mock.calls[0] as [{ error: { code: string } }];
    expect(body.error.code).toBe('FINCH_VALIDATION_REQUEST_INVALID');
  });

  it('collapses an unrecognized error to a generic internal error, never surfacing its message', () => {
    const filter = new FinchExceptionFilter();
    const reply = fakeReply();

    filter.catch(new Error('leaked db connection string: postgres://...'), hostFor(reply));

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: {
        code: 'FINCH_INTERNAL_UNEXPECTED',
        message: 'An unexpected error occurred.',
        correlationId: 'unknown',
      },
    });
  });

  it('falls back to "unknown" for the correlation id outside a correlation context', () => {
    const filter = new FinchExceptionFilter();
    const reply = fakeReply();

    filter.catch(new NotFoundException('nope'), hostFor(reply));

    const [body] = vi.mocked(reply.send).mock.calls[0] as [{ error: { correlationId: string } }];
    expect(body.error.correlationId).toBe('unknown');
  });
});
