# 08 — Catálogo de funciones de FINCH

> **Estado:** PROPUESTO — aprobado en conversación por HELL el 2026-09-28; pendiente de revisión de Nairy.
> Este catálogo es la **fuente única** de alcance. `02-product-spec.md` describe la experiencia y
> `05-roadmap-and-timeline.md` la secuencia; si hay conflicto de alcance, manda este documento.

## Niveles

| Nivel | Significado                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------------- |
| **H** | Entra **completa, al máximo nivel de calidad y pulida** en la hackathon. Puede aparecer en el video. |
| **P** | Posterior a la hackathon. Queda **documentada** aquí como perspectiva de producto (sección P).       |

> **Decisión 2026-09-28 (HELL):** no hay funciones "MVP". Las 8 que estaban como H-MVP (D3, D4, D5,
> F3, F4, F5, G4, H3) suben a **H** con su alcance completo.

Reglas que aplican a **todas** las funciones (no se repiten en cada ficha):

1. Toda cifra mostrada sale de una fórmula versionada y trae **recibo** (Constitución §4.2–§4.5).
2. Toda salida de IA es `GENERATED_NARRATIVE`; lo que la IA extrae de documentos queda `ESTIMATED`
   hasta que el usuario lo confirma (`USER_ASSERTED`).
3. **FINCH nunca mueve dinero** (R3/R4 fuera de alcance, ADR-0021). Planifica, controla, verifica y
   redacta; el usuario ejecuta.
4. Rankings de productos **neutrales**: ninguna comisión altera el orden (Constitución §4.15).
5. Recomendaciones de inversión: **simulación educativa**, nunca "compra X" (asesoría regulada).
6. La app es **autónoma**: ninguna función depende de un canal externo (ADR-0039).
7. Datos de mercado vía Tavily/fuentes oficiales: con URL, fecha, frescura; si no hay dato, se
   dice — nunca se inventa.

Leyenda de modelos: **L** = Nemotron 3.5 Lightning · **S** = Nemotron 3 Super · **U** = Nemotron 3
Ultra · **V** = multimodal NVIDIA (VERIFICAR disponibilidad) · **E** = embeddings · **T** = Tavily.
Dueño: **H** = HELL, **N** = Nairy (propuesta; ver 05).

---

## Resumen del alcance

| Módulo                       | H (hackathon, completo)                                                                                                                        | P (documentado)                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **A. Núcleo de confianza**   | A1–A11                                                                                                                                         | —                                  |
| **B. Administrar el dinero** | B1 Payday Autopilot · B2 Sobres · B3 Tarjetas · B4 Calendario · B5 Cierre de mes · B6 Ingresos múltiples · B7 Salud financiera · B8 Patrimonio | —                                  |
| **C. Decidir**               | C1 ¿Me lo puedo permitir? · C2 ¿Y si…? · C3 Modo tormenta · C4 Metas · C5 Simulador de inversión                                               | —                                  |
| **D. Encontrar dinero**      | D1 Opportunity Engine · D2 Suscripciones · D3 Anomalías · D4 Gastos fijos · D5 Remesas                                                         | —                                  |
| **E. Capturar y ordenar**    | E1 Recibos y facturas por foto · E2 Bóveda · E3 Buscador en lenguaje natural · E4 Importación                                                  | —                                  |
| **F. Compartir y proteger**  | F1 Finanzas compartidas · F2 Radar de protección · F3 Pasaporte financiero · F4 Copiloto de derechos · F5 Impuestos CO                         | —                                  |
| **G. Experiencia global**    | G1 Hábitos · G2 Briefing · G3 Multimoneda y FX en vivo · G4 Segundo país                                                                       | —                                  |
| **H. Canales (Channel Hub)** | H1 Bandeja + push de la app · H2 Calendario .ics · H3 Correo entrada/salida                                                                    | H4 Telegram · H5 SMS · H6 WhatsApp |
| **P. Futuro**                | —                                                                                                                                              | P1–P10                             |

**Total hackathon:** **45 funciones H** (P: 3 canales + P1–P10 documentados). Esfuerzo y capacidad en 05 §0.

