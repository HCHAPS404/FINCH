# FINCH × Nebius × NVIDIA Global AI Hackathon — Programa de hackathon

> **Estado:** APROBADO por HELL. Proyecto de un solo fundador desde 2026-10-07 (ver 05 §0).
> **Fecha:** 2026-09-28
> **Deadline de envío:** viernes 30 de octubre de 2026, 10:00 PT = **12:00 hora Colombia** (17:00 UTC).
> **Días de construcción disponibles:** 32 (de lunes 28-sep a jueves 29-oct; el 30-oct es solo colchón).

Este directorio convierte FINCH, que hoy es un **scaffold con arquitectura aprobada**, en un
**envío ganador** para la hackathon, sin traicionar la Constitución (README §4). Al mismo tiempo
deja a FINCH mejor posicionada como empresa. La hackathon no es un desvío: es el primer
_vertical slice_ real del producto, con un deadline externo y validación de jurados.

## Lectura en orden

| #   | Documento                                                                    | Para qué sirve                                                                           |
| --- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 00  | [Reglas y cumplimiento](00-rules-and-compliance.md)                          | Reglas oficiales, lista de verificación de cada requisito y trampas descalificatorias.   |
| 01  | [Estrategia, track y premios](01-strategy-and-track.md)                      | Qué track elegir y por qué; cómo se puntúa; qué premios son alcanzables.                 |
| 02  | [Especificación de producto](02-product-spec.md)                             | Qué es "FINCH: tu CFO personal": funcionalidades MoSCoW, flujos y personas.              |
| 03  | [Arquitectura y stack Nebius/NVIDIA](03-architecture-and-nebius-stack.md)    | Topología, componentes, uso de cada herramienta Nebius/NVIDIA/Tavily/LangSmith/Toloka.   |
| 04  | [Diseño de IA, seguridad y evaluación](04-ai-design-safety-evals.md)         | Enrutamiento Nemotron por niveles, agente, _proof-carrying answers_, guardrails y evals. |
| 05  | [Roadmap y cronograma](05-roadmap-and-timeline.md)                           | Plan día a día hasta el envío, periodo de jurados y roadmap de empresa 2027.             |
| 06  | [Kit de envío](06-submission-kit.md)                                         | Texto de Devpost (inglés), guion del video de 3 min, README para jurados, feedback.      |
| 07  | [Riesgos y decisiones abiertas](07-risks-and-decisions.md)                   | Riesgos con mitigación, y las decisiones que **solo los fundadores** pueden tomar.       |
| 08  | [Catálogo de funciones](08-feature-catalog.md)                               | **Fuente única de alcance:** 45 funciones H y la perspectiva P.                          |
| —   | [Fórmulas Colombia (crédito)](../financial-formulas/colombia-credit.md)      | Matemática de tasas, amortización, costo total y usura: contrato del motor.              |
| —   | [Fórmulas de finanzas personales](../financial-formulas/personal-finance.md) | Payday, sobres, salud, patrimonio, decisiones, CDT neto, FX, remesas, hogar compartido.  |

ADRs nuevos (en `docs/architecture/adr/`):

- [ADR-0035](../architecture/adr/0035-hackathon-program-and-scope.md): programa de hackathon, alcance y precedencia sobre el programa de 24 semanas.
- [ADR-0036](../architecture/adr/0036-ai-runtime-nebius-token-factory-nemotron.md): runtime de IA en Nebius Token Factory con NVIDIA Nemotron por niveles, detrás del AI Gateway.
- [ADR-0037](../architecture/adr/0037-open-source-license.md): licencia open source (requisito de la hackathon) y estrategia _open core_.
- [ADR-0038](../architecture/adr/0038-hackathon-demo-deployment-topology.md): topología de despliegue del demo (excepción acotada a ADR-0012).
- [ADR-0039](../architecture/adr/0039-channel-hub.md): app autónoma; correo, SMS, WhatsApp y Telegram como canales opcionales.
- [ADR-0040](../architecture/adr/0040-engineering-method-and-branching.md): método XP + Agile + CRISP-ML(Q) y ramas por etapa.

Arquitectura de software: [SOFTWARE-ARCHITECTURE.md](../architecture/SOFTWARE-ARCHITECTURE.md) ·
Acuerdo de trabajo de los fundadores: [README-DEVELOPERS.md](../../README-DEVELOPERS.md).

## La tesis en una frase

> **FINCH es un CFO personal premium, privado y siempre activo: planifica tu sueldo, controla tus
> tarjetas, te frena antes de una mala compra y encuentra dinero que pierdes. Nemotron razona y
> explica, pero ninguna cifra la inventa un modelo: cada número viene con su recibo.**

Esto encaja con el **Personal AI Track** (asistente privado, siempre activo, con memoria, _skills_
reutilizables y herramientas elegidas por el usuario). Además es una respuesta directa a lo que
los jurados puntúan: **Technological Implementation, Design, Potential Impact y Quality of the Idea**,
con el mismo peso cada uno.

## Resumen del plan

```text
Sem 0 (28-sep → 04-oct)  Fundación: licencia, créditos, ADRs, walking skeleton en producción con Nemotron
Sem 1 (05-oct → 11-oct)  Motor + agente con recibos + "Me llegó el sueldo" (Payday, sobres, tarjetas, calendario)
Sem 2 (12-oct → 18-oct)  Tavily + Opportunity Engine + recibos por foto + simuladores + Ultra + memoria
Sem 3 (19-oct → 25-oct)  Bóveda, buscador, hogar compartido, protección, Vigía + push, correo, D3–D5, F3–F5, G4, evals
Sem 4 (26-oct → 30-oct)  Code freeze 27-oct · video 27–28 · envío 29-oct · 30-oct colchón
01-dic → 15-dic          Jurados: el demo DEBE seguir vivo y con crédito
~11-ene-2027             Anuncio de ganadores
```

## Equipo

| Persona                         | Rol en la hackathon                                                                                                                                                                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HELL** (Helmut, `@HCHAPS404`) | Representante ante Devpost (categoría Solo, ver 00 §2). Único fundador: backend, motor financiero, AI Gateway, agente, infraestructura Nebius, producto/UX, frontend, sistema de diseño, evals, video y narrativa del envío — todo el catálogo. |
| Claude / Cursor                 | Herramientas (AGENTS.md §1). No son autores. Claude: arquitectura, specs, revisión profunda. Cursor: implementación multiarchivo de alto volumen, para no agotar presupuesto de Claude (05 §0).                                                 |

> **Actualizado 2026-10-07:** FINCH dejó de ser un proyecto de dos fundadores (HELL + Nairy). El
> reparto de bloques que describía esta tabla antes es ahora enteramente responsabilidad de HELL,
> con Claude y Cursor como las dos herramientas que absorben la carga que antes cubría una segunda
> persona.
