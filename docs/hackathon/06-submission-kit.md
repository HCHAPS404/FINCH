# 06 — Kit de envío (Devpost, video, README y feedback)

Todo lo que ve el jurado va **en inglés** (regla de idioma). Los textos entre `[corchetes]` se
llenan con datos **reales** medidos o investigados. Nunca se completan con cifras inventadas.

---

## 1. Texto de Devpost (borrador en inglés)

**Project name:** FINCH: your private, always-on personal CFO

**Elevator pitch (≤ 200 chars):**

> A private personal-finance agent for Colombia. Nemotron reasons and explains; deterministic math decides. Every number comes with a receipt.

**Track:** Personal AI · **Bonus:** Best Use of Tavily

### Inspiration

In Colombia, the same loan can be quoted as an effective annual rate, a monthly rate or a nominal
rate, with insurance, handling fees and a 0.4% transaction tax on top. There is also a legal
interest cap, the _tasa de usura_, certified by the Financial Superintendence and updated
periodically. [Insert 2–3 official statistics with source links from `research.md`.] Generic AI
chatbots make this worse: they confidently invent numbers. In personal finance, a hallucinated
number is a real harm.

### What it does

- **Understands** your finances through a Financial Twin: facts you control, each with its source.
- **Decides with math, not vibes.** Nemotron orchestrates versioned financial skills (rate
  conversion, amortization, total cost of credit, usury check, refinancing comparison, 30-day
  forecast, safe-to-spend).
- **Proof-carrying answers.** The model is not allowed to write numbers. It writes placeholders
  that point to calculation receipts. A deterministic verifier rejects any figure without a
  receipt. Click any number to see its formula, version, inputs and sources.
- **Second opinion.** Nemotron 3 Ultra audits every Decision Card for missing costs and wrong
  assumptions before you see it.
- **Market Truth with Tavily.** It reads the current usury cap and reference rates from official
  sources, plus public refinancing offers. Each value carries its URL, retrieval time and freshness.
- **Always-on.** A nightly watcher running on Nebius Serverless Jobs recomputes your Twin, checks
  the market and pings you on Telegram when something changes.
- **Private and yours.** PII is redacted before any model call. You see, edit and forget
  everything FINCH remembers. Export or delete your data anytime. FINCH never moves money.

### How we built it

- **NVIDIA Nemotron on Nebius Token Factory**, tiered:
  - _Nemotron 3.5 Lightning_ for routing, extraction and quick replies: [X]% of calls.
  - _Nemotron 3 Super_ as the tool-calling agent.
  - _Nemotron 3 Ultra_ for the second opinion and as eval judge.
  - [Multimodal model] for document extraction.
  - [Embedding model] for memory and [guard model] for safety.
- Token Factory **structured outputs and function calling** for every contract; **batch inference**
  to run our full eval suite at lower cost.
- **Nebius AI Cloud Serverless Jobs** run the always-on watcher.
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

Closed alpha in Colombia (Q1 2027), a real data provider, native mobile apps and a FINCH MCP
server so any personal agent can use FINCH as its financial brain. FINCH will never take
commissions that bias its rankings.

### Built during the Submission Period

The FINCH repository was created on 2026-09-17, after the Submission Period opened (2026-08-26).
Everything shown was built during the Submission Period.

### Built with

`nvidia-nemotron` `nebius-token-factory` `nebius-ai-cloud` `tavily` `langsmith` `toloka`
`typescript` `nextjs` `nestjs` `postgresql` `pgvector` `telegram`

### Testing instructions (for judges)

1. Open [DEMO_URL]. Choose **"Try as Laura"**; no sign-up needed.
2. Ask: _"Is it worth moving my credit card balance to the 1.6% monthly refinancing offer?"_
3. Click any underlined number to open its receipt.
4. Open **Watcher → Run now** to trigger the always-on job.
5. Optional: open **Settings → Telegram** and scan the code to receive alerts.
6. Optional: upload `fixtures/documents/sample-offer.pdf` (synthetic).

All data in demo personas is synthetic.

---

## 2. Guion del video (2:50, inglés, UI en inglés con cambio a español en un momento)

| Tiempo    | Imagen                                                                                                                  | Voz (EN)                                                                                                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0:00–0:15 | Logo animado → una tasa confusa en pantalla ("2.3% MV + seguro + cuota de manejo")                                      | "In Colombia, the same loan can be quoted three different ways, plus hidden costs. And AI chatbots invent numbers. We built FINCH, a private, always-on personal CFO that never makes numbers up."                 |
| 0:15–0:35 | Landing → "Try as Laura" → Twin                                                                                         | "FINCH keeps a Financial Twin of your money. Every fact shows where it came from, and you control what it can use."                                                                                                |
| 0:35–1:05 | Laura pregunta por la compra de cartera; se ven los tool calls en vivo                                                  | "Nemotron 3.5 Lightning routes the request. Nemotron 3 Super, on Nebius Token Factory, calls our deterministic financial skills: rate conversion, total cost, usury check."                                        |
| 1:05–1:30 | Clic en una cifra → panel del recibo (fórmula@versión, entradas, URL de la SFC vía Tavily)                              | "Here's the trick: the model isn't allowed to write numbers. It cites receipts. Every figure is computed, versioned and sourced, like this usury cap Tavily pulled from the official regulator page this morning." |
| 1:30–1:55 | Decision Card + banner "Second opinion: Nemotron 3 Ultra, 1 warning" + chip de memoria "Used: pay card before December" | "Before any recommendation reaches Laura, Nemotron 3 Ultra audits it. Here it flagged insurance costs. FINCH also remembers her goals, and she can see or forget any memory."                                      |
| 1:55–2:15 | Pantalla Vigía → "Run now" → notificación en el celular por Telegram                                                    | "FINCH is always on. Every morning a Nebius Serverless Job re-checks the market and her finances, and messages her only when something changes."                                                                   |
| 2:15–2:30 | Botón "Draft letter to bank" → PDF; switch a español                                                                    | "It can take action safely: it drafts the refinancing request, but it never moves money. And it speaks her language."                                                                                              |
| 2:30–2:45 | Tabla de evals (grounding 100 %, costo por niveles)                                                                     | "We measured it: zero ungrounded numbers, [X]% safety on adversarial tests, and tiered routing at [Y]% of the cost of using a single large model."                                                                 |
| 2:45–2:50 | Logo + tagline + URL del repo                                                                                           | "FINCH. Nemotron explains. Math decides. Every number comes with a receipt."                                                                                                                                       |

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
- **NVIDIA models:** comparación Lightning vs Super vs Ultra en tareas reales (con números de las
  evals), y la calidad en español colombiano.
- **Sugerencias concretas y priorizadas**, cada una con su impacto.

"Completeness, viability, potential impact" es el criterio: feedback con datos y reproducible.
