# Fórmulas de crédito — Colombia (contrato del motor para la hackathon)

> **Estado:** especificación propuesta. Cada fórmula entra al Formula Registry
> (`packages/financial-engine/src/formula-registry.ts`) con `formulaId`, `version`, supuestos,
> referencias y **golden vectors verificados de forma independiente** (tarea S1-05) antes de
> informar cualquier recomendación (README §15).
>
> **Precisión:** los montos se guardan como `bigint` en unidades menores (ADR-0016). Las tasas y
> los valores intermedios usan un decimal de precisión arbitraria (≥ 34 dígitos significativos).
> Las potencias fraccionarias (`^(1/12)`) requieren `ln`/`exp` decimales: la librería se decide en S0-13.
>
> **Redondeo:** nunca implícito. Por defecto, el interés de cada periodo se redondea a unidades
> menores con `HALF_EVEN` y la última cuota absorbe el residuo. Las tasas se muestran con 2
> decimales en porcentaje.
>
> Las reglas **específicas de Colombia** (convenciones de cotización, usura, GMF) viven en
> `jurisdictions/CO/rate-conventions/` y se inyectan como parámetros. El core no las conoce (README §36).

---

## 1. Conversión de tasas — `rate.convert@1`

Notación: `EA` = efectiva anual; `i_m` = efectiva mensual vencida (MV); `NAMV` = nominal anual
mes vencido; `i_a` = tasa anticipada del periodo.

| Conversión                           | Fórmula                                                             |
| ------------------------------------ | ------------------------------------------------------------------- |
| Periódica vencida → EA               | `EA = (1 + i_p)^m − 1`, con `m` periodos por año (12 si es mensual) |
| EA → periódica vencida               | `i_p = (1 + EA)^(1/m) − 1`                                          |
| Nominal → periódica                  | `i_p = N / m`                                                       |
| Periódica → nominal                  | `N = i_p · m`                                                       |
| Anticipada → vencida (mismo periodo) | `i_v = i_a / (1 − i_a)`                                             |
| Vencida → anticipada                 | `i_a = i_v / (1 + i_v)`                                             |

Casos borde: `i_a ≥ 1` → error; tasas negativas → se permiten solo con una bandera explícita;
`m ∈ {1, 2, 4, 6, 12, 360, 365}`.

**Ejemplos ilustrativos** (calculados con decimal de 40 dígitos; **no** son golden vectors hasta
la verificación independiente):

| Entrada                          | Salida                          |
| -------------------------------- | ------------------------------- |
| 2,3 % MV → EA                    | 31,3734498399602… % EA          |
| 24 % EA → MV                     | 1,8087582483510674… % MV        |
| 24 % NAMV → MV                   | 2 % MV → 26,8241794562545… % EA |
| 2 % mensual anticipada → vencida | 2,0408163265306122… % MV        |

## 2. Cuota fija (sistema francés) — `amortization.french@1`

`C = P · i / (1 − (1 + i)^(−n))`; si `i = 0`, `C = P / n`.

Tabla: `interés_k = round(saldo_{k−1} · i)`, `capital_k = C_r − interés_k`,
`saldo_k = saldo_{k−1} − capital_k`. `C_r` es la cuota redondeada a unidades menores y la última
cuota ajusta el residuo para que `saldo_n = 0`.

Ejemplo ilustrativo: `P` = COP 10.000.000, `i` = 1,6 % MV, `n` = 36 → `C` ≈ COP 367.572,18.

## 3. Costo total y tasa efectiva real — `credit.total_cost@1`

Flujos mensuales desde la perspectiva del deudor:

```text
t=0 : + (P − costos_iniciales)                 # desembolso neto (estudio de crédito, comisiones)
t=k : − (C_k + seguro_k + cuota_manejo_k + otros_k + gmf_k)   k = 1..n
```

- `seguro_k` según `insurance_basis`: `OUTSTANDING` (tasa × saldo), `ORIGINAL` (tasa × P) o `FIXED`.
- `gmf_k`: parámetro de jurisdicción (4 × 1.000 sobre débitos gravados). **VERIFICAR** exenciones y
  aplicabilidad caso a caso (Estatuto Tributario, régimen del GMF). Por defecto es `0` y se muestra
  como supuesto editable.
- **TIR mensual** `r` que hace `VPN = 0`: se resuelve con bisección en decimal (tolerancia
  `1e−12`, máximo 200 iteraciones; la bisección garantiza convergencia si hay cambio de signo).
  Salida: `tasa_efectiva_real_EA = (1 + r)^12 − 1`, total pagado, total de intereses, total de
  seguros y total de cargos.

## 4. Verificación de usura — `credit.usury_check@1`

