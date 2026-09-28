# Fórmulas de finanzas personales (contrato del motor para la hackathon)

> Complementa [colombia-credit.md](colombia-credit.md). Mismas reglas: montos en `bigint` de
> unidades menores, tasas en decimal de precisión arbitraria, redondeo explícito, cada fórmula en el
> Formula Registry con versión y golden vectors verificados de forma independiente (S1-05).
> Todo lo que depende de un país (impuestos, festivos, convenciones) llega como parámetro desde
> `jurisdictions/<país>/`.

---

## 1. Asignación del ingreso — `budget.allocate@1` (Payday Autopilot, B1)

Entrada: `ingreso` (Money), `fecha_ingreso`, `proximo_ingreso`, obligaciones con vencimiento, deudas
con mínimos, colchón objetivo y actual, metas con prioridad/fecha/aporte sugerido, regla del usuario
(`PAY_YOURSELF_FIRST(p)`, `RULE_50_30_20`, `CUSTOM`).

Algoritmo determinista por capas (cada capa consume de `restante`):

```text
1. obligaciones con vencimiento ≤ proximo_ingreso              (orden por fecha)
2. mínimos de deudas con vencimiento ≤ proximo_ingreso         (orden por fecha)
3. "págate primero": p · ingreso a ahorro, si la regla lo pide
4. colchón hasta objetivo, con tope por ciclo (parámetro)
5. metas por prioridad; dentro de igual prioridad, por fecha
6. excedente → estrategia elegida: abono extra a deuda (avalanche) o ahorro/inversión
7. libre = restante
```

- Si `restante < 0` en la capa 1–2: **déficit** → no se asigna nada a capas 3+, se marca el faltante
  y se genera Decision Card (C3 lógico).
- **Invariante:** `Σ asignaciones + libre = ingreso` exacto (test de conservación).
- Salida: lista `(destino, monto, fecha_objetivo, razón, capa)` + checklist de ejecución.

## 2. Estado de sobres — `budget.envelope_state@1` (B2)

`disponible_sobre = asignado − Σ gastos(sobre, ciclo) ± movimientos_entre_sobres`.
Alertas en 80 % y 100 %. Mover entre sobres conserva el total del ciclo.

## 3. Salud financiera — `health.score@1` (B7)

Puntaje 0–100 = Σ `peso_i · subpuntaje_i`, con subpuntajes 0–100 por tramos publicados:

| Componente                 | Métrica                                      | Peso inicial |
| -------------------------- | -------------------------------------------- | ------------ |
| Carga de deuda             | cuotas mensuales / ingreso neto              | 25           |
| Colchón                    | meses de gastos esenciales cubiertos         | 20           |
| Tasa de ahorro             | ahorro del mes / ingreso                     | 20           |
| Uso de cupo                | saldo tarjetas / cupo total                  | 15           |
| Puntualidad                | pagos a tiempo / pagos del periodo           | 10           |
| Diversificación de ingreso | 1 − índice de concentración (HHI) de fuentes | 10           |

Pesos y tramos son parámetros versionados; cambiar cualquiera crea `health.score@2`. Cada
componente muestra "qué haría subir el puntaje". **No es un score crediticio.**

## 4. Patrimonio neto — `networth.compute@1` (B8)

`patrimonio = Σ activos(moneda base) − Σ pasivos(moneda base)`, conversión con `fx.convert@1` a la
fecha del snapshot. Vehículos: depreciación lineal o por tabla configurable (`ESTIMATED`).

## 5. ¿Me lo puedo permitir? — `purchase.afford@1` (C1)

Para una compra `precio` en fecha `t`, con opciones `contado` o `n cuotas a tasa i`:

1. Recalcular forecast (`cashflow.forecast_30d`, extendido al horizonte del plan) con el nuevo flujo.
2. Veredicto determinista:
   - `SI` si el saldo proyectado nunca cae bajo el colchón y ningún sobre esencial queda negativo;
   - `SI_CON_AJUSTE` si cae bajo el colchón pero se recupera antes del próximo ingreso, indicando qué
     sobre ajustar;
   - `ESPERAR` si hay déficit → fecha más temprana `t*` en que sería `SI`;
   - `NO_RECOMENDADO` si compromete obligaciones.
