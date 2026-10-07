# 05 — Roadmap y cronograma

Alcance: **[08-feature-catalog.md](08-feature-catalog.md)** — **45 funciones H** (todas completas); las **P**
quedan documentadas. Convenciones heredadas del plan original de 2 personas: **H** = HELL, **N** =
Nairy (ver nota de 2026-10-07 en §0 y §2 — ya no hay segunda persona, todo es HELL). Sin segunda
persona, la autorevisión de README-DEVELOPERS.md §3 reemplaza la revisión de PR cruzada. IDs de
funciones (A1, B1…) según el catálogo.

---

## 0. Capacidad vs esfuerzo (honesto)

> **Actualizado 2026-10-07 — proyecto de un solo fundador.** Nairy ya no participa; HELL ejecuta
> solo, el alcance y las fechas de este documento **se mantienen sin recortar** (decisión explícita
> de HELL). Esto es una apuesta deliberada, no una corrección del plan: la cuenta de capacidad de
> abajo ya reconocía que 2 personas estaban ajustadas; con 1 persona el déficit de horas-humano es
> real y mayor del que el plan original absorbía. Se cubre apoyándose mucho más en Claude y Cursor
> para el trabajo que no exige juicio humano directo — no porque eso iguale la capacidad, sino porque
> es la única palanca disponible sin tocar el catálogo. El plan de contingencia (§5) es más probable
> que se active, y más temprano, que en el escenario de 2 personas.

**Capacidad humana:** 1 persona × 8+ h/día × 6 días/semana × ~4,5 semanas (28-sep → 29-oct) ≈ **215 h**
(≈ 250 h si se trabaja también domingos) de tiempo de HELL para decisiones, revisión, pruebas y lo
que ninguna IA puede hacer por él. Claude y Cursor aceleran la implementación repetitiva, pero no
reemplazan pruebas ni decisiones — ver la regla de reparto abajo.

**Reparto de trabajo entre Claude y Cursor** (para no agotar presupuesto ni perder trazabilidad):

- **Claude:** arquitectura, ADRs, specs de fórmulas, threat models, revisión profunda de diffs
  grandes o cambios críticos (dinero, autorización, auth), planeación de cada bloque de esta tabla
  antes de implementarlo.
- **Cursor:** implementación multiarchivo de alto volumen una vez el plan está claro — pantallas del
  catálogo a partir de un patrón ya establecido, refactors mecánicos, tests que siguen un molde ya
  usado, depuración local iterativa. Es el motor principal para absorber las ~363 h de diferencia
  entre el esfuerzo estimado (abajo) y la capacidad humana de 1 persona.
- Ninguna de las dos aprueba su propio cambio crítico (dinero, autorización, seguridad) — eso sigue
  siendo autorevisión humana de HELL, siempre (README-DEVELOPERS.md §3).

**Esfuerzo estimado (h-persona):**

| Bloque                                                                                      | h         | Dueño principal    |
| ------------------------------------------------------------------------------------------- | --------- | ------------------ |
| Fundación (repo, CI, deploy, licencia, créditos, walking skeleton)                          | 25        | H                  |
| Sistema de diseño premium, app shell, navegación, PWA, onboarding                           | 45        | N                  |
| Motor: crédito CO + finanzas personales (≈ 25 fórmulas con vectores)                        | 55        | H (+ N vectores)   |
| AI Gateway, agente por niveles, recibos, verificador, Ultra, memoria                        | 45        | H                  |
| Market Truth con Tavily (usura, tasas, créditos, depósitos, FX, planes, remesas, DIAN)      | 35        | H                  |
| Captura: importación, recibos por foto, bóveda, correo de entrada                           | 40        | H + N              |
| B — Administrar (Payday, sobres, tarjetas, calendario, cierre, ingresos, salud, patrimonio) | 55        | N (UI) + H (motor) |
| C — Decidir (afford, ¿y si…?, tormenta, metas, inversión)                                   | 35        | N + H              |
| D — Encontrar dinero (Opportunity, suscripciones, anomalías, gastos fijos, remesas)         | 48        | H + N              |
| E3 buscador · F1 hogar · F2 protección · G1 hábitos · G2 briefing                           | 40        | H + N              |
| F3 pasaporte · F4 derechos (8 casos) · F5 impuestos CO completo · G4 segundo país completo  | 55        | H + N              |
| Vigía (Serverless Jobs), push de la app, .ics, correo completo (entrada y salida)           | 25        | H                  |
| Privacidad, seguridad, threat model                                                         | 15        | H                  |
| Evals (datasets, batch, Toloka, LangSmith)                                                  | 25        | N + H              |
| Pulido, bug bash, video, README, Devpost                                                    | 35        | N + H              |
| **Total**                                                                                   | **≈ 578** |                    |

