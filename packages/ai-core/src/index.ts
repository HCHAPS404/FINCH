/**
 * @finch/ai-core — the AI Gateway (README §30, §31).
 *
 * Every model call in FINCH goes through `AiGateway`. Nothing else in the codebase
 * talks to a model provider.
 */
export * from './tiers.js';
export * from './redaction.js';
export * from './inference-port.js';
export * from './gateway.js';
export * from './adapters/openai-compatible.js';
