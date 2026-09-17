# jurisdictions/CO — Colombia

Country-specific rules, kept **out** of the global core (README §36).

```
locale:    es-CO
timezone:  America/Bogota
currency:  COP
```

```
calendar/           business days and Colombian public holidays
rate-conventions/   how rates are quoted, converted and compared locally
legal-copy/         jurisdiction-specific disclosures and required wording
product-taxonomy/   local financial product classification
capabilities/       which regulatory capability classes are enabled here (§37)
```

## Why this exists as a directory rather than as conditionals

Colombia is the initial market, not the only one. Hardcoding Colombian holiday rules or
rate conventions into the core would mean rewriting the engine to add a second country.
Keeping them here lets future jurisdiction adapters coexist.

Note that `COP` carries an ISO 4217 minor-unit exponent of 2 even though local practice
quotes whole pesos. `@finch/financial-engine` stores the ISO minor unit and handles
presentation separately — matching storage precision to a display convention would be
an irreversible loss of information.

> **Status: structure only.** Populated alongside the financial engine's calendar and
> rate work (FIN-031 onward).
