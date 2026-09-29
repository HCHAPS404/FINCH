/**
 * Injection tokens. Explicit tokens keep dependency injection independent of
 * `emitDecoratorMetadata` (see tsconfig.build.json).
 */
export const CONFIG = Symbol('FINCH_CONFIG');
export const AI_GATEWAY = Symbol('FINCH_AI_GATEWAY');
export const AI_TURN_LIMITER = Symbol('FINCH_AI_TURN_LIMITER');
export const DATABASE = Symbol('FINCH_DATABASE');
export const BUILD_INFO = Symbol('FINCH_BUILD_INFO');

export interface BuildInfo {
  readonly service: 'finch-api';
  readonly version: string;
  readonly commit: string | undefined;
}
