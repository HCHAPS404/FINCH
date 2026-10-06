import type { ReactElement } from 'react';
import { StatusChip, Button, FreshnessStamp } from '@finch/ui-web';
import { cls } from '../../../_lib/cx';
import styles from '../page.module.css';

interface AnomalyCase {
  readonly title: string;
  readonly evidence: string;
  readonly tone: 'negative' | 'warning' | 'info';
  readonly label: string;
  readonly primaryAction: string;
}

const CASES: readonly AnomalyCase[] = [
  {
    title: 'Cargo duplicado · Seguro celular Claro',
    evidence:
      'Mismo comercio y monto ($12.900) el 24 sep a las 09:14 y 15:32 — menos de 48 horas de diferencia.',
    tone: 'negative',
    label: 'Alta severidad',
    primaryAction: 'Reclamar',
  },
  {
    title: 'Comisión nueva · Retiro cajero Servibanca',
    evidence:
      'Cobraron $8.900 de comisión el 20 sep; en los últimos 6 meses nunca se había cobrado comisión en este cajero.',
    tone: 'warning',
    label: 'Severidad media',
    primaryAction: 'Reclamar',
  },
  {
    title: 'Sobrecosto de cambio · Compra en Amazon.com (USD)',
    evidence:
      'Compra de US$42,00 convertida a $184.800 — 7,2 % por encima de la tasa de referencia del día (market.get_reference_rate).',
    tone: 'warning',
    label: 'Severidad media',
    primaryAction: 'Ver detalle',
  },
  {
    title: 'Gasto fuera de patrón · Restaurante Harry Sasson',
    evidence:
      '$412.000 en una sola compra — 4,1 desviaciones estándar por encima de tu gasto típico en "Salidas" (z-score > 3).',
    tone: 'info',
    label: 'A confirmar',
    primaryAction: 'Confirmar que fui yo',
  },
  {
    title: 'Comercio nunca visto · "DIGITAL*CRYPTOFX"',
    evidence:
      'Primer cargo de este comercio en tu historial: $350.000 el 18 sep, por encima de tu umbral personal de alerta.',
    tone: 'negative',
    label: 'Alta severidad',
    primaryAction: 'Reclamar',
  },
  {
    title: 'Cobro tras cancelación · Revista Semana Premium',
    evidence:
      'Cancelaste esta suscripción el 2 sep (registrado en Mis casos) y aun así se cobró $24.900 el 15 sep.',
    tone: 'negative',
    label: 'Alta severidad',
    primaryAction: 'Reclamar',
  },
];

export function AnomaliasTab(): ReactElement {
  return (
    <div className={cls(styles, 'stack')}>
      <section className={cls(styles, 'card')}>
        <div className={cls(styles, 'cardHeader')}>
          <div>
            <h2 className={cls(styles, 'cardTitle')}>6 casos detectados este mes</h2>
            <p className={cls(styles, 'cardSubtitle')}>
              Reglas deterministas versionadas — cada caso muestra la evidencia exacta.
            </p>
          </div>
          <FreshnessStamp freshness="RECENT" />
        </div>
      </section>

      {CASES.map((item) => (
        <article key={item.title} className={cls(styles, 'anomalyCard')}>
          <div className={cls(styles, 'anomalyHeader')}>
            <p className={cls(styles, 'anomalyTitle')}>{item.title}</p>
            <StatusChip tone={item.tone}>{item.label}</StatusChip>
          </div>
          <p className={cls(styles, 'anomalyEvidence')}>{item.evidence}</p>
          <div className={cls(styles, 'anomalyActions')}>
            <Button size="medium">{item.primaryAction}</Button>
            <Button variant="ghost" size="medium">
              Es normal para mí
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
