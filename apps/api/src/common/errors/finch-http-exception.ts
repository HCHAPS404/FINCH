/**
 * The one way application code signals a client-facing failure — README §58.
 *
 * Throwing this (rather than a raw `Error` or a NestJS `HttpException`) is what lets
 * `FinchExceptionFilter` produce the stable `FinchErrorBody` shape every client can
 * rely on, instead of an ad hoc message that changes whenever the implementation does.
 */
import type { FinchErrorCode } from '@finch/contracts';

export class FinchHttpException extends Error {
  readonly code: FinchErrorCode;
  readonly details?: readonly { readonly field: string; readonly issue: string }[];

  constructor(
    code: FinchErrorCode,
    message: string,
    details?: readonly { readonly field: string; readonly issue: string }[],
  ) {
    super(message);
    this.name = 'FinchHttpException';
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
  }
}
