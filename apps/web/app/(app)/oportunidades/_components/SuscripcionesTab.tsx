import type { ReactElement } from 'react';
import {
  Banner,
  StatusChip,
  Button,
  IconFile,
  IconTrendUp,
  IconRefresh,
  IconAlert,
} from '@finch/ui-web';
import { cls } from '../../../_lib/cx';
import styles from '../page.module.css';

const SUBSCRIPTIONS = [
  {
    name: 'STREAMPLUS',
    meta: 'Mensual · tarjeta terminada en 4821',
    amount: '$49.900/mes',
    flag: { tone: 'warning' as const, icon: IconTrendUp, label: 'Subió 22 %' },
  },
  {
    name: 'Gimnasio BodyTech',
    meta: 'Mensual · débito automático',
    amount: '$139.900/mes',
    flag: undefined,
  },
  {
    name: 'Cuota de manejo Visa Oro',
    meta: 'Mensual · Banco de Bogotá',
    amount: '$28.500/mes',
    flag: { tone: 'warning' as const, icon: IconTrendUp, label: 'Subió desde $19.900' },
  },
  {
    name: 'Nube Foto Plus',
    meta: 'Mensual · prueba gratis terminó el 12 sep',
    amount: '$9.900/mes',
    flag: { tone: 'info' as const, icon: IconAlert, label: 'Empezó a cobrar' },
  },
  {
    name: 'App Meditación Calma',
    meta: 'Anual · renovación automática',
    amount: '$89.900/año',
    flag: undefined,
  },
  {
    name: 'Seguro celular Claro',
    meta: 'Mensual · cargo duplicado detectado en sep',
    amount: '$12.900/mes ×2',
    flag: { tone: 'negative' as const, icon: IconAlert, label: 'Cobro duplicado' },
  },
];

export function SuscripcionesTab(): ReactElement {
  return (
    <div className={cls(styles, 'stack')}>
      <Banner tone="info" title="6 suscripciones detectadas · $349.500 por mes">
        Eso son $4.194.000 al año. Dos subieron de precio sin avisarte y una tiene un cargo
        duplicado este mes.
      </Banner>

      <section className={cls(styles, 'card')}>
        <div className={cls(styles, 'cardHeader')}>
          <div>
            <h2 className={cls(styles, 'cardTitle')}>Tus recurrentes</h2>
            <p className={cls(styles, 'cardSubtitle')}>
              Detectadas en tus movimientos de los últimos 3 meses.
            </p>
          </div>
          <Button variant="secondary">
            <IconFile size={16} />
            Exportar lista
          </Button>
        </div>
        {SUBSCRIPTIONS.map((item) => (
          <div key={item.name} className={cls(styles, 'subRow')}>
            <span className={cls(styles, 'subIcon')}>
              <IconRefresh size={18} />
            </span>
            <div className={cls(styles, 'subBody')}>
              <p className={cls(styles, 'subName')}>{item.name}</p>
              <p className={cls(styles, 'subMeta')}>{item.meta}</p>
            </div>
            {item.flag ? <StatusChip tone={item.flag.tone}>{item.flag.label}</StatusChip> : null}
            <span className={cls(styles, 'subAmount')}>{item.amount}</span>
          </div>
        ))}
      </section>

      <section className={cls(styles, 'card')}>
        <h2 className={cls(styles, 'cardTitle')}>Seguro celular Claro — cargo duplicado</h2>
        <p className={cls(styles, 'cardSubtitle')} style={{ marginBottom: 16 }}>
          Mismo comercio y monto cobrados dos veces el 24 de septiembre, con 6 horas de diferencia.
        </p>
        <Button>Preparar reclamo</Button>
      </section>
    </div>
  );
}
