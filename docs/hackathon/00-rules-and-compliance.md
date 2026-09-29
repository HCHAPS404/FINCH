# 00 — Official rules and compliance

Source: the Nebius x NVIDIA Global AI Hackathon Official Rules (Devpost), text provided by the
founders on 2026-09-28. **If anything here contradicts the official rules, the rules win.** Re-read
<https://nebiusglobalaihackathon.devpost.com/rules> before submitting: the sponsor may amend them
(rules §11).

---

## 1. Dates (converted to Colombia time, UTC-5, no daylight saving)

| Milestone               | Official time                                  | Colombia time               | Note                                                |
| ----------------------- | ---------------------------------------------- | --------------------------- | --------------------------------------------------- |
| Submission Period opens | Wed 26 Aug 2026 09:00 PT (PDT)                 | 26 Aug 11:00                | Already open.                                       |
| **Submission deadline** | **Fri 30 Oct 2026 10:00 PT (PDT, UTC-7)**      | **30 Oct 12:00**            | The submission cannot be edited afterwards.         |
| Judging Period          | 01 Dec 09:00 PT (PST, UTC-8) → 15 Dec 12:00 PT | 01 Dec 12:00 → 15 Dec 15:00 | **Demo live and free for judges the whole period.** |
| Winners announced       | ~Mon 11 Jan 2027 12:00 PT                      | ~11 Jan 15:00               | Affidavits follow (10 business days).               |

> US daylight saving time ends on 1 Nov 2026, so the deadline uses PDT (UTC-7) and the judging
> period uses PST (UTC-8).

**Internal deadline:** complete submission on **Thursday 29 Oct before 18:00**. 30 Oct is used only
if Devpost or YouTube fail.

## 2. Eligibility

- Colombia is **not** excluded (exclusions: Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea
  and countries under comprehensive OFAC sanctions).
- Both founders must be of legal age in their country.
- **Recommended entry: Team** (HELL + Irene) with **HELL as Representative**. The prize is paid to
  the Representative, who allocates it to the team. Alternative: enter as an _Organization_, only if
  the company (e.g. an S.A.S.) **already exists at submission time**; payment then goes to the
  company's account (see [07](07-risks-and-decisions.md), D-05).
- No prior financial or preferential support from Nebius or Devpost (not applicable).
- No judge may employ either founder (check once judges are published).

## 3. Project requirements → how FINCH meets them

| Rule              | Key text                                                                                                    | FINCH compliance                                                                                                                                                                  | Evidence                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Runs on Nebius    | "makes a runtime call to the Token Factory inference API, or is deployed/run using Nebius AI Cloud compute" | **Both.** All inference goes through Token Factory (OpenAI-compatible API). The nightly _Watcher_ runs as a **Nebius Serverless Job** (target; fallback in ADR-0038).             | `GET /api/health` shows provider and models; LangSmith traces; video.  |
| NVIDIA open model | "uses at least one NVIDIA open source model"                                                                | Nemotron 3.5 Lightning, Nemotron 3 Super and Nemotron 3 Ultra (see [04](04-ai-design-safety-evals.md)).                                                                           | Model registry in `packages/ai-core`; README; video.                   |
| Track             | "fits into one of the four hackathon tracks"                                                                | **Personal AI Track** (recommended; see [01](01-strategy-and-track.md)).                                                                                                          | Devpost form.                                                          |
| Stage One         | "genuine attempt at the track's stated goal, not a superficial rebrand"                                     | The product _is_ a private, always-on personal assistant with memory, skills, tools and tasks; every phrase of the track definition maps to an explicit feature (table in 01 §3). | Traceability table in the judges' README.                              |
| Functionality     | "installed and running consistently… function as depicted"                                                  | Stable public demo, preloaded synthetic data, reproducible seed, health checks, graceful degradation without AI.                                                                  | Uptime monitor; demo runbook.                                          |
| New & Existing    | "newly created… or significantly updated after the start"                                                   | The repository was created on **17 Sep 2026** (first commit), **after** 26 Aug: a new project within the period. The timeline is documented anyway.                               | `git log`; "Built during the Submission Period" section of the README. |
| Third-party       | "must be authorized to use them"                                                                            | Nebius, Tavily, LangSmith and Toloka are used under their terms; any third-party model under its license. Colombian public sources: read-only, with citation.                     | `THIRD_PARTY.md` (task S3-11).                                         |

## 4. Submission requirements → checklist

Tick every box in the submission PR. **If one is missing, the entry can fail Stage One.**

- [ ] **Demo URL** working without mandatory login ("Try as a persona") or with credentials in the
      testing instructions. Free and unrestricted until 15 Dec.
- [ ] **Description** in English with features (draft in [06](06-submission-kit.md)).
- [ ] **Public GitHub repository** with an **OSI license detected by GitHub** and visible in _About_
      (Apache-2.0 recommended, ADR-0037). Check the _About_ panel shows "Apache-2.0 license".
- [ ] The repository contains **all** code, assets and instructions needed to run it.
- [ ] **English README** with setup, how to run it, **how Nemotron is used, where Token Factory
      accelerated the work and which other Nebius services are used**.
- [ ] **Video < 3:00** (aim for 2:50), **public on YouTube**, showing the project running on its
      target device (browser and a phone with the installed PWA), with **audio explaining the use of
      Token Factory and Nemotron**. No copyrighted music or third-party marks without permission:
      royalty-free music with a recorded license, or none. No real bank logos.
