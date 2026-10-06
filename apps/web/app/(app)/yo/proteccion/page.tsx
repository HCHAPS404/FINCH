import type { ReactElement } from 'react';
import { Banner, StatusChip } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

const CHECKS = [
  {
    name: 'Fondo de emergencia',
    value: '2,1 meses de gastos esenciales',
    tone: 'warning' as const,
    label: 'Por debajo de 6 meses',
  },
  {
    name: 'Dependientes económicos',
    value: 'Ninguno declarado',
    tone: 'positive' as const,
    label: 'Sin brecha',
  },
  {
    name: 'Seguro de vida deudor',
    value: 'Pagado en Visa Oro y en el crédito libre inversión',
    tone: 'negative' as const,
    label: 'Posible duplicidad',
  },
  {
    name: 'Seguro de hogar',
    value: 'No contratado',
    tone: 'warning' as const,
    label: 'Riesgo sin cubrir',
  },
];

export default function ProteccionPage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Radar de protección"
        description="Fondo de emergencia, dependientes y coberturas ya pagadas. Mapa educativo, no vende seguros."
      />

      <div className={cls(styles, 'stack')}>
        <Banner tone="negative" title="Seguro de vida deudor duplicado">
          Estás pagando esta cobertura dentro de tu crédito libre inversión y también dentro de la
          Visa Oro. Revisa si necesitas las dos.
        </Banner>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 12 }}>
            Mapa de protección
          </h2>
          {CHECKS.map((check) => (
            <div key={check.name} className={cls(styles, 'row')}>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>{check.name}</p>
                <p className={cls(styles, 'rowMeta')}>{check.value}</p>
              </div>
              <StatusChip tone={check.tone}>{check.label}</StatusChip>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
