# 02 — Especificación de producto: FINCH, CFO personal

Nivel de riesgo (README §18): la hackathon entrega capacidades **R0–R1** (información e
inteligencia financiera) y una sola **R2 acotada**: borradores de documentos que el usuario envía
por su cuenta. **R3/R4 fuera de alcance.**

Capacidad regulatoria (README §37): `INFORMATION`, `COMPARISON`, `SIMULATION`. La recomendación
personalizada (`PERSONALIZED_RECOMMENDATION`) se presenta como **simulación educativa con
supuestos explícitos**, no como asesoría. Ver aviso legal en §7 y la decisión D-07 en 07.

---

## 1. Personas del demo (sintéticas, README §80)

Se implementan 3 de las 7 personas de `fixtures/colombia/` para el demo. Las demás quedan para evals.

| Persona                                       | Perfil                                                                                          | Historia del demo                                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `credit_card_heavy`: **Laura, 29, Medellín**  | Salario de COP 4,2 M; 2 tarjetas (una con tasa cercana a la usura); crédito de libre inversión. | _Estrella del video._ Pregunta si le conviene una compra de cartera; FINCH calcula el ahorro con recibos. El Vigía detecta un cambio de usura. |
| `freelancer_variable`: **Andrés, 34, Bogotá** | Ingresos variables; arriendo; metas de ahorro.                                                  | Panorama de 30 días: déficit probable el día 18 y cuánto puede gastar hoy.                                                                     |
| `household_shared`: **Hogar Pérez**           | Dos ingresos; gastos compartidos; meta de cuota inicial.                                        | Memoria de metas compartidas; plan de ahorro.                                                                                                  |

Los datos de las personas son 100 % sintéticos y no contienen PII real (Constitución §4.18).

## 2. Funcionalidades (MoSCoW)

### MUST: sin esto no hay envío competitivo

| ID   | Funcionalidad                         | Descripción                                                                                                                                                                                                                                                                                  | Criterio de aceptación                                                                                                                                                                   |
| ---- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M-1  | **Workspace y personas**              | "Probar como Laura/Andrés/Hogar" sin registro (sesión aislada y efímera) y "Mi espacio privado" (datos manuales o extracto).                                                                                                                                                                 | Un jurado entra al demo y ve datos en < 10 s sin crear cuenta.                                                                                                                           |
| M-2  | **Motor financiero Colombia**         | Conversión EA↔MV↔NAMV (vencida y anticipada), cuota francesa, tabla de amortización, costo total con seguros, cuota de manejo y GMF parametrizable, verificación de usura, flujo de caja a 30 días, _safe-to-spend_, plan de pago avalancha/bola de nieve, comparación de compra de cartera. | Cada fórmula está registrada en el Formula Registry con versión y _golden vectors_ verificados en una fuente independiente (hoja de cálculo auditada). `pnpm financial:verify` en verde. |
| M-3  | **Market Truth (Tavily)**             | Tasa de usura vigente, IBR/TRM de referencia y ofertas públicas de compra de cartera. Dominios oficiales en lista blanca, extracción determinista, frescura y procedencia.                                                                                                                   | Cada valor de mercado muestra fuente (URL), fecha de consulta y frescura. Si falla la fuente: badge _STALE_ y último valor conocido, nunca un valor inventado.                           |
| M-4  | **Agente con skills**                 | Nemotron Super orquesta con tool calling sobre las skills; Lightning enruta y clasifica; Ultra da la segunda opinión.                                                                                                                                                                        | En la eval E2, ≥ 90 % de tool calls correctos (objetivo; se reporta el real).                                                                                                            |
| M-5  | **Proof-carrying answers**            | Toda cifra en una respuesta referencia un recibo; el verificador bloquea cifras sin recibo. Las cifras en la UI son clicables y abren el recibo (fórmula, versión, entradas, fuente).                                                                                                        | E3: 0 cifras sin respaldo en producción. La tasa previa al verificador se publica.                                                                                                       |
| M-6  | **Decision Cards**                    | Estructura de README §17: qué se detectó, por qué importa, impacto, datos, supuestos, frescura, confianza, alternativas, riesgos, siguiente acción, conflicto de interés ("FINCH no recibe comisión").                                                                                       | Persistida como estructura, no como prosa. Renderizada en web y Telegram.                                                                                                                |
| M-7  | **Vigía siempre activo**              | Job diario (Nebius Serverless Job) que recalcula el Twin, consulta Market Truth, detecta eventos (cambio de usura, déficit próximo, oportunidad de compra de cartera) y crea Decision Cards en la bandeja.                                                                                   | Se puede disparar manualmente en el demo ("Ejecutar Vigía ahora") y queda log visible con hora, modelo y costo.                                                                          |
| M-8  | **Memoria persistente y controlable** | Financial Twin (hechos con clase de verdad) + memoria semántica (metas, preferencias, contexto) con embeddings. Pantalla "Lo que FINCH sabe de ti": ver, corregir y olvidar.                                                                                                                 | Olvidar un recuerdo lo excluye de las respuestas siguientes (test E2E).                                                                                                                  |
| M-9  | **Privacidad por diseño**             | Consentimiento por fuente, redacción de PII antes del LLM, auditoría, export JSON, borrado del workspace.                                                                                                                                                                                    | La eval E4 incluye fuga de PII: 0 fugas de cédula o número de cuenta al proveedor (se verifica en el log del gateway).                                                                   |
| M-10 | **Scorecard de evals**                | Harness E1–E6 con resultados publicados en README/`evals/`.                                                                                                                                                                                                                                  | Se corre en CI (subconjunto) y completo con batch inference.                                                                                                                             |
| M-11 | **Bilingüe EN/ES**                    | UI y respuestas en el idioma del usuario; demo en inglés; formato COP `es-CO`.                                                                                                                                                                                                               | Cambio de idioma sin recargar el estado.                                                                                                                                                 |

