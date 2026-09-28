# 05 — Roadmap y cronograma

**Supuesto de capacidad:** ~35–40 h/semana por fundador durante 4,5 semanas (≈ 300 h-persona en
total). **Si alguno tiene menos de 20 h/semana**, se aplica el _corte de alcance_ del §5 desde el
primer día. No se descubre en la semana 3.

Convenciones: **H** = HELL, **N** = Nairy. Cada tarea tiene ID (`S<semana>-<n>`), responsable,
fecha límite y "hecho cuando". Cada PR lo revisa **el otro fundador** (con dos humanos ya se cumple
README §100: ninguna IA aprueba sus propios cambios críticos).

---

## 1. Hitos

| Hito                                  | Fecha                | Qué debe estar vivo en la URL pública                                                                              |
| ------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **H0: Walking skeleton**              | dom 4-oct            | Web + API desplegadas; `/api/health` muestra el modelo Nemotron; un chat responde vía Token Factory; CI en verde.  |
| **H1: Primer slice con recibos**      | dom 11-oct           | Laura pregunta por la compra de cartera → respuesta con cifras clicables y recibos (tasa de usura cargada a mano). |
| **H2: MUST completo, salvo el Vigía** | dom 18-oct           | F1, F2, F3 y F5 funcionando; Tavily en vivo; Decision Cards; segunda opinión Ultra.                                |
| **H3: Release candidate**             | dom 25-oct           | Vigía en Nebius Serverless Jobs, Telegram, evals publicadas, pulido y README EN.                                   |
| **H4: Code freeze**                   | mar 27-oct 18:00     | Solo cambios de bloqueo (P0).                                                                                      |
| **H5: Envío**                         | jue 29-oct 18:00     | Devpost completo; tag `v0.1.0-hackathon`.                                                                          |
| Deadline oficial                      | vie 30-oct 12:00 COT | Colchón.                                                                                                           |
| Jurados                               | 01–15-dic            | Demo vivo, con créditos y monitoreado.                                                                             |
| Ganadores                             | ~11-ene-2027         | Affidavits en ≤ 10 días hábiles.                                                                                   |

## 2. Semana a semana

### Semana 0: Fundación (lun 28-sep → dom 4-oct)

