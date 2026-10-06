import type { ReactElement } from 'react';
import { Banner, Button, StatusChip, IconArrowRight } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

const MEMBERS = [
  { name: 'Laura Gómez (tú)', rule: 'Proporcional al ingreso · 58 %', paid: '$1.740.000' },
  { name: 'Andrés Rojas', rule: 'Proporcional al ingreso · 42 %', paid: '$1.080.000' },
];

const SHARED_GOALS = [
  {
    name: 'Sobre: Mercado del hogar',
    meta: '$1.200.000 de $1.200.000 este mes',
    tone: 'positive' as const,
    label: 'Al día',
  },
  {
    name: 'Meta: Viaje de aniversario',
    meta: 'Van al 38 % · $760.000 de $2.000.000',
    tone: 'info' as const,
    label: 'En curso',
  },
];

export default function HogarPage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Hogar compartido"
        description="Gastos con reglas de división, sobres y metas comunes. Cada persona decide qué comparte."
      />

      <div className={cls(styles, 'stack')}>
        <Banner tone="info" title="Liquidación de septiembre">
          Andrés le debe $328.400 a Laura para quedar al día. Mínimo de transferencias calculado: 1
          sola transacción.
        </Banner>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 12 }}>
            Miembros del hogar
          </h2>
          {MEMBERS.map((member) => (
            <div key={member.name} className={cls(styles, 'row')}>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>{member.name}</p>
                <p className={cls(styles, 'rowMeta')}>{member.rule}</p>
              </div>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  color: 'var(--fc-text-primary)',
                }}
              >
                {member.paid}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Button variant="secondary">
              Liquidar ahora
              <IconArrowRight size={16} />
            </Button>
          </div>
        </section>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 12 }}>
            Sobres y metas comunes
          </h2>
          {SHARED_GOALS.map((item) => (
            <div key={item.name} className={cls(styles, 'row')}>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>{item.name}</p>
                <p className={cls(styles, 'rowMeta')}>{item.meta}</p>
              </div>
              <StatusChip tone={item.tone}>{item.label}</StatusChip>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
