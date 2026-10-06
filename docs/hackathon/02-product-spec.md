# 02 — Especificación de producto: FINCH, CFO personal premium

> Alcance funcional completo y niveles (H / P): **[08-feature-catalog.md](08-feature-catalog.md)**.
> Este documento describe la **experiencia**: visión, principios premium, personas, navegación,
> flujos y skills.

Nivel de riesgo (README §18): R0–R1 y **R2 acotada** (borradores, checklists, enlaces compartibles).
**FINCH nunca mueve dinero.** Capacidad regulatoria (README §37): `INFORMATION`, `COMPARISON`,
`SIMULATION`; lo personalizado se presenta como simulación educativa con supuestos explícitos
(decisión D-07).

---

## 1. Visión

**FINCH es la app que administra tu vida financiera como lo haría un CFO personal**: sabe cuándo te
llega el dinero, lo reparte con criterio, controla tus tarjetas, te frena antes de una mala compra,
encuentra dinero que estás perdiendo, busca mejores productos en el mercado real y protege a tu
hogar — y **cada número que te muestra viene con su recibo**.

- **Autónoma:** todo ocurre dentro de FINCH (bandeja, push, calendario, bóveda). Correo, SMS,
  WhatsApp o Telegram son extras opcionales para traer o enviar información (ADR-0039).
- **Global-ready, Colombia-deep:** multimoneda y FX en vivo para todos; reglas colombianas a fondo;
  un segundo país en mínimo viable demuestra la escalabilidad.
- **Personal AI de verdad:** siempre activa, privada, con memoria controlable y skills reutilizables.

## 2. Principios premium (criterios de aceptación de diseño para todas las pantallas)

| Principio                    | Criterio verificable                                                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Confianza visible**        | Toda cifra es clicable → recibo; badges de verdad con texto + ícono (Verificado · Declarado · Calculado · Estimado · Desactualizado).  |
| **Velocidad**                | Interacciones locales < 100 ms (UI optimista); primer token de IA < 1,5 s (streaming); Lighthouse ≥ 90 en performance y accesibilidad. |
| **Calma por defecto**        | Máximo 1 notificación push diaria salvo alertas críticas; horario silencioso; cada notificación responde "¿qué gano con abrirla?".     |
| **Primer valor en 60 s**     | Onboarding de 3 preguntas (ingreso, fecha de pago, deuda principal) → primer plan del mes.                                             |
| **Identidad**                | Verde FINCH, tipografía editorial, microanimaciones de 150–250 ms, ilustración con el motivo del pájaro, modo oscuro de primera clase. |
| **Estados diseñados**        | Vacío, cargando (skeletons), error, sin conexión, desactualizado — diseñados para cada pantalla.                                       |
| **Accesibilidad**            | Navegación por teclado, lector de pantalla, contraste AA, nada comunicado solo por color (README §34–35).                              |
| **Criterio**                 | FINCH dice "vas bien, no hagas nada" cuando corresponde.                                                                               |
| **Privacidad como producto** | "Lo que FINCH sabe de ti", exportar/borrar en un clic, sin publicidad ni venta de datos.                                               |

## 3. Personas del demo (sintéticas, README §80)

| Persona                                                      | Perfil                                                                                                                                 | Funciones que luce                                                                                                                          |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Laura, 29, Medellín** (`credit_card_heavy`) — **estrella** | Salario COP 4,2 M el día 30; 2 tarjetas (una cerca de la usura); crédito de libre inversión; suscripciones olvidadas; SOAT por vencer. | B1 Payday Autopilot, B3 tarjetas, C1 ¿me lo puedo permitir?, D1 compra de cartera + CDT, D2 suscripciones, E1 recibos, E2 bóveda, F2 radar. |
| **Andrés, 34, Bogotá** (`freelancer_variable`)               | Ingresos variables en COP **y USD** (clientes del exterior); arriendo; metas.                                                          | B6 ingresos múltiples, G3 multimoneda/FX, D5 remesas, C3 modo tormenta, F5 ¿debo declarar renta?                                            |
| **Hogar Pérez** (`household_shared`)                         | Pareja con dos ingresos; gastos comunes; meta de cuota inicial.                                                                        | F1 finanzas compartidas, C4 metas con trade-offs, B5 cierre de mes.                                                                         |
| **Sofía, 31, segundo país** (paquete G4)                     | Persona mínima del segundo país.                                                                                                       | G4, G3.                                                                                                                                     |

## 4. Navegación (arquitectura de información)

Barra principal (5 destinos, móvil primero):

1. **Hoy** — briefing (G2), bandeja de Decision Cards (A6), próximos pagos (B4), safe-to-spend.
2. **Dinero** — sobres (B2), tarjetas (B3), cuentas e ingresos (B6), patrimonio (B8), salud (B7).
3. **FINCH** (botón central) — conversación con el agente: preguntar, simular (C1–C5), buscar (E3),
   capturar (cámara E1).
4. **Oportunidades** — mercado (D1), suscripciones (D2), anomalías (D3), gastos fijos (D4), remesas (D5).
5. **Yo** — metas (C4), hogar compartido (F1), protección (F2), bóveda (E2), hábitos (G1),
   pasaporte (F3), mis casos (F4), impuestos (F5), lo que FINCH sabe de ti (A7), Vigía (A11),
   canales y ajustes (H1–H3).