| ID    | Tarea                                                                                                                                                                                                                         | Resp. | Límite    | Hecho cuando                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | --------- | ------------------------------------------------------------------------------------------- |
| S0-01 | Leer y aprobar este plan y los ADR-0035…0038 (o pedir cambios). Resolver D-01…D-04 de [07](07-risks-and-decisions.md).                                                                                                        | H+N   | lun 28    | Decisiones anotadas en 07.                                                                  |
| S0-02 | Crear el equipo en Devpost; HELL como Representative; track Personal AI; **guardar borrador** del envío desde ya.                                                                                                             | H     | lun 28    | Borrador visible en Devpost.                                                                |
| S0-03 | Reclamar créditos: promo Token Factory (`NEBIUS-DEVPOST-GLOBAL26`), Builders Program (TF, Tavily, LangSmith, Toloka, Academy). Nairy también se une al Builders Program (confirmar que los términos lo permiten por persona). | H+N   | mar 29    | Créditos visibles en cada consola; registrados en `docs/hackathon/credits.md` (sin llaves). |
| S0-04 | Licencia: `LICENSE` Apache-2.0, `NOTICE`, `TRADEMARKS.md`; `package.json` → `"license": "Apache-2.0"`; `pnpm security:check` limpio; repo **público**.                                                                        | H     | mié 30    | El panel _About_ de GitHub muestra "Apache-2.0".                                            |
| S0-05 | Llave de Token Factory; `GET /v1/models`; registrar los IDs reales de Lightning/Super/Ultra, multimodal, embeddings y guard en ADR-0036.                                                                                      | H     | mar 29    | Tabla de modelos confirmada.                                                                |
| S0-06 | Verificar la Topología A (Serverless Jobs con o sin cron, endpoint con contenedor HTTP en CPU, Managed PostgreSQL + pgvector, costos, qué cubren los créditos). Decidir A o B.                                                | H     | vie 2-oct | ADR-0038 pasa a Accepted con la opción elegida.                                             |
| S0-07 | **Walking skeleton**: `apps/api` (health + `/api/v1/chat` → `ai-core` mínimo → Nemotron), `apps/web` (página de chat), deploy y CI.                                                                                           | H     | dom 4     | H0 cumplido.                                                                                |
| S0-08 | Sistema de diseño: tokens desde el logo (ver §6), tipografía, 10 wireframes (pantallas de 02 §4), inventario de componentes.                                                                                                  | N     | dom 4     | Wireframes revisados por H; `packages/design-tokens` con los tokens base.                   |
| S0-09 | Investigación del problema: 3–5 cifras oficiales con URL y fecha; 5 entrevistas cortas (15 min) a personas con tarjeta o crédito de consumo.                                                                                  | N     | dom 4     | `docs/hackathon/research.md` con citas y notas anonimizadas.                                |
| S0-10 | Pedir por escrito a Devpost la aclaración sobre acumulación de premios (Overall + Bonus). Agendar office hours de Nebius con la lista de VERIFICAR de 03.                                                                     | H     | mar 29    | Correo enviado; cita agendada.                                                              |
| S0-11 | Certificación Nebius Academy (USD 1) + curso gratuito de Agentic AI.                                                                                                                                                          | H+N   | dom 4     | Badges obtenidos.                                                                           |
| S0-12 | Agregar a Nairy como desarrolladora humana autorizada en AGENTS.md §1 y en CODEOWNERS; protección de rama con 1 revisión obligatoria.                                                                                         | H     | mar 29    | Regla activa en GitHub.                                                                     |
| S0-13 | Librería decimal para tasas (potencias fraccionarias): evaluar y registrar como nota en ADR-0016 o ADR nuevo.                                                                                                                 | H     | jue 1-oct | Decisión registrada.                                                                        |

### Semana 1: Motor + Gateway + Agente (lun 5-oct → dom 11-oct)

| ID    | Tarea                                                                                                                                                               | Resp. | Límite | Hecho cuando                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ | --------------------------------------------------------------------- |
| S1-01 | `finance.convert_rate` (EA, MV, NAMV, vencida y anticipada), registrada en el Formula Registry.                                                                     | H     | mar 6  | Golden vectors en verde.                                              |
| S1-02 | Amortización francesa y costo total (seguros, cuota de manejo, GMF parametrizable, TIR mensual → EA).                                                               | H     | mié 7  | idem                                                                  |
| S1-03 | `check_usury`, `compare_offers` (ahorro, punto de equilibrio) y `debt_payoff_plan`.                                                                                 | H     | jue 8  | idem                                                                  |
| S1-04 | `forecast_30d` y `safe_to_spend`.                                                                                                                                   | H     | vie 9  | idem                                                                  |
| S1-05 | **Golden vectors independientes:** Nairy construye una hoja de cálculo con las mismas fórmulas _sin mirar el código_ (verificación independiente real, README §15). | N     | jue 8  | ≥ 40 vectores exportados a `packages/financial-engine/test/vectors/`. |
| S1-06 | `ai-core`: tiers, cliente Token Factory, redacción de PII, prompt registry, validación zod, auditoría `ai_calls`, presupuesto y kill switch.                        | H     | vie 9  | Tests unitarios; test de "no sale PII".                               |
| S1-07 | Agente: catálogo de skills, bucle con tool calling, `CalcReceipt`, `ProofCarryingAnswer` y verificador numérico.                                                    | H     | dom 11 | E3 (subconjunto) en verde.                                            |
| S1-08 | Web: landing, selector de persona, Inicio (Twin), chat con panel de recibo, i18n ES/EN.                                                                             | N     | dom 11 | Navegable en móvil y desktop.                                         |
| S1-09 | Esquema de DB mínimo + seeds de las 3 personas (datos escritos por N, esquema por H).                                                                               | H+N   | mié 7  | `pnpm dev:infra` + seed reproducible.                                 |
| S1-10 | Threat model del demo (`docs/architecture/threat-models/hackathon-demo.md`).                                                                                        | H     | vie 9  | Revisado por N.                                                       |

