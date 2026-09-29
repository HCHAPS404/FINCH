# FINCH quality harness

A **harness** is an automatic mechanism that tests a property of the system and fails loudly when it
breaks. Each has an owner, a command and a place in CI. Those that self-test (`--self-test`) also
prove they still work.

| #   | Harness                    | What it protects                                                  | Command                                   | CI                    | Status                              |
| --- | -------------------------- | ----------------------------------------------------------------- | ----------------------------------------- | --------------------- | ----------------------------------- |
| 1   | **Agent context sync**     | Identical rules and skills for Claude, Cursor, Codex, Antigravity | `pnpm ai:check`                           | Quality               | ✅                                  |
| 2   | **Architecture fitness**   | Module and package boundaries                                     | `pnpm architecture:check` (self-test)     | Quality               | ✅                                  |
| 3   | **Security hygiene**       | Secrets, tracked files, audit                                     | `pnpm security:check` (self-test)         | Security              | ✅                                  |
| 4   | **Financial correctness**  | Golden vectors, formula invariants                                | `pnpm financial:verify`                   | Unit                  | ✅ (Money); grows with each formula |
| 5   | **Design tokens**          | AA contrast light/dark, aliases, generated CSS                    | `pnpm --filter @finch/design-tokens test` | Unit                  | ✅                                  |
| 6   | **Authorization**          | Isolation per workspace and shared household                      | negative tests per module                 | Unit                  | S1                                  |
| 7   | **AI evals (CRISP-ML(Q))** | Tool use, grounding, safety, quality, cost                        | `pnpm ai:eval`                            | Nightly + PR (subset) | S2                                  |
| 8   | **Web E2E**                | Catalog flows (happy + failure)                                   | Playwright                                | E2E                   | S1                                  |
| 9   | **Accessibility**          | 0 serious axe issues per screen                                   | Playwright + axe                          | E2E                   | S1                                  |
| 10  | **Visual regression**      | Components and screens in light/dark, 390/1440                    | Playwright screenshots / Storybook        | E2E                   | S1                                  |
| 11  | **Performance**            | Lighthouse ≥ 90 (performance and accessibility)                   | Lighthouse CI                             | E2E                   | S2                                  |
| 12  | **Supply chain**           | SBOM, dependency review, CodeQL                                   | GitHub Actions                            | Security              | ✅                                  |
| 13  | **Platforms**              | Build and smoke test Windows → Android → macOS/iOS                | Per-OS runners / Expo builds              | Release               | Phase 2+                            |

Rules: no harness is disabled or weakened to pass CI; if one is wrong, it is fixed and explained in
the PR (rule `00-core`).
