#!/usr/bin/env node
/**
 * FINCH release certification — README §45, §102.20.
 *
 * A release candidate must be able to produce its evidence bundle. This script checks
 * which artifacts exist and reports the gap; it never fabricates a missing one.
 */
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** README §45 — the full expected bundle. */
const EXPECTED = [
  ['artifacts/release-manifest.json', 'immutable build identity + git SHA'],
  ['artifacts/changelog.md', 'what changed'],
  ['artifacts/openapi.json', 'API contract snapshot'],
  ['artifacts/sbom.spdx.json', 'software bill of materials'],
  ['artifacts/checksums.txt', 'artifact integrity'],
  ['artifacts/financial-correctness.json', 'financial formula verification'],
  ['artifacts/security-scan.json', 'SAST + secret + dependency findings'],
  ['artifacts/architecture-check.json', 'boundary compliance'],
  ['artifacts/migration-plan.md', 'schema change plan'],
  ['artifacts/rollback-plan.md', 'how to undo this release'],
  ['artifacts/known-risks.md', 'accepted risks at ship time'],
];

console.log('\nFINCH release evidence (README §45)\n');

let missing = 0;
const width = Math.max(...EXPECTED.map(([p]) => p.length));
for (const [path, purpose] of EXPECTED) {
  const full = join(ROOT, path);
  if (existsSync(full)) {
    console.log(`  PRESENT  ${path.padEnd(width)}  ${statSync(full).size} bytes`);
  } else {
    missing += 1;
    console.log(`  MISSING  ${path.padEnd(width)}  ${purpose}`);
  }
}

console.log('');
if (missing > 0) {
  console.log(`${missing} of ${EXPECTED.length} artifacts missing.`);
  console.log('Run the full CI gate to produce them. A release without evidence is not a');
  console.log('release candidate (README §11 of the Constitution, §45).\n');
  process.exit(1);
}
console.log('Release evidence bundle is complete.\n');