**H1 (dom 11-oct):** Laura → compra de cartera → respuesta con recibos en la URL pública.

### Semana 2: Market Truth + Decision Cards + Documentos + Memoria (lun 12-oct → dom 18-oct)

> **Lunes 12-oct es festivo en Colombia** (Día de la Raza). Semana de 4 días efectivos, salvo que decidan trabajarlo.

| ID    | Tarea                                                                                                                                                                                                                                | Resp.                | Límite | Hecho cuando                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ------ | ---------------------------------------------------- |
| S2-01 | Adapter Tavily _Market Truth_: search + extract, allowlist (`superfinanciera.gov.co`, `banrep.gov.co`, …; VERIFICAR los dominios exactos), parsers deterministas de usura/IBR/TRM, caché, frescura, doble fuente y fallback _STALE_. | H                    | mié 14 | La pantalla Mercado muestra valores con URL y fecha. |
| S2-02 | `market.search_offers` (ofertas públicas de compra de cartera; solo lectura y cita).                                                                                                                                                 | H                    | jue 15 | Ofertas con URL en la Decision Card.                 |
| S2-03 | Componente Decision Card (lista y detalle) + pantalla Mercado.                                                                                                                                                                       | N                    | jue 15 | Cumple la estructura de README §17.                  |
| S2-04 | Creación de Decision Cards + segunda opinión Ultra (`APPROVE/WARN/BLOCK`).                                                                                                                                                           | H                    | vie 16 | Hallazgos visibles en la UI.                         |
| S2-05 | Documentos (S-2): cuarentena, extracción (multimodal o texto), pantalla de confirmación.                                                                                                                                             | H (backend) + N (UI) | dom 18 | Oferta en PDF → comparación.                         |
| S2-06 | Memoria: embeddings + pgvector + skills `remember/recall/forget`; pantalla "Lo que FINCH sabe de ti".                                                                                                                                | H + N                | sáb 17 | Test E2E de "olvidar".                               |
| S2-07 | Datasets de evals E2 (60), E3 (20 trampas) y E4 (45 adversariales) en ES/EN.                                                                                                                                                         | N                    | dom 18 | JSONL en `evals/datasets/`.                          |

**H2 (dom 18-oct):** MUST completo salvo el Vigía.

### Semana 3: Siempre activo + Telegram + Evals + Pulido (lun 19-oct → dom 25-oct)

| ID    | Tarea                                                                                                                                  | Resp.                                   | Límite | Hecho cuando                                            |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------ | ------------------------------------------------------- |
| S3-01 | `apps/worker` Vigía: contenedor, reglas de eventos, idempotencia; despliegue en **Nebius Serverless Jobs** + programación diaria.      | H                                       | mar 20 | Corre solo a las 06:00 COT; también manual desde la UI. |
| S3-02 | Pantalla Vigía (historial, costo, "ejecutar ahora") + notificaciones en la bandeja.                                                    | N                                       | mar 20 | —                                                       |
| S3-03 | Telegram (S-1): vinculación por código, Q&A, alertas del Vigía y resumen semanal.                                                      | H (bot) + N (copy y diseño de mensajes) | jue 22 | Demo en el celular.                                     |
| S3-04 | Cartas R2 en PDF (S-3), con cifras con recibo y aviso legal.                                                                           | H + N (plantilla)                       | jue 22 | Descarga desde la Decision Card.                        |
| S3-05 | Evals completas vía **batch inference** + LangSmith; tarea **Toloka** (configurarla el lunes 19; resultados el viernes 23).            | H (runner) + N (Toloka)                 | sáb 24 | `evals/RESULTS.md` con números reales.                  |
| S3-06 | Endurecer guardrails según los fallos de E4.                                                                                           | H                                       | sáb 24 | E4 ≥ 95 % o documentar la brecha.                       |
| S3-07 | **Servidor MCP (S-4)**, solo si todo lo MUST está verde el miércoles 21.                                                               | H                                       | sáb 24 | Hermes Agent u OpenClaw llama `finance.compare_offers`. |
| S3-08 | Pulido: modo oscuro, accesibilidad (teclado, contraste, lector de pantalla), estados vacío/error/_stale_, responsive.                  | N                                       | dom 25 | Checklist de accesibilidad de README §35.               |
| S3-09 | Operación del demo: monitor de uptime, alertas a ambos, _credit guard_, backups, runbook `docs/operations/runbooks/hackathon-demo.md`. | H                                       | vie 23 | Alerta de prueba recibida.                              |
| S3-10 | Storyboard y guion del video (06 §2); ensayo de capturas.                                                                              | N                                       | dom 25 | Guion cronometrado ≤ 2:50.                              |
| S3-11 | README para jurados (EN) — borrador.                                                                                                   | H                                       | dom 25 | Revisado por N.                                         |
| S3-12 | `THIRD_PARTY.md` (licencias de dependencias y modelos) + `media-licenses.md`.                                                          | N                                       | dom 25 | —                                                       |

