# 00 — Reglas oficiales y cumplimiento

Fuente: Official Rules de la Nebius x NVIDIA Global AI Hackathon (Devpost), texto provisto por
los fundadores el 2026-09-28. **Si algo aquí contradice las reglas oficiales, mandan las reglas.**
Antes del envío, releer <https://nebiusglobalaihackathon.devpost.com/rules>: el sponsor puede
modificarlas (§11 de las reglas).

---

## 1. Fechas (convertidas a hora Colombia, UTC-5, sin horario de verano)

| Hito                         | Hora oficial                                   | Hora Colombia               | Nota                                                   |
| ---------------------------- | ---------------------------------------------- | --------------------------- | ------------------------------------------------------ |
| Inicio del Submission Period | mié 26-ago-2026 09:00 PT (PDT)                 | 26-ago 11:00                | Ya abierto.                                            |
| **Cierre de envíos**         | **vie 30-oct-2026 10:00 PT (PDT, UTC-7)**      | **30-oct 12:00**            | Después no se puede editar el envío.                   |
| Periodo de jurados           | 01-dic 09:00 PT (PST, UTC-8) → 15-dic 12:00 PT | 01-dic 12:00 → 15-dic 15:00 | **Demo vivo y gratis para jurados todo este periodo.** |
| Anuncio de ganadores         | ~lun 11-ene-2027 12:00 PT                      | ~11-ene 15:00               | Luego vienen los affidavits (10 días hábiles).         |

> El horario de verano de EE. UU. termina el 1-nov-2026. Por eso el cierre usa PDT (UTC-7) y el
> periodo de jurados usa PST (UTC-8).

**Deadline interno:** envío completo el **jueves 29-oct antes de las 18:00**. El 30-oct solo se
usa si Devpost o YouTube fallan.

## 2. Elegibilidad

- Colombia **no** está excluida (las exclusiones son Brasil, Quebec, Rusia, Crimea, Cuba, Irán,
  Corea del Norte y los países con sanciones OFAC completas).
- Ambos deben ser mayores de edad en su país.
- **Forma de participar recomendada: Team** (HELL + Nairy) con **HELL como Representative**. El
  premio se paga al Representative, que lo reparte entre el equipo. Alternativa: participar como
  _Organization_, pero solo si la sociedad (p. ej. una S.A.S.) **ya existe al momento del envío**.
  En ese caso el pago va a la cuenta de la sociedad (ver [07](07-risks-and-decisions.md), D-05).
- No puede haber apoyo financiero ni preferencial previo de Nebius o Devpost (no aplica).
- Ningún jurado puede ser empleador de ninguno de los dos (verificarlo cuando se publiquen los jurados).

## 3. Requisitos del proyecto → cómo los cumple FINCH

| Regla             | Texto clave                                                                                                 | Cumplimiento FINCH                                                                                                                                                                                     | Evidencia                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Runs on Nebius    | "makes a runtime call to the Token Factory inference API, or is deployed/run using Nebius AI Cloud compute" | **Ambas vías.** Todas las inferencias pasan por Token Factory (API compatible con OpenAI). El _Vigía_ nocturno corre como **Nebius Serverless Job** (objetivo; fallback en ADR-0038).                  | `GET /api/health` muestra el proveedor y el modelo; traces en LangSmith; video. |
| NVIDIA open model | "uses at least one NVIDIA open source model"                                                                | Nemotron 3.5 Lightning, Nemotron 3 Super y Nemotron 3 Ultra (ver [04](04-ai-design-safety-evals.md)).                                                                                                  | Registro de modelos en `packages/ai-core`; README; video.                       |
| Track             | "fits into one of the four hackathon tracks"                                                                | **Personal AI Track** (recomendado; ver [01](01-strategy-and-track.md)).                                                                                                                               | Formulario de Devpost.                                                          |
| Stage One         | "genuine attempt at the track's stated goal, not a superficial rebrand"                                     | El producto _es_ un asistente personal privado y siempre activo, con memoria, skills, herramientas y tareas. Cada frase de la definición del track tiene una funcionalidad explícita (tabla en 01 §3). | Tabla de trazabilidad en el README para jurados.                                |
| Functionality     | "installed and running consistently… function as depicted"                                                  | Demo público estable, datos sintéticos precargados, _seed_ reproducible, health checks, degradación sin IA.                                                                                            | Uptime monitor; runbook del demo.                                               |
| New & Existing    | "newly created… or significantly updated after the start"                                                   | El repo nace el **17-sep-2026** (primer commit), **después** del 26-ago: es un proyecto nuevo dentro del periodo. Igual se documenta la línea de tiempo.                                               | `git log`; sección "Built during the Submission Period" del README.             |
| Third-party       | "must be authorized to use them"                                                                            | Nebius, Tavily, LangSmith y Toloka se usan bajo sus términos; el modelo Llama Guard se usa bajo su licencia. Fuentes públicas colombianas: solo lectura con cita.                                      | `THIRD_PARTY.md` (tarea S3-12).                                                 |