**Conclusión (honesta, recalculada para 1 persona):** el esfuerzo estimado (~578 h) supera la
capacidad humana de HELL solo (~215–250 h) en **más del doble**, no en 15–35 % como en el plan
original a 2 personas. HELL decidió explícitamente no recortar el catálogo para cerrar esa brecha;
se cubre, de forma más agresiva que el plan original, con cinco condiciones:

1. **Trabajar 7 días** desde ya, no solo en semanas 2 y 3, y delegar en Cursor toda la implementación
   de alto volumen que siga un patrón ya decidido (UI de catálogo, plantillas, tests), reservando el
   tiempo humano de HELL para lo que de verdad lo requiere: decisiones, pruebas de fórmulas y
   revisión de lo crítico.
2. **Orden por valor:** el demo es enviable al final de cada semana — esto importa más todavía con
   menos margen de error.
3. **Plan de contingencia (§5)** aplicado sin discusión el lunes que un hito no se cumpla — y con la
   expectativa realista de que se active más seguido que en el plan de 2 personas.
4. Nada fuera del catálogo hasta el 29-oct — con 1 persona, el costo de oportunidad de cualquier
   desvío es más alto que antes.
5. Revisar el domingo de cada semana, honestamente, si la brecha entre lo planeado y lo entregado
   se está cerrando o ampliando — y escalar al plan de contingencia antes de que sea tarde, no
   después.

## 1. Hitos

| Hito                                 | Fecha                | Qué debe estar vivo en la URL pública                                                                                                                                                   |
| ------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H0: Walking skeleton**             | dom 4-oct            | App shell navegable (5 destinos), onboarding de 3 preguntas, `/api/health` con Nemotron, un turno de chat vía Token Factory, CI verde, deploy automático.                               |
| **H1: "Me llegó el sueldo"**         | dom 11-oct           | Payday Autopilot con recibos, sobres, tarjetas, calendario, ¿me lo puedo permitir?; agente con skills y verificador. **Demo ya enviable.**                                              |
| **H2: Mercado + captura + decisión** | dom 18-oct           | Tavily (usura, créditos, CDTs, FX), Opportunity Engine, suscripciones + anomalías, recibos por foto, importación, ¿y si…?, tormenta, metas, inversión, Decision Cards + Ultra, memoria. |
| **H3: Release candidate**            | dom 25-oct           | Bóveda, buscador NL, hogar compartido, protección, hábitos, briefing, Vigía en Serverless Jobs, push, .ics, correo; D3–D5, F3–F5, G4 completos; evals publicadas; README EN.            |
| **H4: Code freeze**                  | mar 27-oct 18:00     | Solo P0.                                                                                                                                                                                |
| **H5: Envío**                        | jue 29-oct 18:00     | Devpost completo; tag `v0.1.0-hackathon`.                                                                                                                                               |
| Deadline oficial                     | vie 30-oct 12:00 COT | Colchón.                                                                                                                                                                                |
| Jurados                              | 01–15-dic            | Demo vivo, con créditos, monitoreado.                                                                                                                                                   |

## 2. Semana a semana

> Las columnas **Resp.** de las tablas que siguen conservan las iniciales del plan original
> (H = HELL, N = Nairy) para no reescribir cada celda — pero **todas** son ahora responsabilidad de
> HELL, solo o con Claude/Cursor (§0). Léase "N" y "H+N" como "HELL, antes pensado como trabajo de
> producto/UX/frontend" — útil para saber qué _tipo_ de trabajo es cada tarea, ya no quién la hace.

### Semana 0 — Fundación (lun 28-sep → dom 4-oct)

