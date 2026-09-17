# scripts

Repository tooling. All are plain Node ESM, runnable without a build step.

| Script                   | Command                   | What it does                                                                                                                                                    |
| ------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `env-doctor.mjs`         | `pnpm env:doctor`         | Verifies Node, pnpm, corepack, Docker, Rust, git identity, `.env` and ports. Fails with a remediation instruction, never a stack trace.                         |
| `architecture-check.mjs` | `pnpm architecture:check` | Runs dependency-cruiser against the boundary rules. `--self-test` plants a deliberate violation and asserts rejection. `--artifact` emits the dependency graph. |
| `security-check.mjs`     | `pnpm security:check`     | Tracked-file hygiene, gitleaks, dependency audit, lockfile presence. `--self-test` plants a secret and asserts detection.                                       |
| `ai-eval.mjs`            | `pnpm ai:eval`            | AI evaluation harness. Reports PENDING — Foundation ships no AI runtime.                                                                                        |
| `release-verify.mjs`     | `pnpm release:verify`     | Checks the release evidence bundle (README §45) and reports what is missing.                                                                                    |

## Why two of these self-test

A fitness function or a scanner that has silently stopped working is worse than not
having one, because it converts an unenforced rule into false confidence. README §102.14
and §102.15 require demonstrating that a planted secret and a planted boundary violation
actually fail the pipeline — not merely that a scanner is configured. Both self-tests
run in CI.