- Parámetro: `tasa_usura_EA` por modalidad (consumo y ordinario, microcrédito, etc.), certificada
  por la Superintendencia Financiera. En Colombia, la usura es 1,5 veces el interés bancario
  corriente certificado (Código de Comercio, art. 884). **VERIFICAR** la periodicidad vigente de la
  certificación por modalidad.
- La tasa de usura entra como `input` con procedencia (`PUBLIC_REFERENCE`/`PROVIDER`: URL de la SFC
  vía Tavily, fecha de vigencia) y frescura.
- Compara la **tasa de interés remuneratoria pactada, en EA**, contra la usura. Salidas: `status ∈
{BELOW, AT_OR_ABOVE}` y `margin_pp`.
- **Supuesto explícito:** qué cargos cuentan para efectos de usura es materia jurídica. El motor
  informa por separado la tasa pactada vs usura y el costo total (§3). Nunca afirma que un cobro es
  ilegal: dice "la tasa pactada supera la tasa de usura certificada vigente", con fuente. Validar
  el texto con un abogado (D-07).

## 5. Comparación de compra de cartera — `credit.compare_refinance@1`

Entradas: deuda actual (saldo, tasa, cuotas restantes y cargos) y oferta (tasa, plazo, seguros,
costos de cambio).

- `total_actual = Σ pagos restantes` (con cargos) y `total_oferta = Σ pagos` + costos de cambio.
- `ahorro_nominal = total_actual − total_oferta`.
- `ahorro_VP` descontado a la tasa de oportunidad del usuario (parámetro; por defecto su tasa de
  ahorro, marcada `USER_ASSERTED` o `ESTIMATED`).
- `mes_equilibrio` = primer `k` en que el ahorro acumulado ≥ costos de cambio.
- `delta_cuota` = cuota nueva − cuota actual. La alerta de plazo mayor aplica si baja la cuota pero
  sube el total pagado.

Salida con clase de verdad `DERIVED_DETERMINISTIC`, **salvo** que alguna entrada sea `ESTIMATED`,
en cuyo caso la salida hereda `ESTIMATED` (propagación conservadora).

## 6. Plan de pago de deudas — `debt.payoff_plan@1`

Estrategias: `AVALANCHE` (mayor EA primero) y `SNOWBALL` (menor saldo primero). Simulación mensual
con pagos mínimos más un excedente `extra`. Salidas: meses hasta quedar libre de deuda, intereses
totales y orden de pago. Se incluyen ambas estrategias para que el usuario compare; FINCH no oculta
la alternativa.

## 7. Flujo de caja a 30 días — `cashflow.forecast_30d@1`

`saldo_d = saldo_{d−1} + ingresos_d − obligaciones_d`, con `d = hoy..hoy+30`.

- Ingresos fijos: fecha y monto conocidos (`USER_ASSERTED`/`OBSERVED`).
- Ingresos variables: **estimación conservadora** (percentil 25 de los últimos 3–6 meses
  disponibles) → toda la serie queda `ESTIMATED`.
- Festivos y días hábiles de Colombia (`jurisdictions/CO/calendar`) para mover fechas de pago.
- Salidas: serie diaria, `primer_deficit {día, monto}` (saldo < `colchón`) y mínimo proyectado.

## 8. Disponible para gastar hoy — `cashflow.safe_to_spend@1`

`STS = max(0, min_{d ∈ [hoy, próximo_ingreso]} saldo_proyectado_d − colchón)`

Conservador por diseño: no se puede gastar hoy lo que hará falta antes del próximo ingreso.
`colchón` es una preferencia del usuario (memoria `CONSTRAINT`).

## 9. Vectores golden requeridos (mínimo por fórmula)

| Fórmula                    | Casos mínimos                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `rate.convert`             | 12: cada dirección, `m` ∈ {12, 4, 1}, anticipada, tasa 0, tasa alta (> 100 % EA), error `i_a ≥ 1` |
| `amortization.french`      | 6: `i = 0`, `n = 1`, `n = 360`, montos pequeños (redondeo), residuo de la última cuota            |
| `credit.total_cost`        | 6: sin cargos (TIR = tasa), seguro sobre saldo y sobre original, costos iniciales, GMF            |
| `credit.usury_check`       | 4: debajo, igual, encima y fuente _STALE_                                                         |
| `credit.compare_refinance` | 6: ahorro, pérdida por plazo mayor, equilibrio en el mes 1 y nunca, entrada `ESTIMATED`           |
| `debt.payoff_plan`         | 4: ambas estrategias, `extra = 0`, deuda imposible (pago < interés) → error explicativo           |
| `cashflow.forecast_30d`    | 4: sin déficit, déficit, festivo, ingreso variable                                                |
| `cashflow.safe_to_spend`   | 3: positivo, cero y sin próximo ingreso conocido                                                  |