| ID    | Tarea                                                                                                                                                                                           | Resp. | Límite |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| S0-01 | Aprobar plan, catálogo y ADR-0035…0039; resolver D-01…D-04, D-10, D-11, D-12 (07).                                                                                                              | H+N   | lun 28 |
| S0-02 | Equipo en Devpost (HELL Representative), track Personal AI, borrador guardado.                                                                                                                  | H     | lun 28 |
| S0-03 | Créditos: cada fundador con **su propia** cuenta (promo TF, Builders: TF, Tavily, LangSmith, Toloka, Academy). Nunca cuentas extra (00 §8). Registrar saldos en `credits.md`.                   | H+N   | mar 29 |
| S0-04 | Licencia Apache-2.0 + NOTICE + TRADEMARKS; `security:check`; repo público (D-01).                                                                                                               | H     | mié 30 |
| S0-05 | `GET /v1/models`: confirmar IDs L/S/U/V/E/guard en ADR-0036.                                                                                                                                    | H     | mar 29 |
| S0-06 | Verificar topología A vs B (ADR-0038) y proveedor de correo (ADR-0039).                                                                                                                         | H     | vie 2  |
| S0-07 | **Walking skeleton**: API health + chat Nemotron; web shell; CI; deploy.                                                                                                                        | H     | dom 4  |
| S0-08 | **Sistema de diseño premium**: tokens (§6), tipografía, componentes base (botón, card, sheet de recibo, badges de verdad, sobres, gráficos), motion, modo oscuro; wireframes de los 5 destinos. | N     | jue 1  |
| S0-09 | App shell + navegación + onboarding de 3 preguntas + PWA instalable (manifest, íconos del logo).                                                                                                | N     | dom 4  |
| S0-10 | Investigación: 3–5 cifras oficiales con URL; 5 entrevistas cortas.                                                                                                                              | N     | dom 4  |
| S0-11 | Aclaración Devpost (acumulación de premios); office hours Nebius (lista VERIFICAR).                                                                                                             | H     | mar 29 |
| S0-12 | ~~Nairy en AGENTS.md y CODEOWNERS~~ — moot, proyecto de un solo fundador (2026-10-07); protección de rama sigue pendiente de decidir (README-DEVELOPERS.md §6).                                 | H     | mar 29 |
| S0-13 | Librería decimal (potencias fraccionarias) — nota en ADR-0016.                                                                                                                                  | H     | jue 1  |
| S0-14 | Esquema de DB v1 (twin, sobres, tarjetas, transacciones, documentos, recibos, cards, memorias, workspaces compartidos, auditoría) + seeds de personas.                                          | H+N   | dom 4  |

### Semana 1 — "Me llegó el sueldo" (lun 5-oct → dom 11-oct)

| ID    | Tarea                                                                                                                                                             | Resp.                 | Límite |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------ |
| S1-01 | Motor crédito CO (colombia-credit.md §1–8).                                                                                                                       | H                     | mié 7  |
| S1-02 | Motor finanzas personales: `budget.allocate`, `envelope_state`, `purchase.afford`, `health.score`, `networth.compute`, `cards.status` (personal-finance.md §1–5). | H                     | vie 9  |
| S1-03 | **Golden vectors independientes** en hoja de cálculo (sin ver código).                                                                                            | N                     | vie 9  |
| S1-04 | AI Gateway: tiers, redacción PII, prompt registry, zod, auditoría, presupuesto, kill switch.                                                                      | H                     | jue 8  |
| S1-05 | Agente + skills + `CalcReceipt` + `ProofCarryingAnswer` + verificador + streaming.                                                                                | H                     | dom 11 |
| S1-06 | UI **Hoy**, **Dinero** (sobres B2, tarjetas B3, ingresos B6, salud B7, patrimonio B8), **calendario** B4, panel de recibo.                                        | N                     | dom 11 |
| S1-07 | **Payday Autopilot (B1)** de punta a punta: detección (botón + notificación pegada), plan, sliders, checklist.                                                    | H (motor/IA) + N (UI) | dom 11 |
| S1-08 | **¿Me lo puedo permitir? (C1)**.                                                                                                                                  | H + N                 | dom 11 |
| S1-09 | Threat model del demo.                                                                                                                                            | H                     | vie 9  |

### Semana 2 — Mercado, captura y decisión (lun 12-oct festivo → dom 18-oct)

