#!/usr/bin/env node
/**
 * FINCH environment doctor — README §81.
 *
 * Verifies that this machine can build and run FINCH before a developer (or agent)
 * wastes an hour on a failure whose real cause is a toolchain mismatch. Fails with an
 * actionable message, never a stack trace.
 *
 * Exit codes: 0 = ready, 1 = blocking problem found.
 */
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { createConnection } from 'node:net';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const REQUIRED_NODE = readFileSync(join(ROOT, '.nvmrc'), 'utf8').trim();

const ESC = String.fromCharCode(27);
const C = {
  reset: `${ESC}[0m`,
  red: `${ESC}[31m`,
  green: `${ESC}[32m`,
  yellow: `${ESC}[33m`,
  dim: `${ESC}[2m`,
  bold: `${ESC}[1m`,
};

const results = [];
const record = (status, name, detail, fix) => results.push({ status, name, detail, fix });

function run(cmd, args) {
  const options = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] };
  try {
    // On Windows pnpm and corepack are `.cmd` shims, which execFile cannot launch
    // without a shell. The arguments here are fixed literals, so a shell is safe.
    return (
      process.platform === 'win32'
        ? execSync([cmd, ...args].join(' '), options)
        : execFileSync(cmd, args, options)
    ).trim();
  } catch {
    return null;
  }
}

// --- Node -----------------------------------------------------------------
{
  const actual = process.versions.node;
  if (actual === REQUIRED_NODE) {
    record('ok', 'Node.js', `v${actual}`);
  } else {
    record(
      'fail',
      'Node.js',
      `found v${actual}, required v${REQUIRED_NODE} (${PKG.engines.node})`,
      'Run `fnm use` / `nvm use` in the repo root, or install the version in .nvmrc.\n' +
        '    README §56 pins the Node LTS line; Current is not a supported baseline.',
    );
  }
}

// --- pnpm -----------------------------------------------------------------
{
  const expected = PKG.packageManager.split('@')[1];
  const actual = run('pnpm', ['--version']);
  if (!actual) {
    record(
      'fail',
      'pnpm',
      'not found',
      `Run \`corepack enable && corepack prepare pnpm@${expected} --activate\`.`,
    );
  } else if (actual !== expected) {
    record(
      'warn',
      'pnpm',
      `found ${actual}, pinned ${expected}`,
      `Run \`corepack prepare pnpm@${expected} --activate\` so installs are reproducible.`,
    );
  } else {
    record('ok', 'pnpm', actual);
  }
}

// --- corepack -------------------------------------------------------------
{
  const version = run('corepack', ['--version']);
  record(
    version ? 'ok' : 'warn',
    'corepack',
    version ?? 'not on PATH',
    'corepack ships with Node 24 LTS. If it is missing, the active Node is probably not the pinned one.',
  );
}

// --- Docker ---------------------------------------------------------------
{
  const version = run('docker', ['--version']);
  if (!version) {
    record(
      'fail',
      'Docker',
      'not found',
      'Docker is required for `pnpm dev:infra` (PostgreSQL 18) and Testcontainers integration tests.',
    );
  } else {
    const daemon = run('docker', ['info', '--format', '{{.ServerVersion}}']);
    if (daemon) {
      record('ok', 'Docker', `${version.replace('Docker version ', '')} · daemon ${daemon}`);
    } else {
      record(
        'fail',
        'Docker',
        'installed but daemon unreachable',
        'Start the Docker daemon, or add your user to the `docker` group and re-login.',
      );
    }
  }
}

// --- Docker Compose -------------------------------------------------------
{
  const version = run('docker', ['compose', 'version', '--short']);
  record(
    version ? 'ok' : 'fail',
    'Docker Compose',
    version ?? 'not found',
    'Required by `pnpm dev:infra`.',
  );
}

// --- Rust (desktop only) --------------------------------------------------
{
  const version = run('rustc', ['--version']);
  record(
    version ? 'ok' : 'warn',
    'Rust (apps/desktop)',
    version ?? 'not found',
    'Only needed to build the Tauri desktop app. Safe to ignore otherwise.',
  );
}

// --- Git identity ---------------------------------------------------------
{
  const name = run('git', ['config', 'user.name']);
  const email = run('git', ['config', 'user.email']);
  if (name && email) {
    record('ok', 'Git identity', `${name} <${email}>`);
  } else {
    record(
      'fail',
      'Git identity',
      'user.name or user.email not configured',
      'Set them for this repository: `git config user.name "..."` and `git config user.email "..."`.\n' +
        '    FINCH requires human authorship on every commit (README §71).',
    );
  }
}

// --- Environment file -----------------------------------------------------
{
  const example = join(ROOT, '.env.example');
  const local = join(ROOT, '.env');
  if (!existsSync(example)) {
    record('warn', 'Env template', '.env.example missing');
  } else if (!existsSync(local)) {
    record(
      'warn',
      'Env file',
      '.env not found',
      'Copy it: `cp .env.example .env`. Never commit .env — it is gitignored by design.',
    );
  } else {
    record('ok', 'Env file', '.env present');
  }
}

// --- Ports ----------------------------------------------------------------
function portFree(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: '127.0.0.1' });
    socket.setTimeout(400);
    socket.on('connect', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(true));
  });
}

const PORTS = [
  [5432, 'PostgreSQL (dev:infra)'],
  [3000, 'apps/web'],
  [3001, 'apps/admin'],
  [4000, 'apps/api'],
  [8081, 'Expo / Metro'],
];

const portStates = await Promise.all(PORTS.map(([port]) => portFree(port)));
PORTS.forEach(([port, owner], index) => {
  const free = portStates[index];
  record(
    free ? 'ok' : 'warn',
    `Port ${port}`,
    free ? `free (${owner})` : `in use — expected by ${owner}`,
  );
});

// --- Report ---------------------------------------------------------------
const icon = {
  ok: `${C.green}OK  ${C.reset}`,
  warn: `${C.yellow}WARN${C.reset}`,
  fail: `${C.red}FAIL${C.reset}`,
};

console.log(`\n${C.bold}FINCH environment doctor${C.reset} ${C.dim}(README §81)${C.reset}\n`);
const width = Math.max(...results.map((r) => r.name.length));
for (const r of results) {
  console.log(`  ${icon[r.status]}  ${r.name.padEnd(width)}  ${C.dim}${r.detail}${C.reset}`);
}

const failures = results.filter((r) => r.status === 'fail');
const warnings = results.filter((r) => r.status === 'warn' && r.fix);

if (warnings.length > 0) {
  console.log(`\n${C.yellow}${C.bold}Warnings${C.reset}`);
  for (const w of warnings) console.log(`  ${C.bold}${w.name}${C.reset}\n    ${w.fix}`);
}

if (failures.length > 0) {
  console.log(`\n${C.red}${C.bold}Blocking problems${C.reset}`);
  for (const f of failures) {
    console.log(`  ${C.bold}${f.name}${C.reset}: ${f.detail}\n    ${f.fix}`);
  }
  console.log(`\n${C.red}Environment is not ready.${C.reset}\n`);
  process.exit(1);
}

console.log(`\n${C.green}Environment is ready.${C.reset}\n`);
