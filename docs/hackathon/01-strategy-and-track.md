# 01 — Estrategia, track y premios

## 1. Decisión recomendada: **Personal AI Track** + bonus **Best Use of Tavily**

### Las cuatro opciones

| Track                        | Encaje con FINCH                                                                                 | Competencia esperada                                                                                    | Veredicto                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Coding & Agentic Engineering | Nulo. FINCH no es una herramienta de desarrollo.                                                 | —                                                                                                       | ❌ Cae en Stage One como "rebrand". |
| Physical AI                  | Nulo. No hay hardware; el video exigiría "key modules in action", lo que debilita el caso.       | —                                                                                                       | ❌                                  |
| **Best Apps & Agents**       | Alto. "Copilot" o "workflow that runs itself".                                                   | **Muy alta.** Es el track genérico: aquí cae todo lo que no encaja en otro.                             | ✅ Plan B                           |
| **Personal AI**              | **Muy alto y específico.** Cada frase de la definición tiene su contraparte en FINCH (tabla §3). | Media. La mayoría hará asistentes de correo, calendario o notas. Un CFO personal privado se diferencia. | ✅ **Plan A**                       |

**Por qué Personal AI gana a Best Apps:**

1. **Diferenciación.** Entre asistentes personales genéricos, uno financiero, privado y con cifras
   verificables destaca. En Best Apps sería una app más.
2. **La Constitución de FINCH ya es la tesis del track.** "Keeping your data under your control"
   corresponde a consentimiento validado en backend, clasificación de datos, redacción de PII y
   export/delete (README §4.16, §31). "Reusable skills" corresponde al motor financiero como skills
   versionadas (README §14.2).
3. **El Grand Prize se decide entre todos los tracks.** Elegir el track no limita el premio mayor;
   solo define contra quién se compite por la Jetson y cómo se lee el encaje en Stage One.
4. **Best Apps también sugiere el ruteo Ultra/Nano/Super y los Serverless.** FINCH los usa igual,
   así que no se pierde nada de lo que valoraría ese track.

**Riesgo del Plan A:** la descripción del track menciona NemoClaw, OpenShell, Hermes Agent y Nebius
Serverless. Dice "tools **such as**", así que no son obligatorios, pero usar al menos uno refuerza
el encaje. Mitigación: se usa **Nebius Serverless** (Jobs para el Vigía), y como perspectiva (P6) se expone
FINCH como **servidor MCP** para que agentes personales (Hermes Agent, OpenClaw/NemoClaw) usen
FINCH como "cerebro financiero" (ver 08, P6). Así FINCH se integra con el ecosistema personal AI
de NVIDIA en lugar de competir contra él.

## 2. Posicionamiento

**Nombre del envío:** _FINCH: your private, always-on personal CFO_ (Colombia first).

**Tagline:** _"Nemotron explains. Math decides. Every number comes with a receipt."_

**Problema (a sustentar con fuentes oficiales; no inventar cifras):**

- El consumidor colombiano recibe tasas en formatos incomparables: efectiva anual (EA), mes
  vencido (MV), nominal anual mes vencido (NAMV). A eso se suman seguros, cuota de manejo y GMF.
  El costo real de un crédito queda oculto.
- Existe un techo legal, la **tasa de usura**, que certifica la Superintendencia Financiera y
  cambia periódicamente. Pocos usuarios saben si su tarjeta está cerca del techo o si una compra de
  cartera les ahorraría dinero.
- Los chatbots financieros genéricos **alucinan números**. En finanzas personales, un número
  inventado causa daño real.
- Tarea de investigación (S0-09/S0-10, HELL — reasignada de Nairy el 2026-10-07): reunir 3–5 cifras oficiales (SFC, Banco de la República,
  DANE, Banca de las Oportunidades) sobre endeudamiento de consumo, uso de tarjetas e inclusión
  financiera, **con URL y fecha**, para la descripción y el video. Si una cifra no tiene fuente
  oficial, no se usa.

**Solución:** un asistente siempre activo que:

1. **Entiende** el estado financiero del usuario (Financial Twin) con datos que el usuario controla.
2. **Decide** con matemática determinista y versionada; los modelos solo enrutan, extraen,
   orquestan y explican.
3. **Vigila** cada día tasas de referencia, usura y ofertas de mercado (Tavily) y avisa cuando
   algo cambia a favor o en contra del usuario.
4. **Actúa** dentro de límites seguros (nivel R2): borradores de cartas de compra de cartera o
   renegociación, recordatorios y planes de pago. **Nunca mueve dinero.**