| ID    | Tarea                                                                                                                                        | Resp.                 | Límite |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------ |
| S2-01 | Market Truth (T): usura, tasas de referencia, créditos, CDTs/ahorro, **FX (G3)**; allowlist, parseo determinista, caché, frescura, fallback. | H                     | mié 14 |
| S2-02 | **Opportunity Engine (D1)** + `deposit.net_return` + UI Oportunidades.                                                                       | H + N                 | vie 16 |
| S2-03 | Importación (E4) + **suscripciones (D2)** + **anomalías (D3)** con línea base por usuario.                                                   | H                     | jue 15 |
| S2-04 | **Recibos y facturas por foto (E1)**: cámara PWA, extracción V, confirmación.                                                                | H (pipeline) + N (UI) | sáb 17 |
| S2-05 | Decision Cards + **segunda opinión Ultra (A5)**.                                                                                             | H                     | jue 15 |
| S2-06 | Simuladores: **¿Y si…? (C2)**, **tormenta (C3)**, **metas (C4)**, **inversión (C5)**.                                                        | N (UI) + H (motor)    | dom 18 |
| S2-07 | Memoria (A7) + "Lo que FINCH sabe de ti".                                                                                                    | H + N                 | sáb 17 |
| S2-08 | Datasets de evals E2/E3/E4 (incl. preguntas de E3 buscador y recibos).                                                                       | N                     | dom 18 |
| S2-09 | **Copiloto de derechos (F4)**: 8 casos, documentos PDF, seguimiento con plazos.                                                              | N (flujos) + H (PDF)  | dom 18 |

### Semana 3 — Completar todas las H (lun 19-oct → dom 25-oct)

| ID    | Tarea                                                                                                                         | Resp.                   | Límite |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------ |
| S3-01 | **Bóveda (E2)** con vencimientos y recordatorios.                                                                             | H + N                   | mar 20 |
| S3-02 | **Buscador NL (E3)** con DSL acotado + tests de autorización.                                                                 | H                       | mar 20 |
| S3-03 | **Hogar compartido (F1)**: membresías, qué se comparte, división, liquidación, metas comunes.                                 | H (auth/motor) + N (UI) | jue 22 |
| S3-04 | **Radar de protección (F2)** + **hábitos (G1)** + **cierre de mes (B5)**.                                                     | N + H                   | jue 22 |
| S3-05 | **Vigía (A11)** en Nebius Serverless Jobs + **briefing (G2)** + **push de la app (H1)** + **.ics (H2)**.                      | H + N                   | mié 21 |
| S3-06 | **Correo (H3)**: entrada (notificaciones, facturas, documentos → E1/E2/E4) y salida (briefing, alertas, plantillas de marca). | H                       | vie 23 |
| S3-07 | **Gastos fijos (D4)**, **remesas (D5)**, **pasaporte (F3)**, **impuestos CO (F5)**, **segundo país (G4)** — completos.        | H + N                   | sáb 24 |
| S3-08 | Evals completas (batch) + LangSmith + **Toloka** (configurar lunes 19, resultados viernes 23) + endurecer guardrails.         | N + H                   | sáb 24 |
| S3-09 | Operación del demo: uptime, alertas, credit guard, backups, runbook.                                                          | H                       | vie 23 |
| S3-10 | Pulido premium (motion, estados, accesibilidad, responsive, modo oscuro).                                                     | N                       | dom 25 |
| S3-11 | Guion y storyboard del video; README EN (borrador); THIRD_PARTY y licencias de medios.                                        | N + H                   | dom 25 |

### Semana 4 — Freeze y envío (lun 26-oct → vie 30-oct)

| Día    | H                                                                   | N                                                                        |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| lun 26 | Bug bash con 5 testers en celular; P0/P1.                           | Coordina bug bash; corrige UI.                                           |
| mar 27 | **18:00 code freeze**; tag `v0.1.0-rc`; mover Constitución si D-04. | Captura de video sobre el RC.                                            |
| mié 28 | Voz técnica; README final; feedback de Devpost.                     | Edición, subtítulos EN, YouTube **público**; texto Devpost; screenshots. |
| jue 29 | Checklist 00 §4; tag `v0.1.0-hackathon`; **enviar antes de 18:00**. | Verificación en incógnito.                                               |
| vie 30 | Colchón (deadline 12:00 COT).                                       | Colchón.                                                                 |

## 3. Ruta crítica

```text
S0-05 → S0-07 → S1-04 → S1-05 (agente+recibos) → S1-07 (Payday) → S2-05 (cards+Ultra)
S1-01/S1-02 (motor) ──────────────────────────┘
S2-01 (Tavily) → S2-02 (Opportunity) → S3-05 (Vigía)
S0-14 (DB) → S3-03 (hogar compartido: autorización)
S2-08 (datasets) → S3-08 (evals) → README / video
```

