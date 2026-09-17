#!/usr/bin/env node
/**
 * FINCH AI evaluation harness entrypoint — README §32.
 *
 * Eval categories that must exist before any LLM output reaches a user:
 *   explanation fidelity · number preservation · structured output validity
 *   document extraction  · prompt injection    · PII leakage
 *   classification       · fallback behavior   · latency · cost
 *
 * STATUS: structure only. FINCH Foundation ships no AI runtime (README §38), so there
 * is nothing to evaluate yet. This script deliberately reports "pending" rather than
 * exiting 0 with a green tick — a harness that claims success while testing nothing is
 * worse than an absent one.
 *
 * Unblocked by: ADR-0018 (ai-gateway) + the first @finch/ai-core adapter.
 */
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EVAL_DIR = join(ROOT, 'evals/ai');

const suites = existsSync(EVAL_DIR)
  ? readdirSync(EVAL_DIR, { withFileTypes: true }).filter((e) => e.isDirectory())
  : [];

console.log('\nFINCH AI eval harness (README §32)\n');

if (suites.length === 0) {
  console.log('  PENDING  no eval suites defined in evals/ai/');
  console.log('           Foundation ships no AI runtime; nothing to evaluate yet.');
  console.log(
    '           Blocked on ADR-0018 (ai-gateway) and the first @finch/ai-core adapter.\n',
  );
  process.exit(0);
}

console.error(`  Found ${suites.length} eval suite(s) but no runner is implemented.`);
console.error('  Implement the runner before shipping AI output to users (README §32).\n');
process.exit(1);
