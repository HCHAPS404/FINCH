/**
 * @finch/contracts — the shared vocabulary of FINCH.
 *
 * This package is a LEAF: it depends on no other workspace package (enforced by
 * `contracts-are-leaf` in .dependency-cruiser.cjs). Everything here is a type or a
 * pure constant, so importing it can never pull in infrastructure.
 */
export * from './truth.js';
export * from './errors.js';
export * from './events.js';
export * from './tenancy.js';
export * from './risk.js';
