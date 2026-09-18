/** DI token for the validated `FinchConfig` — injected as a value, never re-read from `process.env` inside a provider. */
export const FINCH_CONFIG = Symbol('FINCH_CONFIG');