Detalle transversal: **panel de recibo** deslizable desde cualquier cifra; **segunda opinión** visible
en cada Decision Card.

## 5. Flujos principales

### F-A. "Me llegó el sueldo" (estrella del video)

```text
Laura comparte la notificación del banco (o toca "Me llegó un ingreso")
  → L extrae monto/fecha/origen → confirmación de 1 toque
  → budget.allocate: obligaciones → mínimos → págate primero → colchón → metas → libre
  → S explica el plan con marcadores → verificador → U: "APPROVE_WITH_WARNINGS: la tarjeta A
    está a 1,1 pp de la usura; considera compra de cartera"
  → Plan del mes con recibos + checklist de ejecución + Decision Card "compra de cartera"
  → sobres creados; calendario actualizado; briefing de mañana preparado
```

### F-B. "¿Me lo puedo permitir?"

Texto o foto del producto → C1 → veredicto (sí / sí con ajuste / espera hasta fecha / no
recomendado) + contado vs cuotas con intereses reales → opción "crear meta" si conviene esperar.

### F-C. Encontrar dinero

Importar extracto o reenviar correos → D2 detecta recurrentes y una subida de precio → D3 marca un
cargo duplicado → F4 redacta el reclamo → D1 encuentra mejor CDT para el colchón.

### F-D. Mercado y compra de cartera (flujo original, ampliado)

Pregunta → T trae usura vigente y ofertas → motor: conversión, costo total, usura, comparación →
Decision Card con ahorro en pesos → U revisa → borrador de solicitud (F4).

### F-E. Captura y bóveda

Foto de recibo → E1 extrae → confirmar → gasto en su sobre. Foto del SOAT → E2 guarda, extrae
vencimiento → recordatorio 30/7/1 días.

### F-F. Hogar compartido

Pareja Pérez: cada quien decide qué comparte → gastos comunes con división proporcional al ingreso
→ liquidación mínima → meta común de cuota inicial con trade-offs.

### F-G. Tormenta

"¿Y si me quedo sin trabajo?" → C3 runway con y sin recortes → plan semana a semana → U revisa →
Decision Cards de acciones (pedir periodo de gracia, pausar metas).

### F-H. Vigía y briefing

06:00 local → recalcula todo → consulta mercado (caché) → eventos → cards → push de la app con
mínimo PII → briefing en "Hoy" (y por correo si el usuario lo activó).

## 6. Skills del agente (tools)

Cada skill: nombre estable, versión, esquema zod → JSON Schema, clase de verdad de salida, recibo.

| Grupo              | Skills                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Twin y memoria     | `twin.get_snapshot` · `twin.record_fact`* · `memory.remember/recall/forget`                                                                                               |
| Crédito (CO)       | `finance.convert_rate` · `finance.amortization_schedule` · `finance.total_cost_of_credit` · `finance.check_usury` · `finance.compare_offers` · `finance.debt_payoff_plan` |
| Administración     | `budget.allocate` · `budget.envelope_state` · `cards.status` · `calendar.upcoming` · `month.close` · `health.score` · `networth.compute`                                  |
| Decisión           | `purchase.afford` · `scenario.project` · `stress.runway` · `goals.plan` · `invest.project`                                                                                |
| Mercado (T)        | `market.get_reference_rate` · `market.search_credit` · `market.search_deposits` · `market.search_plans` · `market.remittance_quotes` · `fx.rate`                          |
| Detección          | `recurring.detect` · `anomaly.scan`                                                                                                                                       |
| Captura            | `docs.extract_receipt`* · `docs.extract_document`* · `import.statement`* · `query.run` (DSL acotado)                                                                      |
| Hogar y protección | `split.settle` · `protection.gaps`                                                                                                                                        |
| Acciones R2        | `cards.create_decision_card` · `actions.draft_letter` · `passport.create_link`* · `reminders.schedule` · `cases.track`                                                    |
| Impuestos (CO)     | `tax.co.must_file` · `tax.co.cdt_withholding`                                                                                                                             |

`*` = requiere confirmación explícita del usuario antes de persistir o compartir.

## 7. Métricas de producto que se muestran en el demo

- Tiempo de "me llegó el sueldo" a plan del mes con recibos (< 10 s).
- % de cifras con recibo (100 %).
- Ahorro anual identificado para Laura (compra de cartera + suscripciones + CDT), **etiquetado como
  simulación**.
- Latencia p50/p95 y costo por conversación por nivel de modelo.
- Precisión de extracción de recibos y documentos antes de confirmación.

## 8. Aviso legal (copy base, a validar — D-07)

> _FINCH ofrece información y simulaciones educativas basadas en los datos que tú proporcionas y en
> fuentes públicas citadas. No es asesoría financiera, de inversión, legal ni tributaria
> personalizada, ni una oferta de productos. FINCH no recibe comisiones que alteren sus comparaciones
> y no mueve tu dinero. Verifica las condiciones finales con cada entidad._