## 4. Requisitos del envío → lista de verificación

Marcar cada casilla en el PR de envío (tarea S4-05). **Si falta una, el envío puede caer en Stage One.**

- [ ] **URL del demo** funcionando, sin login obligatorio (modo "Probar como persona") o con
      credenciales en las instrucciones de testing. Gratis y sin restricción hasta el 15-dic.
- [ ] **Descripción** en inglés con funcionalidades (borrador en [06](06-submission-kit.md)).
- [ ] **Repositorio público** en GitHub con **licencia OSI detectada por GitHub** y visible en
      _About_ (Apache-2.0 recomendada, ADR-0037). Verificar que el panel _About_ muestre "Apache-2.0 license".
- [ ] El repo contiene **todo** el código, los assets y las instrucciones para que funcione.
- [ ] **README en inglés** con setup, cómo correrlo, **cómo se usa Nemotron, dónde Token Factory
      aceleró el trabajo y qué otros servicios Nebius se usan**.
- [ ] **Video < 3:00** (apuntar a 2:50), **público en YouTube**, que muestre el proyecto funcionando
      en el dispositivo objetivo (navegador y móvil/Telegram), con **audio explicando el uso de
      Token Factory y Nemotron**. Sin música con copyright ni marcas de terceros sin permiso: usar
      música libre de regalías con licencia documentada, o ninguna. Tampoco logos de bancos reales.
- [ ] **Track** seleccionado: Personal AI.
- [ ] **Feedback** sobre Token Factory, AI Cloud y herramientas NVIDIA, completo y concreto (también
      compite por _Most Valuable Feedback_, 10 × USD 100 + swag).
- [ ] Explicación de "qué se actualizó en el periodo" (aunque es proyecto nuevo, declararlo).
- [ ] Todo el material en **inglés**, o con traducción al inglés: video (subtítulos EN si se habla
      en español), descripción e instrucciones de testing.
- [ ] Ciudad de Builders & Brews: **no aplica** salvo que alguno asista a Ciudad de México u otra
      ciudad de la lista.

## 5. Criterios de jurado (Stage Two, mismo peso)

| Criterio                                            | Pregunta del jurado                                                                                     | Qué lo gana en FINCH                                                                                                                                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Technological Implementation** (primer desempate) | ¿Qué tan bien construido está y qué tan eficazmente usa Token Factory/AI Cloud y Nemotron?              | Enrutamiento por niveles Lightning/Super/Ultra con métricas de costo y latencia; tool calling; _structured outputs_; Serverless Job; batch inference para evals; verificador numérico determinista; tests y CI verdes.            |
| **Design**                                          | ¿Es una experiencia de producto completa y coherente, no una prueba de concepto?                        | Onboarding de 60 s, Decision Cards, recibos clicables, memoria visible y editable, modo oscuro, bilingüe, marca consistente, Telegram.                                                                                            |
| **Potential Impact**                                | ¿Argumento creíble y específico de un problema real para una audiencia real, resuelto en lo demostrado? | Consumidores colombianos con tarjetas y créditos de consumo que no entienden la tasa efectiva, la usura ni el costo total. Datos oficiales citados (sin inventar cifras). La compra de cartera se demuestra con ahorro calculado. |
| **Quality of the Idea**                             | ¿Uso creativo y no obvio de Token Factory/Nemotron y comprensión del dominio?                           | _Proof-carrying answers_: el LLM nunca es fuente de cifras. Ultra como "segunda opinión" auditora. Tavily como "Market Truth" con provenance. Reglas colombianas (EA/MV, usura, GMF).                                             |

