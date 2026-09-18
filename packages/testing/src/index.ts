/**
 * @finch/testing — shared test factories, synthetic personas and the Testcontainers
 * harness. README §73, §80.
 */
export type { PostgresHarness } from './postgres-harness.js';
export { startPostgresHarness, POSTGRES_HARNESS_IMAGE } from './postgres-harness.js';

export type { RandomSource } from './random.js';
export { createSeededRandom, randomId } from './random.js';

export type { SyntheticPersonaId, PersonaIdentity } from './personas.js';
export { SYNTHETIC_PERSONAS, createPersonaIdentity } from './personas.js';