---

## A. Núcleo de confianza (H) — lo que hace a FINCH distinta de cualquier app de finanzas

| ID  | Función                     | Qué hace (resumen; detalle en 02 y 04)                                                                                                         | Acepta cuando                                                     | Dueño |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----- |
| A1  | **Financial Twin**          | Estado financiero versionado: cuentas, deudas, tarjetas, ingresos, obligaciones, metas, activos; cada hecho con clase de verdad y procedencia. | Snapshot inmutable con checksum; cada hecho muestra origen.       | H     |
| A2  | **Motor financiero**        | Fórmulas de `docs/financial-formulas/` (crédito CO + finanzas personales), versionadas, con golden vectors independientes.                     | `pnpm financial:verify` verde; vectores verificados por N.        | H     |
| A3  | **Recibos + verificador**   | La IA escribe marcadores, no cifras; verificador determinista bloquea números sin recibo; cifras clicables → recibo.                           | E3 = 0 cifras sin recibo en producción.                           | H     |
| A4  | **Agente por niveles**      | L enruta/extrae · S orquesta skills · U audita. Fallback por nivel hasta plantilla.                                                            | E2 ≥ 90 % tool calls correctos (se reporta el real).              | H     |
| A5  | **Segunda opinión (Ultra)** | U revisa cada Decision Card/acción: APPROVE / WARN / BLOCK con hallazgos visibles.                                                             | Hallazgos renderizados; BLOCK impide la acción.                   | H     |
| A6  | **Decision Cards**          | Estructura README §17, persistidas como datos; bandeja priorizada.                                                                             | Todas las recomendaciones de B–F salen como Decision Card.        | H+N   |
| A7  | **Memoria controlable**     | Twin + recuerdos (metas, preferencias, restricciones) con E; "Lo que FINCH sabe de ti".                                                        | Olvidar excluye el recuerdo en el siguiente turno (E2E).          | H+N   |
| A8  | **Privacidad por diseño**   | Redacción de PII antes del LLM, consentimiento por fuente, auditoría, exportar/borrar todo.                                                    | E4: 0 fugas de PII al proveedor.                                  | H     |
| A9  | **Evals publicadas**        | E1–E6 (04 §7) + scorecard en README.                                                                                                           | `evals/RESULTS.md` con números reales.                            | H+N   |
| A10 | **Bilingüe, global-ready**  | ES/EN; formatos por locale; reglas de país en `jurisdictions/`.                                                                                | Cambio de idioma/país sin recargar estado.                        | N     |
| A11 | **Vigía siempre activo**    | Nebius Serverless Job diario: recalcula, consulta mercado, detecta eventos, genera cards + briefing.                                           | Corre solo 06:00 local; "ejecutar ahora" en la UI; log con costo. | H     |

---

## B. Administrar el dinero (H) — la "wallet administrativa inteligente"

### B1. Payday Autopilot — **estrella del video**

- **Qué hace:** detecta la llegada de un ingreso y en segundos propone el **plan del mes**: cuánto va
  a cada obligación (con fecha), a deudas (priorizadas), al fondo de emergencia, a metas, a
  inversión/ahorro y cuánto queda libre. El usuario acepta, ajusta con sliders o pide cambios en
  lenguaje natural. Luego genera el **checklist de ejecución** ("transfiere X a…") y verifica su
  cumplimiento con los movimientos siguientes.
- **Detección de ingreso (cualquiera):** (1) botón "Me llegó un ingreso"; (2) texto/captura de la
  notificación del banco pegada o compartida a la app (L/V extrae monto, fecha, origen); (3) correo
  reenviado a la dirección privada (H3); (4) extracto importado (E4); (5) fecha habitual aprendida.
