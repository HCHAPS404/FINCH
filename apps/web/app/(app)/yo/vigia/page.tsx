import type { ReactElement } from 'react';
import { Button, StatusChip, FreshnessStamp, IconRefresh } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

const RUNS = [
  {
    when: 'Hoy, 6:00 a. m.',
    found: '2 Decision Cards nuevas · briefing enviado',
    cost: '$42 COP',
    tone: 'positive' as const,
    label: 'Completado',
  },
  {
    when: 'Ayer, 6:00 a. m.',
    found: '0 Decision Cards nuevas · sin novedades',
    cost: '$38 COP',
    tone: 'positive' as const,
    label: 'Completado',
  },
  {
    when: 'Domingo, 6:00 a. m.',
    found: '1 Decision Card nueva',
    cost: '$40 COP',
    tone: 'positive' as const,
    label: 'Completado',
  },
];

export default function VigiaPage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Vigía"
        description="El repaso diario que recalcula todo, consulta el mercado y genera tus Decision Cards — corre solo, a las 6 a. m."
      />

      <div className={cls(styles, 'stack')}>
        <section className={cls(styles, 'card')}>
          <div className={cls(styles, 'cardHeader')}>
            <div>
              <h2 className={cls(styles, 'cardTitle')}>Próxima corrida</h2>
              <p className={cls(styles, 'cardSubtitle')}>Mañana, 6:00 a. m. hora Bogotá</p>
            </div>
            <Button variant="secondary">
              <IconRefresh size={16} />
              Ejecutar ahora
            </Button>
          </div>
        </section>

        <section className={cls(styles, 'card')}>
          <div className={cls(styles, 'cardHeader')}>
            <h2 className={cls(styles, 'cardTitle')}>Historial</h2>
            <FreshnessStamp freshness="FRESH" />
          </div>
          {RUNS.map((run) => (
            <div key={run.when} className={cls(styles, 'row')}>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>{run.when}</p>
                <p className={cls(styles, 'rowMeta')}>
                  {run.found} · costo {run.cost}
                </p>
              </div>
              <StatusChip tone={run.tone}>{run.label}</StatusChip>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