## 3. Trazabilidad track → funcionalidad (va en el README para jurados)

| Frase del Personal AI Track                      | Funcionalidad FINCH                                                                                                                                                    | Dónde se ve en el video |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| "always-on"                                      | **Vigía**: Serverless Job diario que recalcula el Twin, consulta usura y ofertas y genera Decision Cards proactivas y el briefing; avisa con el push de la propia app. | Min 1:55                |
| "private assistant"                              | Workspace por usuario, consentimiento explícito, redacción de PII antes de cualquier LLM, export/delete, "FINCH no entrena modelos con tus datos".                     | Min 0:20 y 2:25         |
| "keeping your data under your control"           | Pantalla "Lo que FINCH sabe de ti": cada hecho con procedencia, editable y borrable; auditoría visible.                                                                | Min 2:25                |
| "persistent memory"                              | Financial Twin (hechos estructurados versionados) + memoria semántica de preferencias y metas (pgvector).                                                              | Min 1:30                |
| "reusable skills"                                | El motor financiero expuesto como skills versionadas (tools con esquema); también por MCP.                                                                             | Min 1:05                |
| "access to the tools and information you choose" | El usuario activa o desactiva fuentes y canales: Tavily (web), documentos y bóveda, correo de entrada, calendario.                                                     | Min 0:35                |
| "carry out tasks across your daily workflows"    | Payday Autopilot (plan del mes y checklist), recibos por foto, bóveda con vencimientos, hogar compartido, cartas y reclamos, briefing diario.                          | Min 2:05                |
| "NVIDIA open source model"                       | Nemotron Lightning / Super / Ultra en Token Factory.                                                                                                                   | Todo el video           |
| "Nebius Serverless"                              | Serverless Jobs para el Vigía (y opcionalmente un Serverless Endpoint para inferencia privada).                                                                        | Min 1:55                |

## 4. Cómo se maximiza cada criterio

### Technological Implementation (desempate 1)

- **Enrutamiento por niveles medido:** tabla de latencia, costo y calidad por modelo en el README,
  a partir de las evals reales (no estimaciones).
- **Tool calling + structured outputs** con validación de esquema (zod) y reintento acotado.
- **Verificador numérico determinista** (tasa de grounding del 100 % publicada, con la tasa previa
  al verificador reportada honestamente).
- **Batch inference** de Token Factory para correr las evals a menor costo.
- CI verde: lint, typecheck, tests de motor con _golden vectors_ y fitness de arquitectura.
- Observabilidad: traces en LangSmith, métricas de costo por conversación.

### Design

- Experiencia completa y autónoma: onboarding → "me llegó el sueldo" → plan del mes → decisión → recibo → acción → Vigía → push de la app.
- Sistema de diseño con la marca (verde FINCH #0E4331), modo claro y oscuro, accesible (no depender
  solo del color: badges de clase de verdad con texto e ícono).
- Bilingüe EN/ES, con demo en inglés para jurados y formato COP.

### Potential Impact

- Audiencia concreta: personas asalariadas o independientes que reciben ingresos y deben administrar deudas, tarjetas y metas; profundidad en Colombia, preparado para más países.
- El demo resuelve un caso real: "¿me conviene la compra de cartera?", con ahorro en COP calculado
  y demostrado.
- Camino de negocio creíble (sin comisiones que sesguen el ranking, README §4.15).

### Quality of the Idea

- **Proof-carrying answers:** las respuestas del LLM deben citar recibos de cálculo; lo que no se
  puede citar, no se dice.
- **Ultra como auditor de segunda opinión**, no como generador: revisa el plan del agente y la
  Decision Card antes de mostrarla.
- **Tavily como "Market Truth":** dominios oficiales en lista blanca, doble fuente, frescura y
  procedencia. El contenido web se trata como dato no confiable (defensa contra prompt injection).

## 5. Qué NO haremos (y por qué)

- **Conexión bancaria real u open finance:** requiere contratos, certificaciones y tiempo. Se
  simula con personas sintéticas más carga de extractos (PDF/CSV) por el usuario.
- **Movimiento de dinero (R3):** prohibido por ADR-0021 y por prudencia regulatoria.
- **Apps nativas (Expo/Tauri):** la PWA instalable con push propio cubre el "dispositivo" del video.
  Las apps nativas vuelven al roadmap de 2027.
- **Infraestructura AWS de producción:** el demo usa Nebius más un hosting simple (ADR-0038).