### SHOULD: suben mucho el puntaje

| ID  | Funcionalidad                   | Descripción                                                                                                                                                                                                                                                                                                            |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-1 | **Telegram**                    | Bot para preguntar, recibir alertas del Vigía y resumen semanal. Vinculación con código de un solo uso. Es el "across your daily workflows".                                                                                                                                                                           |
| S-2 | **Documentos**                  | Subir una oferta de crédito o un extracto (PDF/imagen) → cuarentena → extracción con modelo multimodal Nemotron (si está disponible en Token Factory; si no, texto PDF + Lightning) → **confirmación humana** (queda `USER_ASSERTED`) → comparación. Constitución §4.7: un documento no confirmado no activa acciones. |
| S-3 | **Acciones R2**                 | Borrador de carta de compra de cartera, de renegociación de tasa o de derecho de petición, en PDF, con cifras con recibo. El usuario la descarga y la envía él mismo.                                                                                                                                                  |
| S-4 | **Servidor MCP "FINCH Skills"** | Expone las skills del motor (solo lectura y cálculo) vía MCP para agentes personales (Hermes Agent, OpenClaw/NemoClaw). Demo de 10 s en el video.                                                                                                                                                                      |

### COULD: si sobra tiempo (semana 3)

| ID  | Funcionalidad                                                                                                                                                                     |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1 | **Inferencia privada:** Nemotron Lightning en un Nebius Serverless Endpoint propio para extracción de documentos sensibles ("tus extractos nunca salen de tu endpoint dedicado"). |
| C-2 | **Fine-tuning LoRA** de Lightning para extracción de ofertas colombianas (post-training de Token Factory) con dataset sintético.                                                  |
| C-3 | Notas de voz en Telegram.                                                                                                                                                         |

### WON'T (en la hackathon)

Open finance o conexión bancaria real, pagos, apps nativas, multi-país, admin completo y
autenticación con IdP definitivo (ADR-0015 sigue abierto).

## 3. Flujos principales

### F1: "¿Me conviene la compra de cartera?" (Slice 1 del README §83, extendido)

```text
Usuario (Laura): "Mi tarjeta Visa me cobra 2,3 % mensual. Bancolombia… no, 'Banco X' me ofrece
                  compra de cartera al 1,6 % MV a 36 meses con seguro. ¿Me conviene?"
  → Lightning: intención = COMPARE_REFINANCE; entidades: tasas y plazo; idioma
  → Super (agente):
       twin.get_snapshot()                        → saldo y cuota actual de la tarjeta [OBSERVED/USER_ASSERTED]
       market.get_reference_rate('usura_consumo') → tasa de usura vigente [PROVIDER vía Tavily, URL SFC]
       finance.convert_rate(2.3% MV → EA)         → recibo R1
       finance.check_usury(EA, usura)             → recibo R2
       finance.total_cost_of_credit(oferta)       → recibo R3 (incluye seguros)
       finance.compare_offers(actual, oferta)     → recibo R4 (ahorro total, punto de equilibrio)
       cards.create_decision_card(...)            → Decision Card estructurada
  → Verificador numérico: cada cifra ↔ recibo (si falla: reintento con feedback, luego plantilla)
  → Ultra (segunda opinión): revisa supuestos y omisiones → "aprobada" o "aprobada con advertencias"
  → UI: Decision Card con cifras clicables, badges de verdad y botón "Redactar carta al banco" (S-3)
```

> Nota: en el video y el demo **no** se usan nombres de bancos reales (regla de marcas de terceros).
> Se usan "Banco A/B/C". Las ofertas de mercado reales vía Tavily se muestran con su URL como
> fuente citada, sin logos.

### F2: "Mi panorama de 30 días" (Slice 2)

Twin → forecast determinista con ingresos y obligaciones recurrentes → alerta de déficit (día y
monto) → _safe-to-spend_ de hoy → Decision Card "mueve el pago X al día Y" (solo simulación).

