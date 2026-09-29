# Work delegation by branch

> **Status:** PROPOSED · date: 2026-09-28 · **H** = HELL · **I** = Irene.
> Scope: [`08-feature-catalog.md`](../hackathon/08-feature-catalog.md) · schedule:
> [`05-roadmap-and-timeline.md`](../hackathon/05-roadmap-and-timeline.md) · branching model:
> ADR-0040 · skills: `.ai/skills/`.

## 1. Platform order (founders' decision, 2026-09-28)

| Phase | Platform              | Area branch                    | Window                      | Exit milestone                                                                   |
| ----- | --------------------- | ------------------------------ | --------------------------- | -------------------------------------------------------------------------------- |
| **1** | **Web (PWA)**         | `area/web`                     | 28 Sep → 29 Oct (hackathon) | All 45 H features working at the public URL; Devpost submission.                 |
| **2** | **Windows** (Tauri 2) | `area/desktop`                 | 2 Nov → 22 Nov (on `next`)  | Signed or test Windows installer with Today, Money, FINCH, Opportunities and Me. |
| **3** | **Android** (Expo)    | `area/mobile`                  | 23 Nov → 20 Dec (on `next`) | Installable Android build with the star flows, camera, biometrics and push.      |
| **4** | **macOS + iOS**       | `area/desktop` · `area/mobile` | Jan 2027                    | macOS (Tauri) and iOS (Expo) builds with an Apple Developer account.             |

Web first: **everything is proven and stabilized on web** before porting. The branches
`feat/s0-desktop-shell` and `feat/s0-mobile-shell` stay **parked** until their phases (they are
updated from `main` when the phase starts).

## 2. Ownership per area

| Area branch    | Owner      | Support                              | Main skills                                                                                                                    |
| -------------- | ---------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `area/backend` | **H**      | I (seeds, error copy)                | `domain-module`, `api-endpoint`, `financial-formula`, `ai-component`, `market-truth-source`, `db-migration`, `security-review` |
| `area/design`  | **I**      | H (tokens in code, technical review) | `figma-to-code`, `ui-component`, `design-critique`                                                                             |
| `area/web`     | **I**      | H (data, integration, E2E)           | `premium-screen`, `ui-component`, `design-critique`, `pr-ready`                                                                |
| `area/desktop` | **H**      | I (UI and design review)             | `platform-port`, `security-review`                                                                                             |
| `area/mobile`  | **I** (UI) | H (integration, builds)              | `platform-port`, `ui-component`, `design-critique`                                                                             |

## 3. Tasks per sprint and branch (Phase 1 — web)

### S0 — Foundation (28 Sep → 4 Oct) · `stage/s0-foundation`

| Branch                                          | Owner | Deliverable                                                                                                   | Done when                                                             |
| ----------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `feat/s0-walking-skeleton` (← `area/backend`)   | H     | API health + Nemotron chat via a minimal AI Gateway + CI + deploy                                             | `/api/health` shows the models; one real chat turn at the public URL. |
| `feat/s0-db-schema-personas` (← `area/backend`) | H + I | Schema v1 + seeds for Laura, Andrés and the Pérez household                                                   | `pnpm db:seed` reproducible; synthetic data reviewed by I.            |
| `feat/s0-design-system` (← `area/design`)       | I     | Figma file with the `FIGMA.md` structure, Variables = tokens, typography, 10 base components, B1 and C1 flows | Frames _Ready for dev_; `component-map.md` updated.                   |
| `feat/s0-app-shell-pwa` (← `area/web`)          | I     | Next.js + CSS tokens + 5 destinations + onboarding + PWA                                                      | Navigable at 390 and 1440 px, light/dark; Lighthouse ≥ 90.            |
| `chore/s0-license-credits-setup` (← stage)      | H     | License (after D-01), credits, decimal library (ADR-0016)                                                     | ADR-0016 updated; `credits.md` without keys.                          |
| `docs/s0-research-evidence` (← stage)           | I     | 3–5 official figures + 5 interviews                                                                           | `research.md` with sources and dates.                                 |

### S1 — "My paycheck arrived" (5 → 11 Oct) · `stage/s1-payday`