- **Motor:** `budget.allocate@1` — asignación determinista por prioridades: obligaciones con
  vencimiento antes del próximo ingreso → mínimos de deuda → colchón hasta objetivo → metas por
  prioridad/fecha → excedente por estrategia de deuda o ahorro. Regla configurable ("págate primero
  10 %", "50/30/20", personalizada).
- **IA:** L extrae y clasifica; S explica el plan y aplica cambios pedidos ("quiero más para el viaje");
  U revisa que no queden obligaciones descubiertas.
- **Acepta cuando:** con la persona Laura, desde "Me llegó el sueldo" hasta plan con recibos < 10 s;
  la suma de asignaciones = ingreso exacto (conservación verificada por test).
- **Límite:** FINCH no mueve dinero; el checklist lo ejecuta el usuario. Dueño: H (motor/IA) + N (UI).

### B2. Sobres y presupuesto vivo

- **Qué hace:** sobres virtuales (hogar, mercado, transporte, deudas, ahorro, inversión, ocio…) que
  nacen del plan de B1. Cada gasto registrado descuenta; alertas al 80 % y 100 %; mover dinero entre
  sobres con un gesto (registro, no transferencia real).
- **Motor:** `budget.envelope_state@1`, conservación de totales.
- **Acepta cuando:** registrar un gasto actualiza sobre, saldo proyectado y safe-to-spend al instante.
  Dueño: N (UI) + H (motor).

### B3. Control de tarjetas de crédito

- **Qué hace:** por tarjeta: cupo, uso %, fecha de corte y de pago, saldo a la fecha de corte, costo
  de diferir a N cuotas, interés generado en el mes, pago mínimo vs pago total y su costo, alerta de
  tasa cercana a la usura (A2).
- **Recomendación:** qué tarjeta usar para una compra (según fecha de corte → más días sin interés
  cuando aplica) y cuál abonar primero.
- **Acepta cuando:** para cada tarjeta se ve "si pagas el mínimo, pagarás X de intereses este mes"
  con recibo. Dueño: H + N.

### B4. Calendario financiero

- Todos los pagos, cortes, ingresos, vencimientos (E2) y metas en un calendario; ajuste por festivos
  (`jurisdictions/*/calendar`); vista mes y "próximos 7 días". Export .ics (H2).
  Dueño: N.

### B5. Cierre de mes

- Reporte automático al cierre: plan vs real por sobre, cumplimiento del checklist B1, deudas
  reducidas, ahorro logrado, 3 aprendizajes y el ajuste propuesto para el mes siguiente (Decision
  Card). Dueño: N (UI) + H (motor).

### B6. Ingresos múltiples

- Salario, honorarios, arriendos, negocio, ingresos en otra moneda. Para variables: proyección
  conservadora (p25) marcada `ESTIMATED`. Diversificación de ingreso visible. Dueño: H.

### B7. Salud financiera

- Puntaje 0–100 **explicable y determinista** (`health.score@1`): relación deuda/ingreso, uso de
  cupo, meses de colchón, tasa de ahorro, puntualidad de pagos, concentración de ingresos. Cada
  componente con peso publicado, su recibo y "cómo subir 5 puntos". Nunca "score crediticio" (no
  sustituye centrales de riesgo). Dueño: H + N.

### B8. Patrimonio neto vivo

- Activos (cuentas, CDTs, inversiones, vehículo con depreciación estimada, inmueble declarado) −
  pasivos; evolución mensual; "qué lo movió". Multimoneda (G3). Dueño: H + N.

---

## C. Decidir mejor (H)

| ID  | Función                              | Qué hace                                                                                                                                                                                                                                               | Motor / IA                                                                                       | Acepta cuando                                                      | Dueño |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----- |
| C1  | **¿Me lo puedo permitir?**           | Antes de comprar: impacto en mes, sobres y metas; contado vs 1/12/36 cuotas con interés real en pesos; costo de oportunidad; veredicto "sí / sí pero / mejor espera X días" con razones.                                                               | `purchase.afford@1` (forecast + amortización). L entiende "quiero unos audífonos de 800 mil".    | Respuesta con recibos < 5 s; muestra en qué fecha sí sería cómodo. | H + N |
| C2  | **Simulador "¿Y si…?"**              | Escenarios en lenguaje natural o sliders: aumento/pérdida de ingreso, compra a crédito, mudanza, independizarse, hijo; efecto a 12–60 meses sobre deudas, metas, colchón, patrimonio; hasta 3 escenarios lado a lado.                                  | Simulación sobre copia del snapshot (nunca muta estado). S traduce texto → parámetros validados. | Comparación visual de 3 escenarios con recibos.                    | H + N |
| C3  | **Modo tormenta**                    | "Si pierdo mi ingreso hoy": meses de autonomía, orden de recortes, deudas a priorizar, qué pedir al banco (periodo de gracia, reestructuración) y plan semana a semana.                                                                                | `stress.runway@1`. U revisa el plan.                                                             | Plan generado con runway exacto y lista de acciones.               | H     |
| C4  | **Metas con negociación**            | Varias metas con fecha y prioridad: factibilidad, aporte mensual, probabilidad bajo escenario conservador y trade-offs explícitos ("adelantar el viaje atrasa la cuota inicial 4 meses").                                                              | `goals.plan@1` (asignación por prioridad/fecha).                                                 | Cambiar una prioridad recalcula todas con recibos.                 | H + N |
| C5  | **Simulador de inversión educativo** | Perfil de riesgo (cuestionario), proyección de aportes periódicos con escenarios (conservador/base/optimista) y efecto de inflación e impuestos; compara clases de producto (CDT, fondo de liquidez, etc.) — **nunca** recomienda un valor específico. | `invest.project@1`. S explica; copy legal de simulación.                                         | Proyección con 3 escenarios y supuestos visibles.                  | H     |

---

## D. Encontrar dinero

### D1. Opportunity Engine (H) — créditos, CDTs, ahorro, compra de cartera

- **Qué hace:** (a) **mejor crédito** para una necesidad (monto, plazo) comparando **costo total
  real**, no solo tasa; (b) **compra de cartera** para deudas actuales; (c) **mejores CDTs y cuentas
  de ahorro** por **rentabilidad neta real** (después de retención en la fuente e inflación) con
  plazo, liquidez y cobertura del seguro de depósitos (VERIFICAR condiciones de Fogafín); (d) avisos
  del Vigía cuando aparece una opción mejor.
- **Datos:** T (Search + Extract) sobre páginas públicas de entidades y fuentes oficiales;
  allowlist de dominios; parseo determinista; frescura; sin logos de terceros en el video.
- **Motor:** `credit.total_cost@1`, `credit.compare_refinance@1`, `deposit.net_return@1`.
- **Ranking:** determinista y publicado (criterios y pesos visibles). Si en el futuro hay ingresos por
  referidos, se declaran y **no** entran al ranking.
- **Acepta cuando:** para Laura, top-3 CDTs y top-3 opciones de compra de cartera con fuente, fecha y
  ahorro en pesos. Dueño: H (datos/motor) + N (UI). **Uso central de Tavily.**

### D2. Detective de suscripciones y cargos recurrentes (H)

- Detecta suscripciones, cargos duplicados, subidas silenciosas de precio, pruebas gratis que
  empezaron a cobrar, cuota de manejo que subió; total anual en pesos; borrador de cancelación o
  reclamo (F4).
- **Motor:** `recurring.detect@1` (periodicidad ± tolerancia, monto, comercio normalizado por L).
- **Acepta cuando:** con el extracto sintético de Laura detecta ≥ 5 recurrentes y 1 subida de precio.
  Dueño: H.

### D3. Detector de anomalías (H)

- **Qué hace:** vigila cada movimiento nuevo y explica lo raro, con siguiente paso concreto.
- **Reglas deterministas (versionadas, `anomaly.scan@1`):** cargo duplicado (mismo comercio y monto
  en < 48 h); comisión o cargo bancario nuevo o que subió; compra en moneda extranjera con sobrecosto
  de cambio vs tasa de referencia (G3); gasto fuera de patrón (> p95 de su categoría o z-score > 3
  sobre su historial); cargo en comercio nunca visto por encima de un umbral; cobro después de una
  cancelación registrada (D2); intereses cobrados en una tarjeta que el usuario marcó como pagada
  completa.
- **Aprendizaje por usuario:** línea base por categoría y comercio con ventana móvil; el usuario marca
  "es normal" y la regla se ajusta para él (umbral personal, auditado).
- **Salida:** Decision Card con evidencia (movimientos implicados), severidad y acción: reclamar (F4),
  confirmar, ignorar. Integrada al Vigía y al push.
- **Acepta cuando:** en el dataset sintético de anomalías (≥ 30 casos plantados + ruido) precisión y
  recall ≥ 90 % (se reporta el real); cada alerta explica por qué con recibo. Dueño: H.

### D4. Optimizador de gastos fijos (H)

- **Qué hace:** revisa **todos** los gastos fijos detectados (D2/B2) — plan de celular, internet,
  televisión/streaming, seguros voluntarios, gimnasio, servicios con tarifa comparable — y busca
  alternativas públicas equivalentes o mejores.
- **Cómo:** normalización de la oferta actual (L); T Search + Extract sobre páginas públicas de
  proveedores de la allowlist por categoría; comparación determinista por atributos (precio, datos,
  velocidad, cobertura, permanencia/cláusulas) → ahorro anual con fuentes y fecha; alertas del Vigía
  cuando aparece una mejor opción; borrador de solicitud de cambio o cancelación (F4).
- **Acepta cuando:** para Laura encuentra alternativas en ≥ 3 categorías con ahorro anual calculado y
  fuentes; ranking neutral y criterios visibles. Dueño: H (datos) + N (UI).

### D5. Comparador de remesas (H)

- **Qué hace:** costo total real de enviar o recibir dinero entre países = comisión + margen del tipo
  de cambio frente a la tasa de referencia (G3), en moneda de origen y en %; cuánto recibe
  exactamente el destinatario; velocidad y método de entrega.
- **Cobertura:** corredores principales hacia Colombia (EE. UU., España, Chile) y los del segundo
  país (G4), para 4–6 servicios con precios públicos vía T, con fecha y hora de consulta.
- **Extras:** simulación "si envías cada mes X, al año pierdes Y en costos"; alerta del Vigía cuando
  el costo baja; ingreso en otra moneda (Andrés) tratado con el mismo motor.
- **Motor:** `fx.remittance_cost@1`, `fx.convert@1`. **Acepta cuando:** para 3 corredores muestra
  ranking con costos exactos y fuentes; conservación de montos verificada. Dueño: H.

---

## E. Capturar y ordenar (H)

### E1. Recibos y facturas por foto (H)

- **Qué hace:** foto del recibo/factura (cámara del móvil vía PWA) o PDF → comercio, fecha, total,
  impuestos, ítems relevantes → categoría y sobre sugeridos → **confirmación** → gasto registrado.
  Factura electrónica colombiana (XML/PDF por correo, H3): extracción estructurada; marca las compras
  relevantes para deducciones en renta si aplica (VERIFICAR regla vigente con la DIAN; F5).
- **IA:** V extrae; L normaliza comercio y categoría; validaciones deterministas (suma de ítems ≈
  total, fecha válida, moneda).
- **Acepta cuando:** 10 recibos sintéticos variados con ≥ 90 % de campos correctos antes de
  confirmación (se reporta el real); la confirmación nunca se salta. Dueño: H (pipeline) + N (UI de
  cámara y confirmación).

### E2. Bóveda de documentos con vencimientos (H)

- **Qué hace:** guarda pólizas, contratos (arriendo, crédito), garantías, SOAT, revisión
  técnico-mecánica, extractos, certificados; extrae **fechas clave y montos**; recordatorios antes
  del vencimiento (30/7/1 días) en calendario (B4) y bandeja; búsqueda por contenido (E).
- **Seguridad:** cifrado en reposo, acceso solo del dueño del workspace (o compartido explícito en
  F1), cuarentena al subir, borrado real al eliminar.
- **Acepta cuando:** subir un SOAT sintético crea su vencimiento y recordatorio con confirmación.
  Dueño: H + N.

### E3. Buscador en lenguaje natural (H)

- "¿Cuánto gasté en domicilios en agosto?", "¿qué mes gasté más en transporte?", "muéstrame pagos a
  Claro este año". S traduce a un **DSL de consulta acotado** (filtros, agrupaciones, rangos) validado
  con esquema — **nunca SQL libre** —; el backend ejecuta; respuesta con tabla/gráfico y recibo de
  consulta.
- **Acepta cuando:** 30 preguntas del dataset E2 con ≥ 90 % de consultas correctas; 0 consultas fuera
  del workspace (test de autorización). Dueño: H + N.

### E4. Importación de datos (H)

- Extractos CSV/XLSX/PDF (texto), notificaciones bancarias pegadas/compartidas, carga manual rápida.
  Deduplicación determinista; normalización de comercios (L); todo con procedencia `IMPORT`/`DOCUMENT`.
  Dueño: H.

---

## F. Compartir y proteger

### F1. Finanzas compartidas (H)

- **Qué hace:** workspace compartido (pareja, hogar, roommates) sobre el modelo Principal / Party /
  Workspace / Membership ya diseñado (README §8, ADR-0010/0011). Gastos compartidos con reglas de
  división (partes iguales, proporcional al ingreso, montos fijos), liquidación "quién le debe a
  quién" con mínimo número de transferencias, metas y sobres comunes. **Cada persona decide qué
  comparte**; lo personal sigue privado.
- **Motor:** `split.settle@1` (liquidación mínima, conservación de totales).
- **Acepta cuando:** Hogar Pérez (2 personas) ve gastos comunes, proporción por ingreso y liquidación
  correcta; test de autorización: un miembro no ve cuentas no compartidas del otro. Dueño: H (auth +
  motor) + N (UI).

### F2. Radar de protección (H)

- **Qué hace:** evalúa (a) fondo de emergencia vs objetivo (meses de gastos esenciales); (b)
  dependientes económicos y cobertura existente; (c) seguros ya pagados dentro de créditos o tarjetas
  (posible duplicidad); (d) riesgos sin cubrir. Resultado: mapa de protección con prioridades
  educativas. **No vende ni recomienda aseguradoras.**
- **Motor:** `protection.gaps@1` (reglas deterministas publicadas).
- **Acepta cuando:** para Laura detecta el seguro de vida deudor duplicado en dos créditos y el
  colchón insuficiente, con recibos. Dueño: H + N.

### F3. Pasaporte financiero (H)

- **Qué hace:** documento compartible para arrendadores, bancos o empleadores que demuestra solidez
  financiera **sin exponer movimientos**: ingreso promedio y estabilidad (3–12 meses), relación
  deuda/ingreso, meses de colchón, puntualidad de pagos, salud financiera (B7) y patrimonio (B8)
  opcional.
- **Control del usuario:** elige qué indicadores incluir; enlace firmado que **expira** (24 h, 7 d,
  30 d) y se **revoca** en un toque; opcional con código de acceso; registro de cada apertura (quién,
  cuándo, desde dónde aproximado); versión PDF con código de verificación que valida contra FINCH.
- **Honestidad:** cada indicador marca su clase de verdad (declarado por el usuario, derivado de
  extractos importados, observado); nunca se presenta como certificación bancaria.
- **Acepta cuando:** crear, abrir, expirar y revocar funcionan con tests de seguridad (enlace
  revocado → 410; enlace manipulado → rechazo). Dueño: H + N (diseño del documento).

### F4. Copiloto de derechos del consumidor financiero (H)

- **Qué hace:** acompaña al usuario frente a su entidad financiera de principio a fin.
- **Casos cubiertos:** cobro indebido o no reconocido; comisión/cuota de manejo no pactada; seguros
  cobrados sin autorización; solicitud de compra de cartera o renegociación de tasa; paz y salvo o
  certificado de deuda; reporte negativo en centrales de riesgo (derecho de habeas data financiero);
  reclamo no respondido; cancelación de productos o suscripciones (D2/D4).
- **Flujo:** diagnóstico guiado → ruta (entidad → Defensor del Consumidor Financiero → queja ante la
  SFC u autoridad competente) → **documento** (petición, reclamo, solicitud) en PDF con cifras con
  recibo y evidencia adjunta desde la bóveda (E2) → **seguimiento del caso** con plazos legales,
  recordatorios y escalamiento sugerido si vence el plazo.
- **Marco legal:** citado con fuente y fecha (VERIFICAR con abogado: Ley 1328 de 2009, régimen de
  habeas data financiero, plazos de respuesta a peticiones). Las plantillas se revisan antes del
  lanzamiento público.
- **Acepta cuando:** los 8 casos generan documento y caso con plazos; U revisa cada documento.
  Dueño: N (flujos/plantillas) + H (PDF, casos, recibos).

### F5. Impuestos Colombia (H)

- **Qué hace:** conciencia tributaria personal completa, siempre con fuente oficial y marcada
  `ESTIMATED`:
  - **¿Debo declarar renta?** con los topes del año gravable (patrimonio, ingresos, consumos con
    tarjeta, compras, consignaciones) leídos de fuente oficial DIAN vía T; si no hay fuente fresca, no
    afirma.
  - **Calendario DIAN** según los últimos dígitos del documento, con recordatorios (B4).
  - **Retención en la fuente** en rendimientos (CDT, cuentas) integrada a D1.
  - **GMF (4×1.000)** en flujos, con marcación de la cuenta exenta si el usuario la declara.
  - **Estimador de renta de personas naturales** (cédula general) con rentas exentas y deducciones
    más comunes (dependientes, intereses de vivienda, medicina prepagada, aportes voluntarios, compras
    con factura electrónica — reglas y topes VERIFICAR con fuente oficial y contador), como
    **simulación**.
  - **Checklist de documentos** para declarar, alimentado por la bóveda (E2) y las facturas (E1).
- **Acepta cuando:** para Andrés responde "¿debo declarar?" con fuente y fecha, genera calendario y
  una simulación con supuestos visibles; golden vectors de las reglas verificados contra ejemplos
  oficiales. Dueño: H (+ revisión de contador antes del lanzamiento público).

---

## G. Experiencia global y hábitos

| ID  | Función                       | Nivel | Qué hace                                                                                                                                                                                                                                                                                                                              | Dueño |
| --- | ----------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| G1  | **Compromisos y hábitos**     | H     | Retos elegidos por el usuario ("7 días sin domicilios", "redondeo virtual al ahorro", "no usar tarjeta X este mes") con progreso en pesos reales y celebración sobria; el Vigía hace seguimiento. Sin gamificación infantil.                                                                                                          | N + H |
| G2  | **Briefing diario y semanal** | H     | En la app cada mañana: 3 cosas que importan hoy (pagos, alertas, oportunidad); semanal: logros, desvíos, ajuste. Cifras con recibo. Opcionalmente también por correo (H3).                                                                                                                                                            | N + H |
| G3  | **Multimoneda y FX en vivo**  | H     | Cuentas, ingresos y gastos en varias monedas; tasas de cambio de fuentes oficiales/de referencia con fecha y fuente (VERIFICAR proveedor: banco central/ECB/API pública); patrimonio y presupuesto consolidados en moneda base; sobrecosto de cambio en compras internacionales. `fx.convert@1` con procedencia.                      | H     |
| G4  | **Segundo país completo**     | H     | `jurisdictions/<país>/` completo: moneda, festivos, convenciones de tasas, tasas de referencia oficiales, techo de interés si existe, productos de ahorro/crédito locales para D1, corredor de remesas (D5), copy legal y persona demo; demuestra que FINCH escala sin tocar el núcleo. País: **decisión D-11** (México recomendado). | H     |

---

## H. Canales — Channel Hub (ADR-0039)

La app es autónoma; los canales son adaptadores opcionales con consentimiento propio.

| ID  | Canal                               | Nivel | Alcance                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ----------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | **Bandeja + push de la propia app** | H     | Bandeja interna de Decision Cards y alertas; **Web Push** en la PWA instalable (VERIFICAR soporte iOS de web push en PWA instalada); preferencias por tipo de alerta; horario silencioso. Es el canal principal.                                                                                                                                                                                                      |
| H2  | **Exportar calendario (.ics)**      | H     | Suscripción .ics privada con fechas de pago/vencimientos (sin montos).                                                                                                                                                                                                                                                                                                                                                |
| H3  | **Correo: entrada y salida**        | H     | **Entrada:** dirección privada por usuario (rotable) para reenviar notificaciones bancarias, facturas electrónicas y documentos → E1/E2/E4, con reglas de reenvío automático guiadas, cuarentena y contenido no confiable. **Salida:** briefing diario/semanal y alertas críticas con mínimo PII y plantillas de marca; preferencias y baja en un clic (proveedor transaccional; VERIFICAR costo, dominio, SPF/DKIM). |
| H4  | Telegram                            | P     | Adaptador opcional: preguntas y alertas. Diseño listo por el puerto; sin prioridad.                                                                                                                                                                                                                                                                                                                                   |
| H5  | SMS                                 | P     | Entrada (reenvío de SMS bancarios) y salida de alertas críticas vía proveedor (VERIFICAR costos y numeración en CO).                                                                                                                                                                                                                                                                                                  |
| H6  | WhatsApp                            | P     | WhatsApp Business Platform: requiere verificación de empresa en Meta, plantillas aprobadas y opt-in — se inicia tras constituir la sociedad.                                                                                                                                                                                                                                                                          |

---

## P. Perspectiva futura (documentada, no se construye en la hackathon)

| ID  | Función                                               | Por qué importa                                                                                | Condición para iniciarla                                                                            |
| --- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| P1  | **Apps nativas iOS/Android (Expo) y desktop (Tauri)** | Push nativo, widgets, biometría, lectura de notificaciones bancarias en Android (con permiso). | Q1 2027 (ADR-0004/0006).                                                                            |
| P2  | **Open finance / agregador**                          | Datos bancarios automáticos, fin de la carga manual.                                           | Proveedor elegido; VERIFICAR estado regulatorio de open finance en Colombia.                        |
| P3  | **Ejecución automática con socio regulado**           | Payday Autopilot que sí mueve dinero (R3).                                                     | Gates F/G, socio regulado, revisión externa (ADR-0021).                                             |
| P4  | **Proyección de retiro**                              | Planeación de largo plazo.                                                                     | Modelo del sistema pensional colombiano verificado con fuente oficial y experto (reforma reciente). |
| P5  | **Modo voz**                                          | Accesibilidad y conveniencia.                                                                  | Modelo de voz disponible en Nebius/NVIDIA (VERIFICAR).                                              |
| P6  | **Servidor MCP "FINCH Skills"**                       | FINCH como cerebro financiero de otros agentes personales.                                     | Post-hackathon; skills de solo cálculo.                                                             |
| P7  | **Inferencia privada dedicada**                       | Documentos sensibles procesados en endpoint propio (Nebius Serverless Endpoint).               | Presupuesto de AI Cloud.                                                                            |
| P8  | **Fine-tuning (LoRA) de extracción**                  | Mejor precisión en documentos colombianos.                                                     | Dataset sintético/consentido suficiente.                                                            |
| P9  | **Seguridad social del independiente**                | Cálculo y recordatorio de aportes.                                                             | Reglas vigentes verificadas con fuente oficial.                                                     |
| P10 | **FINCH para microempresas**                          | Persona `microbusiness_owner`: flujo de caja del negocio separado del personal.                | Tras validar el producto personal.                                                                  |

---

## Trazabilidad con criterios del jurado

| Criterio                     | Funciones que más aportan                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Technological Implementation | A3, A4, A5, A11, E1 (multimodal), E3 (DSL seguro), D1 (Tavily + parseo), A9 (evals)                                                         |
| Design                       | B1, B2, B3, H1, C2, E2, G2 — experiencia completa y coherente, premium                                                                      |
| Potential Impact             | B1, B3, C3, D1, D2, F2, F4 — ahorro y protección demostrables en pesos                                                                      |
| Quality of the Idea          | A3 (el modelo no puede escribir cifras), A5 (Ultra auditor), F1 (finanzas compartidas con privacidad por miembro), F3 (pasaporte revocable) |
| Best Use of Tavily           | D1, D4, D5, F5, G3 — datos de mercado en tiempo real, citados y verificados                                                                 |