### F3: "Sube una oferta" (Slice 3)

Documento → cuarentena (tipo MIME, tamaño, sin macros) → extracción estructurada → pantalla de
confirmación campo por campo → comparación (F1).

### F4: Vigía

Cron diario (06:00 COT) → por workspace con consentimiento: recalcular → consultar Market Truth
(con caché) → reglas deterministas de eventos → Decision Card + notificación (web y Telegram) → log
de auditoría con costo.

### F5: Memoria

"Recuerda que quiero pagar la tarjeta antes de diciembre" → `memory.remember` (el usuario lo ve en
"Lo que FINCH sabe de ti") → se usa en F1/F2 como restricción → "olvida eso" → `memory.forget`.

## 4. Pantallas (web, responsive)

1. **Landing / selector de persona**: logo, tagline, "Probar como Laura", "Mi espacio privado",
   aviso de privacidad de una línea.
2. **Inicio (Twin)**: liquidez, deudas, próximos pagos, frescura de datos y bandeja de Decision Cards.
3. **Chat con FINCH**: respuestas con cifras subrayadas → panel lateral de recibo.
4. **Decision Card (detalle)**: secciones de README §17, alternativas y acciones.
5. **Recibo**: fórmula (id@versión), entradas con clase de verdad, salida, fuentes (URL y fecha) y
   hash de entradas.
6. **Mercado**: tasa de usura, IBR y TRM con fuente y frescura; ofertas encontradas.
7. **Lo que FINCH sabe de ti**: hechos y recuerdos; editar, olvidar, exportar, borrar todo.
8. **Vigía**: historial de ejecuciones (hora, eventos, modelos usados, costo) y "ejecutar ahora".
9. **Documentos**: subida → confirmación.
10. **Ajustes**: idioma, fuentes activadas, Telegram, consentimiento.

## 5. Skills (tools del agente)

Cada skill tiene: nombre estable, versión, esquema de entrada y salida (zod → JSON Schema para
tool calling), clase de verdad de su salida y si produce recibo.

| Skill                                   | Tipo                                          | Salida                                     | Recibo                     |
| --------------------------------------- | --------------------------------------------- | ------------------------------------------ | -------------------------- |
| `twin.get_snapshot`                     | lectura                                       | snapshot inmutable con checksum            | — (referencia al snapshot) |
| `twin.record_fact`                      | escritura (requiere confirmación del usuario) | hecho `USER_ASSERTED`                      | —                          |
| `finance.convert_rate`                  | cálculo                                       | tasa convertida                            | ✅                         |
| `finance.amortization_schedule`         | cálculo                                       | tabla                                      | ✅                         |
| `finance.total_cost_of_credit`          | cálculo                                       | costo total, tasa efectiva real            | ✅                         |
| `finance.check_usury`                   | cálculo                                       | cumple / excede / margen                   | ✅                         |
| `finance.compare_offers`                | cálculo                                       | ahorro, punto de equilibrio                | ✅                         |
| `finance.forecast_30d`                  | cálculo                                       | serie diaria, déficit                      | ✅ (`ESTIMATED`)           |
| `finance.safe_to_spend`                 | cálculo                                       | monto                                      | ✅                         |
| `finance.debt_payoff_plan`              | cálculo                                       | plan avalancha/bola de nieve               | ✅                         |
| `market.get_reference_rate`             | lectura externa (Tavily)                      | tasa + procedencia                         | ✅ (fuente)                |
| `market.search_offers`                  | lectura externa (Tavily)                      | ofertas + URLs                             | ✅ (fuente)                |
| `docs.extract_offer`                    | IA (multimodal)                               | campos `ESTIMATED` pendientes de confirmar | —                          |
| `cards.create_decision_card`            | escritura                                     | Decision Card                              | referencia recibos         |
| `actions.draft_letter`                  | escritura                                     | PDF borrador                               | referencia recibos         |
| `memory.remember` / `recall` / `forget` | memoria                                       | recuerdo                                   | —                          |
| `reminders.schedule`                    | escritura                                     | recordatorio                               | —                          |

## 6. Métricas de producto que se muestran

- Tiempo hasta la primera Decision Card (< 60 s desde la landing).
- % de cifras con recibo (100 %).
- Latencia p50/p95 por turno y costo promedio por conversación (USD) por nivel de modelo.
- Ahorro total simulado identificado para las personas del demo (COP), **etiquetado como simulación**.

## 7. Aviso legal (copy base, a validar)

> _FINCH ofrece información y simulaciones educativas basadas en los datos que tú proporcionas y en
> fuentes públicas citadas. No es asesoría financiera, legal ni tributaria personalizada, ni una
> oferta de productos. FINCH no recibe comisiones de ninguna entidad y no mueve tu dinero. Verifica
> las condiciones finales con tu entidad financiera._

Versión en inglés en el kit (06). La redacción final requiere revisión legal (07, D-07).
