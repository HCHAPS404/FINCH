import type { ReactElement } from 'react';
import { Banner, TruthBadge, IconReceipt } from '@finch/ui-web';
import { cls } from '../../../_lib/cx';
import styles from '../page.module.css';

const CORRIDOR = [
  {
    name: 'Servicio A',
    fee: '$0 comisión',
    margin: '4,8 % sobre tasa de referencia',
    receives: '$1.187.400',
    speed: 'Minutos',
  },
  {
    name: 'Servicio B',
    fee: '$35.000 comisión fija',
    margin: '1,2 % sobre tasa de referencia',
    receives: '$1.199.100',
    speed: '1 día hábil',
  },
  {
    name: 'Servicio C',
    fee: '2,5 % comisión',
    margin: '2,1 % sobre tasa de referencia',
    receives: '$1.151.600',
    speed: 'Minutos',
  },
  {
    name: 'Servicio D (banco tradicional)',
    fee: '$68.000 comisión fija',
    margin: '6,5 % sobre tasa de referencia',
    receives: '$1.089.300',
    speed: '2-3 días hábiles',
  },
];

export function RemesasTab(): ReactElement {
  return (
    <div className={cls(styles, 'stack')}>
      <section className={cls(styles, 'card')}>
        <div className={cls(styles, 'cardHeader')}>
          <div>
            <h2 className={cls(styles, 'cardTitle')}>EEUU → Colombia · envío de US$300</h2>
            <p className={cls(styles, 'cardSubtitle')}>
              Costo real = comisión + margen cambiario frente a la tasa de referencia.
            </p>
          </div>
          <TruthBadge truthClass="ESTIMATED" />
        </div>
        <div className={cls(styles, 'corridorHeader')}>
          <span style={{ flex: 2 }}>Servicio</span>
          <span style={{ flex: 1 }}>Costo real</span>
          <span style={{ flex: 1, textAlign: 'right' }}>Recibes</span>
        </div>
        {CORRIDOR.map((item, index) => (
          <div key={item.name} className={cls(styles, 'rankRow')}>
            <span className={cls(styles, 'rankBadge')}>{index + 1}</span>
            <div className={cls(styles, 'rankBody')}>
              <p className={cls(styles, 'rankName')}>{item.name}</p>
              <p className={cls(styles, 'rankMeta')}>
                {item.fee} · {item.margin} · llega en {item.speed}
              </p>
            </div>
            <span className={cls(styles, 'rankValue')}>{item.receives}</span>
          </div>
        ))}
        <div className={cls(styles, 'sourceLine')}>
          <IconReceipt size={14} />
          Fuente: cotizaciones 29 sep 2026 · fx.remittance_cost@1
        </div>
      </section>

      <div className={cls(styles, 'simBanner')}>
        <Banner tone="warning" title="Si sigues usando el Servicio D cada mes">
          Pierdes $330.300 al año frente al Servicio B — solo por comisión y margen cambiario, sin
          cambiar de monto.
        </Banner>
      </div>
    </div>
  );
}
