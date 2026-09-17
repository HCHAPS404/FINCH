#!/usr/bin/env node
/**
 * FINCH architecture fitness runner — README §64, §102.15.
 *
 * Two responsibilities:
 *
 *   1. Run dependency-cruiser against .dependency-cruiser.cjs and fail the build on
 *      any boundary violation.
 *
 *   2. Self-test the mechanism (`--self-test`). A fitness function that silently stops
 *      working is worse than none at all: it converts an unenforced rule into a false
 *      sense of safety. So we plant a deliberate violation, assert the checker rejects
 *      it, and remove it. README §102.15 requires demonstrating exactly this.
 *
 * Exit codes: 0 = architecture intact, 1 = violation or broken checker.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ESC = String.fromCharCode(27);
const C = {
  reset: `${ESC}[0m`,
  red: `${ESC}[31m`,
  green: `${ESC}[32m`,
  dim: `${ESC}[2m`,
  bold: `${ESC}[1m`,
};

const SCAN_TARGETS = ['apps', 'packages'].filter((d) => existsSync(join(ROOT, d)));

/**
 * @returns {{ ok: boolean, output: string }}
 */
function cruise(extraArgs = []) {
  try {
    const output = execFileSync(
      'pnpm',
      ['exec', 'depcruise', '--config', '.dependency-cruiser.cjs', ...extraArgs, ...SCAN_TARGETS],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return { ok: true, output };
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    return { ok: false, output };
  }
}

/**
 * Plant a file that violates `domain-is-framework-free`, confirm the checker catches
 * it, then remove it. Runs in a fixed path so a crashed run leaves an obvious artifact
 * rather than a mystery.
 */
function selfTest() {
  const probeDir = join(ROOT, 'packages/domain/src/__fitness_probe__');
  const probeFile = join(probeDir, 'deliberate-violation.ts');

  console.log(
    `${C.bold}Self-test${C.reset} ${C.dim}planting a deliberate boundary violation${C.reset}`,
  );

  mkdirSync(probeDir, { recursive: true });
  writeFileSync(
    probeFile,
    [
      '// TEMPORARY FILE written by scripts/architecture-check.mjs --self-test.',
      '// It deliberately violates README §8 (domain must not depend on NestJS) to prove',
      '// that the fitness functions actually reject violations. It is removed immediately.',
      "import { Injectable } from '@nestjs/common';",
      '',
      'export const probe = Injectable;',
      '',
    ].join('\n'),
    'utf8',
  );

  let caught;
  try {
    const result = cruise();
    // Assert on the specific rule AND the specific probe file. Checking only "did it
    // fail" would pass trivially whenever any unrelated violation already exists,
    // which would make this self-test worthless exactly when the repo is unhealthy.
    caught =
      !result.ok &&
      /domain-is-framework-free/.test(result.output) &&
      /__fitness_probe__/.test(result.output);
    if (!caught) {
      console.error(
        `${C.red}Self-test FAILED${C.reset}: the checker did not reject a known violation.`,
      );
      console.error(`${C.dim}${result.output.slice(0, 2000)}${C.reset}`);
    }
  } finally {
    rmSync(probeDir, { recursive: true, force: true });
  }

  if (!caught) {
    console.error(
      '\nThe architecture fitness functions are not enforcing boundaries. Treat this as a\n' +
        'build-breaking defect: every "architecture: OK" result since the last working run\n' +
        'is untrustworthy (README §64).\n',
    );
    process.exit(1);
  }

  console.log(
    `  ${C.green}OK${C.reset}  violation rejected as expected — fitness functions are live\n`,
  );
}

// --------------------------------------------------------------------------

if (SCAN_TARGETS.length === 0) {
  console.log('No apps/ or packages/ directories to scan yet — nothing to verify.');
  process.exit(0);
}

if (process.argv.includes('--self-test')) {
  selfTest();
}

console.log(`${C.bold}Architecture fitness${C.reset} ${C.dim}(README §64)${C.reset}`);
const result = cruise(['--output-type', 'err-long']);

if (!result.ok) {
  console.error(result.output);
  console.error(
    `${C.red}${C.bold}Architecture violation.${C.reset}\n\n` +
      'These rules are executable clauses of the Architecture Constitution. Do not weaken\n' +
      'a rule to make the build pass. If the boundary is genuinely wrong, stop and open an\n' +
      'ADR (README §76).\n',
  );
  process.exit(1);
}

console.log(result.output.trim() || `  ${C.green}OK${C.reset}  no boundary violations`);

// Emit the dependency graph as a reviewable artifact (README §15 artifact discipline).
if (process.argv.includes('--artifact')) {
  mkdirSync(join(ROOT, 'artifacts'), { recursive: true });
  const json = cruise(['--output-type', 'json']);
  writeFileSync(join(ROOT, 'artifacts/architecture-check.json'), json.output, 'utf8');
  console.log(`  ${C.dim}artifact: artifacts/architecture-check.json${C.reset}`);
}
