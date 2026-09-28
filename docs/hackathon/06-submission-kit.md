# 06 — Kit de envío (Devpost, video, README y feedback)

Todo lo que ve el jurado va **en inglés** (regla de idioma). Los textos entre `[corchetes]` se
llenan con datos **reales** medidos o investigados. Nunca se completan con cifras inventadas.

---

## 1. Texto de Devpost (borrador en inglés)

**Project name:** FINCH: your private, always-on personal CFO

**Elevator pitch (≤ 200 chars):**

> A private, always-on personal CFO. It plans your paycheck, guards your cards and finds money you lose. Nemotron explains; math decides. Every number has a receipt.

**Track:** Personal AI · **Bonus:** Best Use of Tavily

### Inspiration

Most people get paid and then improvise: bills, card payments, debts, savings and "can I afford
this?" all compete for the same money, and the rules are opaque. In Colombia the same loan can be
quoted as an effective annual rate, a monthly rate or a nominal rate, with insurance, handling fees
and a 0.4% transaction tax on top, under a legal interest cap that changes periodically.
[Insert 2–3 official statistics with source links from `research.md`.] Generic AI chatbots make it
worse: they confidently invent numbers. In personal finance, a hallucinated number is real harm.

### What it does

- **Payday Autopilot.** When your income arrives (tap, pasted bank notification, forwarded email or
  statement), FINCH builds your month in seconds: bills by due date, debt minimums, emergency fund,
  goals, investing and what is truly free to spend, with an execution checklist.
- **A money manager, not just a wallet.** Envelopes, credit-card control (cut-off and due dates,
  utilisation, the real cost of paying the minimum or splitting into instalments), a financial
  calendar, month-end close, net worth and an explainable financial-health score.
- **Decide before you spend.** "Can I afford this?", what-if simulations, storm mode (runway if
  income stops), goals with explicit trade-offs and an educational investment simulator.
- **Find money you are losing.** Subscription detective, anomaly checks and an Opportunity Engine
  that compares credits, refinancing, CDTs and savings accounts by real net return, with live market
  data from Tavily. Rankings are neutral: no commission ever changes the order.
- **Capture everything.** Photograph receipts and invoices; keep a document vault (insurance, SOAT,
  contracts, warranties) that tracks expiry dates; ask questions about your money in plain language.
- **Shared and protected.** Household finances where each member chooses what to share, fair
  splitting and settlement, a protection radar, a revocable financial passport and a consumer-rights
  copilot that drafts claims.
- **Proof-carrying answers.** The model is not allowed to write numbers. It writes placeholders that
  point to calculation receipts; a deterministic verifier rejects any figure without one. Click any
  number to see its formula, version, inputs and sources. Nemotron 3 Ultra audits every
  recommendation before you see it.
- **Always-on and private.** A daily watcher on Nebius Serverless Jobs re-checks your finances and
  the market and notifies you inside the FINCH app. PII is redacted before any model call; you see,
  edit and forget everything FINCH remembers. FINCH never moves money.
- **Global-ready.** Multi-currency with live reference FX, deep Colombian rules and a second-country
  pack.

### How we built it

- **NVIDIA Nemotron on Nebius Token Factory**, tiered:
  - _Nemotron 3.5 Lightning_ for routing, extraction and quick replies: [X]% of calls.
  - _Nemotron 3 Super_ as the tool-calling agent.
  - _Nemotron 3 Ultra_ for the second opinion and as eval judge.
  - [Multimodal model] for receipts, invoices and documents in the vault.
  - [Embedding model] for memory and [guard model] for safety.
- Token Factory **structured outputs and function calling** for every contract; **batch inference**
  to run our full eval suite at lower cost.
- **Nebius AI Cloud Serverless Jobs** run the always-on watcher and daily briefing.
- **Tavily** Search + Extract, with a domain allowlist and deterministic parsers.
- TypeScript monorepo: Next.js web, NestJS/Fastify API, and a pure financial engine with bigint
  money and versioned formulas. PostgreSQL + pgvector. **LangSmith** tracing, **Toloka** human
  evaluation.

