#!/usr/bin/env node
/**
 * FINCH local security gate — README §12, §40, §43, §102.14.
 *
 * Runs the checks that are cheap enough to run before every commit. The full gate
 * (CodeQL, dependency review, container scan, SBOM) lives in CI — see
 * .github/workflows/pr-gate.yml.
 *
 * `--self-test` plants a realistic-looking secret and asserts the scanner rejects it.
 * README §102.14 requires demonstrating that a secret injection actually fails the
 * pipeline, not merely that a scanner is configured.
 *
 * Exit codes: 0 = clean, 1 = finding or broken scanner.
 */
import { execFileSync, execSync } from 'node:child_process';
import { writeFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ESC = String.fromCharCode(27);
const C = {
  reset: `${ESC}[0m`,
  red: `${ESC}[31m`,
  green: `${ESC}[32m`,
  yellow: `${ESC}[33m`,
  dim: `${ESC}[2m`,
  bold: `${ESC}[1m`,
};

let failed = false;
const step = (name) => console.log(`\n${C.bold}${name}${C.reset}`);
const ok = (msg) => console.log(`  ${C.green}OK${C.reset}    ${msg}`);
const warn = (msg) => console.log(`  ${C.yellow}WARN${C.reset}  ${msg}`);
const fail = (msg) => {
  failed = true;
  console.log(`  ${C.red}FAIL${C.reset}  ${msg}`);
};

function has(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// --------------------------------------------------------------------------
// 1. Nothing sensitive is tracked by git.
// --------------------------------------------------------------------------
step('Tracked-file hygiene');
{
  const FORBIDDEN = [
    /(^|\/)\.env$/,
    /(^|\/)\.env\.(?!example)/,
    /\.(pem|key|p8|p12|pfx|jks|keystore|mobileprovision)$/,
    /(^|\/)credentials$/,
    /\.tfstate/,
    /service-account.*\.json$/,
  ];

  let tracked = [];
  try {
    tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    warn('not a git repository — skipping tracked-file scan');
  }

  const offenders = tracked.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  if (offenders.length > 0) {
    for (const f of offenders) fail(`sensitive file is tracked by git: ${f}`);
    console.log(
      `\n  ${C.dim}Removing the file is not enough — it stays in history. Rotate the credential\n` +
        `  first, then purge it (README §12, §40).${C.reset}`,
    );
  } else {
    ok(`${tracked.length} tracked files, none matching the sensitive-file denylist`);
  }
}

// --------------------------------------------------------------------------
// 2. gitleaks
// --------------------------------------------------------------------------
step('Secret scan (gitleaks)');
if (!has('gitleaks')) {
  warn('gitleaks not installed locally — CI still enforces it (.github/workflows/pr-gate.yml)');
  warn('install: https://github.com/gitleaks/gitleaks#installing');
} else {
  const runGitleaks = () => {
    try {
      execFileSync(
        'gitleaks',
        ['dir', '.', '--config', join(ROOT, '.gitleaks.toml'), '--no-banner', '--redact'],
        {
          cwd: ROOT,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      return { clean: true };
    } catch (error) {
      return { clean: false, output: `${error.stdout ?? ''}${error.stderr ?? ''}` };
    }
  };

  if (process.argv.includes('--self-test')) {
    const probe = join(ROOT, 'security-probe.tmp.ts');
    // A fabricated GitHub personal access token. Chosen empirically: gitleaks 8.30.1's
    // default ruleset reliably flags the `ghp_` pattern, whereas a bare AWS access key
    // id assigned to a variable did NOT trip it during verification. Picking the probe
    // by testing rather than by assumption is the whole point — a self-test built on a
    // pattern the scanner ignores would report a false failure forever.
    //
    // The value is random and not a real credential, and it is removed in the `finally`
    // block below whether or not the scan succeeds.
    const planted = `export const token = 'ghp_${'wWPw5k4aXcaT4fNP0UcnZwJUVFk6LO0pINUx'}';\n`;
    writeFileSync(probe, planted, 'utf8');
    let caught;
    try {
      caught = !runGitleaks().clean;
    } finally {
      rmSync(probe, { force: true });
    }
    if (!caught) {
      fail(
        'self-test: gitleaks did NOT detect a planted secret — the scanner is not protecting this repo',
      );
      console.log(
        `\n  ${C.dim}Every "secret scan clean" result is untrustworthy until this is fixed\n` +
          `  (README §102.14).${C.reset}`,
      );
    } else {
      ok('self-test: planted secret was detected and rejected');
    }
  }

  const result = runGitleaks();
  if (result.clean) ok('no secrets detected');
  else {
    fail('gitleaks reported findings');
    console.log(`${C.dim}${(result.output ?? '').slice(0, 4000)}${C.reset}`);
  }
}

// --------------------------------------------------------------------------
// 3. Dependency audit
// --------------------------------------------------------------------------
step('Dependency audit');
if (!existsSync(join(ROOT, 'node_modules'))) {
  warn('dependencies not installed — run `pnpm install` first');
} else {
  try {
    execFileSync('pnpm', ['audit', '--audit-level', 'high', '--prod'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    ok('no high or critical advisories in production dependencies');
  } catch (error) {
    fail('pnpm audit reported high/critical advisories');
    console.log(`${C.dim}${`${error.stdout ?? ''}`.slice(0, 4000)}${C.reset}`);
  }
}

// --------------------------------------------------------------------------
// 4. Lockfile presence
// --------------------------------------------------------------------------
step('Supply chain');
if (existsSync(join(ROOT, 'pnpm-lock.yaml')))
  ok('pnpm-lock.yaml present (installs are reproducible)');
else fail('pnpm-lock.yaml missing — installs are not reproducible (README §43)');

// --------------------------------------------------------------------------
console.log('');
if (failed) {
  console.log(`${C.red}${C.bold}Security check failed.${C.reset}`);
  console.log(
    `${C.dim}Do not weaken a control to make this pass. Stop, explain, propose (README §42).${C.reset}\n`,
  );
  process.exit(1);
}
console.log(`${C.green}${C.bold}Security check passed.${C.reset}\n`);