- [ ] **Track** selected: Personal AI.
- [ ] **Feedback** on Token Factory, AI Cloud and NVIDIA tools — complete and concrete (it also
      competes for _Most Valuable Feedback_, 10 × USD 100 + swag).
- [ ] Statement of "what was built during the period" (declare it even though the project is new).
- [ ] All materials in **English**: video (English audio or subtitles), description and testing
      instructions.
- [ ] Builders & Brews city: **not applicable** unless a founder attends a listed city event.

## 5. Judging criteria (Stage Two, equally weighted)

| Criterion                                            | Judges' question                                                                                  | What wins it for FINCH                                                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Technological Implementation** (first tie-breaker) | How well is it built and how effectively does it use Token Factory/AI Cloud and Nemotron?         | Lightning/Super/Ultra tiered routing with cost and latency metrics; tool calling; _structured outputs_; Serverless Job; batch inference for evals; deterministic number verifier; green tests and CI. |
| **Design**                                           | A complete, coherent product experience rather than a proof of concept?                           | 60-second onboarding, Decision Cards, clickable receipts, visible and editable memory, dark mode, bilingual UI, consistent brand, PWA with its own push.                                              |
| **Potential Impact**                                 | A credible, specific case for a real problem for a real audience, solved in what is demonstrated? | Colombian consumers with cards and consumer credit who cannot compare effective rates, the usury cap or total cost; official data cited (no invented figures); savings demonstrated in pesos.         |
| **Quality of the Idea**                              | A creative, non-obvious use of Token Factory/Nemotron and real understanding of the domain?       | _Proof-carrying answers_: the LLM is never the source of numbers. Ultra as auditing second opinion. Tavily as cited "Market Truth". Colombian rules (EA/MV, usury, GMF).                              |

**Tie-break:** highest _Technological Implementation_ score wins, then _Design_, and so on — so
visible technical quality (tests, evals, metrics) is not optional.

## 6. Prizes and multiple eligibility

| Prize                      | Amount                      | Reachable for FINCH?                                                          |
| -------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| Grand Prize                | USD 20,000                  | Yes — the target. Competes across all tracks.                                 |
| 2nd / 3rd                  | USD 10,000 / 6,000          | Yes.                                                                          |
| Personal AI Track Winner   | 1 × NVIDIA Jetson Orin Nano | Yes.                                                                          |
| Best Use of Tavily (bonus) | USD 3,000                   | Yes: Tavily is central to the product, not decorative.                        |
| Most Valuable Feedback     | 10 × USD 100 + swag         | Yes: low effort, high return.                                                 |
| City Winner                | 20 × USD 500                | Only when attending a listed Builders & Brews event (Colombia is not listed). |

> **Critical rule:** "Each Project is eligible for one (1) Overall Award **OR** one (1) Track Award
> **and** one (1) Bonus Award." In practice the maximum is **either** an Overall award (e.g. USD
> 20,000) **or** Track (Jetson) + Bonus (USD 3,000). If the wording seems ambiguous, rules §11 allow
> a written clarification request: **email support@devpost.com in week 0** (task S0-11).

**Taxes and payment:** the winner bears wire and FX fees. Form W-8BEN may be required and the
sponsor may withhold under applicable law. In Colombia, prizes are usually taxed as occasional gains.
**Confirm with an accountant** before projecting a net amount (see 07, D-06). No net figure is given
here, to avoid inventing rates or withholdings.

## 7. Intellectual property and publicity

- The submission remains the authors' property. Nebius receives a non-exclusive license **for
  judging only** and may promote it, with the participants' names and likeness, for 3 years.
- Using AI tools (Claude, Cursor) to write code is compatible: the work belongs to the founders.
  AGENTS.md §1 already forbids attributing authorship to AI in the history.
- Third-party open source: allowed when its licenses are respected and FINCH **builds on top of it**.
- **Brand:** Apache-2.0 grants **no** rights to the FINCH name or logo (Apache-2.0 §6). A
  `TRADEMARKS.md` file is added (ADR-0037).

## 8. Traps that disqualify or cost points (and the countermeasure)

| Trap                                       | Countermeasure                                                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Demo down or out of credit during 1–15 Dec | Credit reserved for judging, a _credit guard_ degrading to template explanations, uptime monitor alerting both founders (task S3-09). |
| License not visible in _About_             | Standard `LICENSE` file at the root; check the panel before submitting.                                                               |
| Video > 3:00 or private                    | Time it at 2:50; upload as **Public** (not "Unlisted"); test the link in a private window.                                            |
| Third-party music or marks in the video    | No bank logos; royalty-free music with its license recorded in `docs/hackathon/media-licenses.md`.                                    |
| Materials not in English                   | Description, README and instructions in English; English subtitles; bilingual UI.                                                     |
| Perceived "rebrand" (Stage One)            | Explicit track → feature table; demonstrate memory, skills, always-on and privacy.                                                    |
| Secrets in the public repository           | `pnpm security:check` + gitleaks in CI; rotate any exposed key.                                                                       |
| Changing the submission after the deadline | Tag `v0.1.0-hackathon`; `main` frozen for judging (see 05 §4).                                                                        |