**Measured results** (from `evals/RESULTS.md`):

| Metric                                        | Result                    |
| --------------------------------------------- | ------------------------- |
| Financial math golden vectors                 | [n/n]                     |
| Tool-call accuracy                            | [..%]                     |
| Ungrounded numbers shown to users             | [0] (pre-verifier: [..%]) |
| Adversarial safety                            | [..%]                     |
| Human-rated explanation quality (Toloka, 1–5) | [..]                      |
| Cost per conversation, tiered vs all-Super    | [$.. vs $..]              |

### Challenges we ran into

[Real ones, written on Oct 28: e.g. parsing official rate publications, keeping the model from
writing digits, Spanish number formats.]

### Accomplishments that we're proud of

[e.g. zero ungrounded numbers; the second-opinion catching a missing insurance cost.]

### What we learned

[Honest learnings about tiered routing and the cost/quality trade-off.]

### What's next for FINCH

Closed alpha in Colombia (Q1 2027), native mobile apps, open-finance data, WhatsApp and SMS
channels, and later a regulated partner so Payday Autopilot can execute transfers, not just plan
them. FINCH will never take commissions that bias its rankings.

### Built during the Submission Period

The FINCH repository was created on 2026-09-17, after the Submission Period opened (2026-08-26).
Everything shown was built during the Submission Period.

### Built with

`nvidia-nemotron` `nebius-token-factory` `nebius-ai-cloud` `tavily` `langsmith` `toloka`
`typescript` `nextjs` `nestjs` `postgresql` `pgvector` `pwa` `web-push`

### Testing instructions (for judges)

1. Open [DEMO_URL] (install it as an app if you like). Choose **"Try as Laura"**; no sign-up needed.
2. On **Today**, tap **"My paycheck arrived"** and watch the month plan appear.
3. Tap any underlined number to open its receipt.
4. Open the **FINCH** tab and ask: _"Can I afford 800,000 pesos headphones this week?"_
5. Open **Opportunities** to see refinancing and CDT options with live sources.
6. Open **Me → Watcher → Run now** to trigger the always-on job and receive an in-app notification.
7. Optional: photograph any receipt, or upload `fixtures/documents/sample-soat.pdf` (synthetic) to the vault.

All data in demo personas is synthetic.

---

## 2. Guion del video (2:50, inglés, UI en inglés con cambio a español en un momento)

| Tiempo    | Imagen                                                                                                                                                 | Voz (EN)                                                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:12 | Logo → notificación bancaria "Recibiste $4.200.000"                                                                                                    | "Payday. Now what? Bills, cards, debts, savings — most of us improvise. And AI chatbots invent numbers. Meet FINCH: a private, always-on personal CFO."                                                                                                              |
| 0:12–0:40 | Laura toca "Me llegó el sueldo" → plan del mes se construye en vivo (sobres, fechas, checklist)                                                        | "FINCH detects the paycheck and plans the whole month in seconds: bills by due date, card payments, emergency fund, goals. Nemotron 3.5 Lightning reads the notification; Nemotron 3 Super orchestrates our deterministic financial skills on Nebius Token Factory." |
| 0:40–1:00 | Toque en una cifra → panel del recibo (fórmula@versión, entradas, fuente)                                                                              | "Here's the trick: the model isn't allowed to write numbers. It cites receipts. Every figure is computed, versioned and sourced."                                                                                                                                    |
| 1:00–1:20 | Tarjetas: "pagar el mínimo te cuesta X" → banner de Ultra: "tarjeta a 1,1 pp de la usura" → Oportunidades: compra de cartera y CDT con URLs vía Tavily | "Nemotron 3 Ultra audits every recommendation. It flagged a card close to the legal cap, and Tavily brought live refinancing and deposit options from official and public sources."                                                                                  |
| 1:20–1:40 | "¿Me lo puedo permitir?" audífonos → "Espera al día 12" · simulador "¿Y si…?"                                                                          | "Before you spend, FINCH shows the real impact — and what happens if you lose your income, buy a motorbike or change jobs."                                                                                                                                          |
| 1:40–2:00 | Foto de recibo → gasto registrado · SOAT en la bóveda → recordatorio · detective de suscripciones                                                      | "Snap a receipt, drop your insurance in the vault, and FINCH tracks expiry dates and subscriptions you forgot."                                                                                                                                                      |
| 2:00–2:15 | Hogar Pérez: gastos compartidos y liquidación · "Lo que FINCH sabe de ti"                                                                              | "Share finances with your partner — each person chooses what to share. And you control everything FINCH remembers."                                                                                                                                                  |
| 2:15–2:30 | Vigía → push de la app en el celular · briefing de la mañana · cambio a español y a USD                                                                | "It's always on: a Nebius Serverless Job re-checks everything daily and notifies you in the app. Multi-currency, live FX, and it speaks your language."                                                                                                              |
| 2:30–2:45 | Tabla de evals                                                                                                                                         | "We measured it: zero ungrounded numbers, [X]% safety on adversarial tests, and tiered routing at [Y]% of the cost of a single large model."                                                                                                                         |
| 2:45–2:50 | Logo + tagline + URL                                                                                                                                   | "FINCH. Nemotron explains. Math decides. Every number comes with a receipt."                                                                                                                                                                                         |