**Desempate:** gana quien tenga mayor puntaje en _Technological Implementation_, luego _Design_, etc.
Por eso la calidad técnica visible (tests, evals, métricas) no es opcional.

## 6. Premios y elegibilidad múltiple

| Premio                     | Monto                       | ¿Alcanzable para FINCH?                                               |
| -------------------------- | --------------------------- | --------------------------------------------------------------------- |
| Grand Prize                | USD 20.000                  | Sí, es el objetivo. Se compite contra todos los tracks.               |
| 2nd / 3rd                  | USD 10.000 / 6.000          | Sí.                                                                   |
| Personal AI Track Winner   | 1 × NVIDIA Jetson Orin Nano | Sí.                                                                   |
| Best Use of Tavily (bonus) | USD 3.000                   | Sí: Tavily es parte central del producto, no decorativa.              |
| Most Valuable Feedback     | 10 × USD 100 + swag         | Sí: bajo esfuerzo, alto retorno.                                      |
| City Winner                | 20 × USD 500                | Solo si asisten a un Builders & Brews de la lista (Colombia no está). |

> **Regla crítica:** "Each Project is eligible for one (1) Overall Award **OR** one (1) Track Award
> **and** one (1) Bonus Award." Lectura práctica: el máximo es **o bien** un premio Overall
> (p. ej. USD 20.000), **o bien** Track (Jetson) + Bonus (USD 3.000). Si la redacción parece ambigua
> (¿Overall + Bonus?), las reglas §11 permiten pedir aclaración por escrito: **enviar la consulta a
> support@devpost.com en la semana 0** (tarea S0-10).

**Impuestos y pagos:** el ganador asume comisiones de giro y cambio. Pueden pedir el formulario
W-8BEN, y el sponsor puede retener una parte según la ley aplicable. En Colombia, los premios suelen
tributar como ganancia ocasional. **Validar con un contador** antes de proyectar el neto (ver 07, D-06).
No se da una cifra neta aquí para no inventar tasas ni retenciones.

## 7. Propiedad intelectual y publicidad

- El envío sigue siendo propiedad de los autores. Nebius recibe una licencia no exclusiva **solo
  para juzgarlo** y puede promocionarlo, con nombre e imagen de los participantes, durante 3 años.
- Usar herramientas de IA (Claude, Cursor) para programar es compatible: el trabajo es de los
  fundadores. AGENTS.md §1 ya prohíbe atribuir autoría a la IA en el historial.
- Código open source de terceros: permitido si se cumplen sus licencias y FINCH **construye encima**.
- **Marca:** la licencia Apache-2.0 **no** concede derechos sobre el nombre ni el logo FINCH
  (Apache-2.0 §6). Se agrega `TRADEMARKS.md` (ADR-0037).

## 8. Trampas que descalifican o restan (y su contramedida)

| Trampa                                      | Contramedida                                                                                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Demo caído o sin créditos durante 01–15-dic | Presupuesto reservado para jurados, _credit guard_ con degradación a explicaciones plantilla, monitor de uptime y alerta a ambos (tarea S3-09). |
| Licencia no visible en _About_              | Archivo `LICENSE` estándar en la raíz; verificar el panel antes del envío.                                                                      |
| Video > 3:00 o privado                      | Cronometrar en 2:50; subir como **Público** (no "No listado"); probar el enlace en incógnito.                                                   |
| Música o marcas de terceros en el video     | Sin logos de bancos; música libre con licencia registrada en `docs/hackathon/media-licenses.md`.                                                |
| Material solo en español                    | Descripción, README e instrucciones en inglés; subtítulos EN. UI bilingüe.                                                                      |
| "Rebrand" percibido (Stage One)             | Tabla explícita track → funcionalidad; demostrar memoria, skills, siempre activo y privacidad.                                                  |
| Secretos en el repo público                 | `pnpm security:check` + gitleaks en CI; rotar cualquier llave expuesta.                                                                         |
| Cambiar el envío después del cierre         | Tag `v0.1.0-hackathon`; `main` queda congelado para jurados (ver 05 §4).                                                                        |