3. Costo de financiar: `intereses = Σ cuotas − precio` (amortización francesa) y costo de oportunidad
   del contado a la tasa de ahorro del usuario.

## 6. Escenarios "¿Y si…?" — `scenario.project@1` (C2)

Proyección mensual a `H` meses sobre **copia** del snapshot con cambios parametrizados (Δ ingreso,
nueva deuda, nuevo gasto recurrente, evento único). Salidas por mes: saldo, deuda total, patrimonio,
progreso de metas. Hasta 3 escenarios comparables. Nunca muta el estado canónico.

## 7. Modo tormenta — `stress.runway@1` (C3)

`runway_meses = liquidez_disponible / gastos_esenciales_mensuales` con recortes opcionales:
gastos por tiers (esencial / reducible / eliminable). Salida: runway sin recortes, con recortes, y
orden de prioridad de pagos (obligaciones legales y vivienda → mínimos de deuda → resto).

## 8. Metas — `goals.plan@1` (C4)

Para cada meta `g`: `aporte_requerido_g = (objetivo_g − ahorrado_g) / meses_restantes_g` (o con
rendimiento esperado: fórmula de anualidad a tasa `r`). Si `Σ aportes > capacidad_de_ahorro`,
asignación por prioridad y se recalculan fechas alcanzables → trade-offs explícitos
(`meta X se atrasa k meses`).

## 9. Rentabilidad neta de depósitos — `deposit.net_return@1` (D1)

```text
rendimiento_bruto = capital · ((1 + EA)^(plazo_días/365) − 1)        # base de días: parámetro por país/producto
retención         = rendimiento_bruto · tasa_retención(país, producto) # VERIFICAR tasa vigente (CO)
rendimiento_neto  = rendimiento_bruto − retención − costos
EA_neta           = (1 + rendimiento_neto/capital)^(365/plazo_días) − 1
EA_real_neta      = (1 + EA_neta)/(1 + inflación_esperada) − 1          # inflación: fuente oficial, fecha
```

## 10. Tipo de cambio — `fx.convert@1` (G3)

`monto_destino = round(monto_origen · tasa(origen→destino, fecha))` con tasa de referencia citada
(fuente, fecha, hora). Sobrecosto de una conversión real: `markup = tasa_referencia/tasa_aplicada − 1`.

## 11. Costo de remesa — `fx.remittance_cost@1` (D5)

`costo_total = comisión + monto_enviado · (tasa_referencia − tasa_ofrecida)/tasa_referencia`
expresado en moneda de origen y como % del envío; `recibe = (monto_enviado − comisión) · tasa_ofrecida`.

## 12. Detección de recurrentes — `recurring.detect@1` (D2)

Agrupar transacciones por comercio normalizado; recurrente si ≥ 3 ocurrencias con intervalo medio en
{7, 14, 30, 90, 365} ± tolerancia (parámetro) y coeficiente de variación del monto ≤ umbral. Subida
de precio: último monto > mediana previa · (1 + umbral).

## 13. Liquidación de gastos compartidos — `split.settle@1` (F1)

Balance por miembro = pagado − debido (según regla: partes iguales, proporcional al ingreso
declarado, montos fijos). Liquidación: emparejamiento greedy deudor-mayor ↔ acreedor-mayor hasta
saldar; produce ≤ `n − 1` transferencias. Invariante: `Σ balances = 0`.

## 14. Brechas de protección — `protection.gaps@1` (F2)

Reglas publicadas y versionadas, p. ej.: colchón < 3 meses de gastos esenciales → brecha alta;
dependientes > 0 sin cobertura de vida declarada → brecha; mismo tipo de seguro cobrado en ≥ 2
productos → posible duplicidad. Solo educativo.

## 15. Proyección de inversión educativa — `invest.project@1` (C5)

Valor futuro de aportes periódicos `A` a tasa mensual `r` durante `n` meses:
`VF = A · ((1 + r)^n − 1)/r` (+ capital inicial `C·(1+r)^n`), para 3 escenarios de `r`
(conservador/base/optimista, parámetros con fuente o supuesto explícito), neto de impuestos e
inflación con los mismos parámetros de §9.

## Vectores mínimos

Cada fórmula de este documento entra con ≥ 4 golden vectors que incluyan: caso nominal, borde (cero,
un solo elemento), conservación (donde aplique) y error explicativo.