| Area    | Task branches                                                                                                                                                       | Owner               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| backend | `feat/s1-engine-credit-co` · `feat/s1-engine-personal-finance` · `feat/s1-ai-gateway` · `feat/s1-agent-receipts` · `feat/s1-payday-engine` · `docs/s1-threat-model` | H                   |
| backend | `test/s1-golden-vectors` (independent spreadsheet)                                                                                                                  | I                   |
| design  | `feat/s1-core-components` (Amount, TruthBadge, ReceiptPanel, EnvelopeRow, CardUsageMeter, PaydayPlan)                                                               | I                   |
| web     | `feat/s1-payday-ui` · `feat/s1-money-screens` · `feat/s1-afford-ui` · `feat/s1-receipt-panel`                                                                       | I (+ H integration) |

### S2 — Market, capture and decide (12 → 18 Oct) · `stage/s2-market-capture-decide`

| Area    | Task branches                                                                                                                                                                                                | Owner |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| backend | `feat/s2-market-truth-tavily` · `feat/s2-opportunity-engine` · `feat/s2-import-recurring-anomalies` · `feat/s2-receipt-pipeline` · `feat/s2-decision-cards-ultra` · `feat/s2-memory` · `feat/s2-rights-docs` | H     |
| design  | `feat/s2-decision-patterns` (DecisionCard, SecondOpinionBanner, FreshnessStamp) · `feat/s2-brand-motion` (Rive/Lottie)                                                                                       | I     |
| web     | `feat/s2-opportunities-ui` · `feat/s2-camera-capture-ui` · `feat/s2-simulators-ui` · `feat/s2-rights-flows`                                                                                                  | I     |
| evals   | `test/s2-eval-datasets`                                                                                                                                                                                      | I     |

### S3 — Complete the 45 features (19 → 25 Oct) · `stage/s3-complete`

| Area    | Task branches                                                                                                                                                                                                                                  | Owner          |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| backend | `feat/s3-vault` · `feat/s3-nl-query` · `feat/s3-household` · `feat/s3-watcher-briefing` · `feat/s3-email-channel` · `feat/s3-fixed-costs-remittances` · `feat/s3-passport` · `feat/s3-tax-co` · `feat/s3-second-country` · `chore/s3-demo-ops` | H              |
| web     | `feat/s3-vault-ui` · `feat/s3-household-ui` · `feat/s3-protection-habits-close` · `feat/s3-push-ics` · `feat/s3-premium-polish`                                                                                                                | I              |
| evals   | `test/s3-evals-toloka`                                                                                                                                                                                                                         | I (+ H runner) |

### S4 — Freeze and submission (26 → 29 Oct) · `stage/s4-release`

`fix/s4-bug-bash-*` (both) · `docs/s4-readme-devpost` (I) · `chore/s4-release` (H) · skill
`hackathon-submission`.

## 4. Phases 2–4 (after submission, on `next`)

| Phase           | Branches                                                                                                                    | Owner                           | Contents                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 2 · Windows     | `feat/p2-desktop-shell-windows` · `feat/p2-desktop-native-integration` · `chore/p2-windows-installer-ci`                    | H (+ I UI review)               | Tauri 2 with `packages/ui-web`, menus, shortcuts, notifications, drag-and-drop import, `windows-latest` runner, installer. |
| 3 · Android     | `feat/p3-ui-mobile-kit` · `feat/p3-mobile-core-flows` · `feat/p3-mobile-camera-biometrics-push` · `chore/p3-android-builds` | I (UI) + H (integration/builds) | Expo, `packages/ui-mobile`, Payday, cards, receipts by camera, biometrics, push, Android build.                            |
| 4 · macOS + iOS | `chore/p4-macos-build-signing` · `feat/p4-ios-adaptations` · `chore/p4-ios-builds`                                          | H + I                           | macOS signing, iOS adjustments (safe areas, gestures), iOS build (Apple Developer).                                        |

## 5. Branch working rules

1. Every task starts from its **area branch**; it integrates into the area by PR (reviewed by the
   other founder) and the area delivers to the stage **at least every 2 days**.
2. Before opening a PR: skill `pr-ready`; with UI: `design-critique`; with R1+ risk:
   `security-review`.
3. Phase 2–4 branches are not created until the previous phase meets its milestone.
4. Scope changes → the catalog (08) first, with both founders' agreement.
