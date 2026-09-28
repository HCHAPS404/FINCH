# FINCH × Nebius × NVIDIA Global AI Hackathon — Programa de hackathon

> **Estado:** PROPUESTO — requiere aprobación de ambos fundadores (HELL y Nairy).
> **Fecha:** 2026-09-28
> **Deadline de envío:** viernes 30 de octubre de 2026, 10:00 PT = **12:00 hora Colombia** (17:00 UTC).
> **Días de construcción disponibles:** 32 (de lunes 28-sep a jueves 29-oct; el 30-oct es solo colchón).

Este directorio convierte FINCH, que hoy es un **scaffold con arquitectura aprobada**, en un
**envío ganador** para la hackathon, sin traicionar la Constitución (README §4). Al mismo tiempo
deja a FINCH mejor posicionada como empresa. La hackathon no es un desvío: es el primer
*vertical slice* real del producto, con un deadline externo y validación de jurados.

## Lectura en orden

| # | Documento | Para qué sirve |
|---|---|---|
| 00 | [Reglas y cumplimiento](00-rules-and-compliance.md) | Reglas oficiales, lista de verificación de cada requisito y trampas descalificatorias. |
| 01 | [Estrategia, track y premios](01-strategy-and-track.md) | Qué track elegir y por qué; cómo se puntúa; qué premios son alcanzables. |
| 02 | [Especificación de producto](02-product-spec.md) | Qué es "FINCH: tu CFO personal": funcionalidades MoSCoW, flujos y personas. |
| 03 | [Arquitectura y stack Nebius/NVIDIA](03-architecture-and-nebius-stack.md) | Topología, componentes, uso de cada herramienta Nebius/NVIDIA/Tavily/LangSmith/Toloka. |
| 04 | [Diseño de IA, seguridad y evaluación](04-ai-design-safety-evals.md) | Enrutamiento Nemotron por niveles, agente, *proof-carrying answers*, guardrails y evals. |
| 05 | [Roadmap y cronograma](05-roadmap-and-timeline.md) | Plan día a día hasta el envío, periodo de jurados y roadmap de empresa 2027. |
| 06 | [Kit de envío](06-submission-kit.md) | Texto de Devpost (inglés), guion del video de 3 min, README para jurados, feedback. |
| 07 | [Riesgos y decisiones abiertas](07-risks-and-decisions.md) | Riesgos con mitigación, y las decisiones que **solo los fundadores** pueden tomar. |
| — | [Fórmulas Colombia (crédito)](../financial-formulas/colombia-credit.md) | Matemática de tasas, amortización, costo total y usura: contrato del motor. |

ADRs nuevos (en `docs/architecture/adr/`):

- [ADR-0035](../architecture/adr/0035-hackathon-program-and-scope.md): programa de hackathon, alcance y precedencia sobre el programa de 24 semanas.
- [ADR-0036](../architecture/adr/0036-ai-runtime-nebius-token-factory-nemotron.md): runtime de IA en Nebius Token Factory con NVIDIA Nemotron por niveles, detrás del AI Gateway.
- [ADR-0037](../architecture/adr/0037-open-source-license.md): licencia open source (requisito de la hackathon) y estrategia *open core*.
- [ADR-0038](../architecture/adr/0038-hackathon-demo-deployment-topology.md): topología de despliegue del demo (excepción acotada a ADR-0012).

## La tesis en una frase

> **FINCH es un CFO personal privado y siempre activo para Colombia. Los modelos NVIDIA Nemotron
> razonan y explican, pero ninguna cifra la inventa un modelo: cada número viene con su recibo.**

Esto encaja con el **Personal AI Track** (asistente privado, siempre activo, con memoria, *skills*
reutilizables y herramientas elegidas por el usuario). Además es una respuesta directa a lo que
los jurados puntúan: **Technological Implementation, Design, Potential Impact y Quality of the Idea**,
con el mismo peso cada uno.

## Resumen del plan

```text
Sem 0 (28-sep → 04-oct)  Fundación: licencia, créditos, ADRs, walking skeleton en producción con Nemotron
Sem 1 (05-oct → 11-oct)  Motor financiero CO + AI Gateway + agente con tools + recibos
Sem 2 (12-oct → 18-oct)  Tavily "Market Truth" + Decision Cards + documentos + memoria
Sem 3 (19-oct → 25-oct)  Vigía siempre activo (Serverless Jobs) + Telegram + evals + seguridad + pulido
Sem 4 (26-oct → 30-oct)  Code freeze 27-oct · video 27–28 · envío 29-oct · 30-oct colchón
01-dic → 15-dic          Jurados: el demo DEBE seguir vivo y con crédito
~11-ene-2027             Anuncio de ganadores
```

## Equipo

| Persona | Rol en la hackathon |
|---|---|
| **HELL** (Helmut, `@HCHAPS404`) | Representante del equipo ante Devpost. Líder de backend, motor financiero, AI Gateway, agente, infraestructura Nebius. |
| **Nairy** (cofundadora) | Líder de producto/UX, frontend web, sistema de diseño con la marca, canal Telegram, evals humanas (Toloka), video y narrativa del envío. |
| Claude / Cursor | Herramientas (AGENTS.md §1). No son autores. Claude: arquitectura, specs, revisión. Cursor: implementación multiarchivo. |

La división es una **propuesta**. Si las fortalezas de Nairy son otras, se intercambian los
bloques completos del cronograma (05) sin romper las dependencias.