**Reglas de producción:** grabar en 1080p; sin logos de bancos ni marcas de terceros (salvo
mencionar Nebius, NVIDIA y Tavily como tecnologías usadas); música libre de regalías con licencia
anotada, o sin música; subtítulos EN incrustados; título en YouTube: _"FINCH: private, always-on
personal CFO | Nebius x NVIDIA Global AI Hackathon"_; visibilidad **Pública**.

## 3. README para jurados (estructura)

El README raíz en inglés debe tener, en este orden:

1. Logo + tagline + badges (license, CI) + enlaces: **Demo · Video · Devpost**.
2. _What is FINCH_ (3 líneas) + GIF de 10 s.
3. **How we use NVIDIA Nemotron and Nebius** (tabla modelo → uso → porcentaje de llamadas → costo),
   _where Token Factory accelerated our workflow_ (batch evals, structured outputs, cambiar de
   modelo sin reescribir código) y _other Nebius services_ (Serverless Jobs, …).
4. **Personal AI track mapping** (tabla de 01 §3).
5. Architecture (diagrama de 03 §1).
6. **Quickstart** (≤ 10 comandos): `nvm use`, `corepack enable`, `pnpm install`, `cp .env.example .env`,
   `pnpm dev:infra`, `pnpm db:seed`, `pnpm dev`.
7. Evals: cómo correrlas y resultados.
8. Safety & privacy.
9. License (Apache-2.0) + Trademarks + Third-party notices.
10. Enlace a la Constitución de ingeniería (el documento en español).

## 4. Feedback para Nebius/NVIDIA (compite por _Most Valuable Feedback_)

Llevar un **log de fricción** desde el día 1 (`docs/hackathon/feedback-log.md`): fecha, qué se
intentó, qué pasó, cuánto tiempo costó y la sugerencia. El 28-oct se condensa en:

- **Token Factory:** onboarding, descubrimiento de IDs de modelos, calidad del tool calling de
  cada Nemotron en español, structured outputs, latencias observadas, experiencia con batch,
  claridad de precios y consumo de créditos, límites de tasa.
- **AI Cloud:** Serverless Jobs (programación, logs, cold start), endpoints y CLI.
- **Multimodal:** calidad de extracción de recibos y documentos colombianos (con números de E1).
- **NVIDIA models:** comparación Lightning vs Super vs Ultra en tareas reales (con números de las
  evals), y la calidad en español colombiano.
- **Sugerencias concretas y priorizadas**, cada una con su impacto.

"Completeness, viability, potential impact" es el criterio: feedback con datos y reproducible.