Riesgos de retraso: S1-05 (verificador), S2-01 (fuentes oficiales), S2-04 (calidad de extracción
multimodal), S3-03 (autorización compartida). Todos tienen plan B documentado en 07.

## 4. Después del envío

| Periodo         | Qué                                                                                                                                                                                       | Resp.    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 31-oct → 15-dic | `main` congelado en `v0.1.0-hackathon` (excepción a ADR-0026, ADR-0035); desarrollo en `next`; demo solo desde el tag.                                                                    | H        |
| Noviembre       | 30 entrevistas; landing con lista de espera; pitch deck; S.A.S. y marca (D-05, D-09); política de datos (VERIFICAR con abogado); inicio de trámites WhatsApp Business (H6) tras la S.A.S. | N + H    |
| Noviembre       | Programas de startups (NVIDIA Inception, Nebius; VERIFICAR requisitos).                                                                                                                   | H        |
| 01–15-dic       | Guardia de jurados diaria.                                                                                                                                                                | Rotación |
| 16-dic → 10-ene | Merge `next` → `main`; P1 apps nativas arranca.                                                                                                                                           | H + N    |
| ~11-ene-2027    | Ganadores; affidavits ≤ 10 días hábiles.                                                                                                                                                  | H        |

## 5. Plan de contingencia (si un hito no se cumple)

Ninguna función sale del alcance. Si un domingo el hito no está en verde, el lunes se aplica el
siguiente paso de esta lista (y solo ese) y se re-evalúa el domingo siguiente:

1. **G4** segundo país: se entrega con persona demo y FX/remesas, dejando productos locales de D1 para
   la semana 4.
2. **D4** gastos fijos: 3 categorías en vez de todas.
3. **F5** estimador de renta: se muestra como simulación de la cédula general sin deducciones avanzadas.
4. **F4** copiloto: 5 casos pulidos, 3 casos con plantilla estándar.
5. Pulido visual avanzado (motion, ilustraciones) de pantallas secundarias pasa a la semana 4.

**Intocables:** A1–A11, B1–B3, C1, D1, D2, E1, E2, F1, H1 y la estabilidad del demo.

## 6. Tokens de marca (derivados del logo)

| Token             | Hex       | Uso                                          | Contraste medido                      |
| ----------------- | --------- | -------------------------------------------- | ------------------------------------- |
| `brand.green.900` | `#0E4331` | Logo, texto de marca, primario en tema claro | 11,25:1 sobre `#FFFFFF`               |
| `brand.green.950` | `#053F2B` | Fondo de marca (logo invertido)              | 11,48:1 con `#FAFAFA`                 |
| `brand.green.600` | `#1F7A55` | Botón primario (tema claro)                  | 5,29:1 sobre blanco (AA texto normal) |
| `brand.green.300` | `#6FCF97` | Acento en tema oscuro                        | 6,3:1 sobre `#053F2B`                 |
| `surface.dark`    | `#0B1A14` | Fondo del tema oscuro                        | `#A7E3C1` sobre él: 12,29:1           |

Tokens semánticos (`positive`, `negative`, `warning`, `verified`, `estimated`, `stale`, `pending`)
con ícono y texto además del color (README §34–35). Logos en `assets/brand/`.

## 7. Roadmap de empresa 2027

| Trimestre   | Objetivo                           | Gate (README §106) | Entregables clave                                                                                                                                                                                               |
| ----------- | ---------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Q1 2027** | Alpha cerrada (≈ 50 usuarios)      | A + B              | IdP definitivo (ADR-0015), nube de producción (ADR-0012 vs Nebius con datos), **apps nativas (P1)**, endurecimiento de producción de las 45 funciones, fórmulas auditadas por tercero, WhatsApp y SMS (H5, H6). |
| **Q2 2027** | Beta cerrada (≈ 500) + pre-semilla | C + D              | **Open finance/agregador (P2)**, suscripción FINCH Premium (D-12), retención, tercer país, MCP (P6).                                                                                                            |
| **Q3 2027** | Acciones con socios                | E                  | Flujos R2 con aliados (compra de cartera, CDTs), microempresas (P10), retiro (P4), readiness ISO 27001/SOC 2.                                                                                                   |
| **Q4 2027** | Lanzamiento público; ronda semilla | —                  | Crecimiento, SLOs; evaluación de **ejecución con socio regulado (P3)** hacia Gates F/G.                                                                                                                         |