**H3 (dom 25-oct):** release candidate.

### Semana 4: Freeze y envío (lun 26-oct → vie 30-oct)

| Día        | H                                                                                               | N                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **lun 26** | _Bug bash_: 5 testers externos en celular; corregir P0/P1.                                      | Coordina el bug bash; recoge feedback; corrige UI.                                             |
| **mar 27** | **18:00 code freeze.** Tag `v0.1.0-rc`. Constitución → `docs/architecture/` si se aprueba D-04. | Graba las capturas del video en el RC.                                                         |
| **mié 28** | Voz en off de la parte técnica; README final; sección de feedback de Devpost.                   | Edición del video, subtítulos EN, subida **pública** a YouTube; screenshots; texto de Devpost. |
| **jue 29** | Checklist de 00 §4 punto por punto; tag `v0.1.0-hackathon`; **enviar antes de las 18:00**.      | Verificación en incógnito: video, repo, demo y licencia.                                       |
| **vie 30** | Colchón. Nada nuevo. Deadline 12:00 COT.                                                        | Colchón.                                                                                       |

## 3. Ruta crítica y dependencias

```text
S0-05 (IDs modelos) → S0-07 (skeleton) → S1-06 (gateway) → S1-07 (agente+recibos) → S2-04 (cards+Ultra)
S1-01..04 (motor) ─────────────────────────────────────┘
S0-06 (topología) → S3-01 (Vigía en Serverless Jobs)
S2-01 (Tavily) → S2-02 → S3-01
S2-07 (datasets) → S3-05 (evals) → S3-06 → README/Video
S3-10 (guion) → sem 4 video
```

Lo que más riesgo tiene de retrasarse: **S1-07** (agente + verificador) y **S2-01** (parseo de
fuentes oficiales). Ambos tienen plan B: plantillas deterministas y tasas cargadas a mano con
fuente citada.

## 4. Después del envío

| Periodo         | Qué                                                                                                                                                                                                                     | Resp.                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 31-oct → 30-nov | `main` congelado en `v0.1.0-hackathon` hasta el 15-dic (excepción temporal a ADR-0026, registrada en ADR-0035). El desarrollo sigue en la rama `next`. El demo se despliega **solo** desde el tag.                      | H                                       |
| Noviembre       | Descubrimiento de clientes: 30 entrevistas; landing con lista de espera; pitch deck; constitución de la S.A.S. y búsqueda de marca en la SIC (D-05, D-09); política de datos (Ley 1581 de 2012, VERIFICAR con abogado). | N (research, deck) + H (legal, técnico) |
| Noviembre       | Postular a programas de apoyo a startups (p. ej. NVIDIA Inception y programas de Nebius para startups; VERIFICAR requisitos y fechas).                                                                                  | H                                       |
| 01–15-dic       | Guardia de jurados: revisión diaria de salud y créditos; responder dudas si Devpost las canaliza.                                                                                                                       | Rotación H/N                            |
| 16-dic → 10-ene | Merge `next` → `main`; retomar el programa de producto.                                                                                                                                                                 | H+N                                     |
| ~11-ene-2027    | Anuncio; affidavits y formularios fiscales en ≤ 10 días hábiles.                                                                                                                                                        | H (Representative)                      |

## 5. Corte de alcance (en este orden, si el tiempo no alcanza)

1. C-1, C-2, C-3 (ya son opcionales).
2. S-4 MCP → se menciona como _What's next_.
3. S-3 cartas PDF → un botón "copiar texto".
4. S-2 documentos → solo PDF con texto (sin multimodal).
5. S-1 Telegram → notificaciones solo en la web (debilita "across daily workflows"; recortarlo de último).

**Nunca se recortan:** M-5 (recibos), M-7 (Vigía), M-3 (Tavily), M-10 (evals) ni la estabilidad
del demo. Son los que ganan puntos.

## 6. Tokens de marca (derivados del logo)

| Token             | Hex       | Uso                                          | Contraste medido                           |
| ----------------- | --------- | -------------------------------------------- | ------------------------------------------ |
| `brand.green.900` | `#0E4331` | Logo, texto de marca, primario en tema claro | 11,25:1 sobre `#FFFFFF`                    |
| `brand.green.950` | `#053F2B` | Fondo de marca (logo invertido)              | 11,48:1 con `#FAFAFA`                      |
| `brand.green.600` | `#1F7A55` | Botón primario (tema claro)                  | 5,29:1 sobre blanco (AA para texto normal) |
| `brand.green.300` | `#6FCF97` | Acento en tema oscuro                        | 6,3:1 sobre `#053F2B`                      |
| `surface.dark`    | `#0B1A14` | Fondo del tema oscuro                        | `#A7E3C1` sobre él: 12,29:1                |

Los tokens semánticos (`positive`, `negative`, `warning`, `verified`, `estimated`, `stale`, `pending`)
se definen en S0-08 con **ícono y texto además del color** (README §34–35). Logos fuente en `assets/brand/`.

## 7. Roadmap de empresa 2027 (después de la hackathon)

El programa de 24 semanas (README §84) se retoma **a partir del estado que deje la hackathon**.
Varias de sus semanas ya quedan adelantadas: motor (sem 8–10), segunda opinión (11–13) y
documentos/IA (14–16).

| Trimestre   | Objetivo                                                | Gate (README §106)                                | Entregables clave                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Q1 2027** | Alpha cerrada (≈ 50 usuarios reales)                    | **A: Foundation** + **B: Financial Intelligence** | IdP definitivo (ADR-0015), tenancy completa, decisión de nube de producción (AWS según ADR-0012 vs Nebius, con datos de costo reales), app Expo (shell), fórmulas auditadas por un tercero.          |
| **Q2 2027** | Beta cerrada (≈ 500 usuarios) + ronda pre-semilla       | **C: External Data** + **D: Closed Beta**         | Primer proveedor de datos real (open finance o agregador; VERIFICAR el estado regulatorio de open finance en Colombia), extractos automáticos, experimento de suscripción, métricas de retención.    |
| **Q3 2027** | Acciones externas con socios                            | **E: External Actions**                           | Flujo R2 con aliado (solicitud de compra de cartera), revisión legal del modelo de ingresos sin sesgo de ranking (Constitución §4.15), app desktop (Tauri), readiness ISO 27001/SOC 2 (README §123). |
| **Q4 2027** | Lanzamiento público en Colombia; preparar ronda semilla | —                                                 | Crecimiento, soporte, SLOs de producción; evaluación de un segundo país (`jurisdictions/`).                                                                                                          |

**R3/R4 (mover dinero o custodia)** siguen fuera de alcance hasta pasar los Gates F y G. Requieren
socio regulado y revisión externa (ADR-0021).
