import type { ReactElement } from 'react';
import { Checkbox, Button, StatusChip, IconFile, IconArrowRight } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

const INDICATORS = [
  { name: 'Ingreso promedio y estabilidad (últimos 6 meses)', checked: true },
  { name: 'Relación deuda / ingreso', checked: true },
  { name: 'Meses de colchón', checked: true },
  { name: 'Puntualidad de pagos', checked: true },
  { name: 'Salud financiera (score)', checked: false },
  { name: 'Patrimonio neto', checked: false },
];

const ACCESS_LOG = [
  {
    who: 'Arrendador · Edificio Torres del Parque',
    when: 'Abierto el 28 sep, 3:40 p.m.',
    tone: 'positive' as const,
    label: 'Verificado',
  },
  {
    who: 'Enlace copiado por ti',
    when: 'Generado el 27 sep, 10:12 a.m.',
    tone: 'info' as const,
    label: 'Expira en 7 días',
  },
];

export default function PasaportePage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Pasaporte financiero"
        description="Un documento compartible que demuestra solidez a un arrendador, banco o empleador sin exponer tus movimientos."
      />

      <div className={cls(styles, 'stack')}>
        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 4 }}>
            Qué incluir
          </h2>
          <p className={cls(styles, 'cardSubtitle')} style={{ marginBottom: 14 }}>
            Tú decides qué indicadores van en el documento compartido.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INDICATORS.map((item) => (
              <Checkbox
                key={item.name}
                label={item.name}
                name={item.name}
                defaultChecked={item.checked}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <Button>
              <IconFile size={18} />
              Generar PDF con código de verificación
            </Button>
            <Button variant="secondary">
              Generar enlace (expira en 7 días)
              <IconArrowRight size={16} />
            </Button>
          </div>
        </section>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 12 }}>
            Quién lo ha abierto
          </h2>
          {ACCESS_LOG.map((item) => (
            <div key={item.who} className={cls(styles, 'row')}>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>{item.who}</p>
                <p className={cls(styles, 'rowMeta')}>{item.when}</p>
              </div>
              <StatusChip tone={item.tone}>{item.label}</StatusChip>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Button variant="danger" size="medium">
              Revocar todos los enlaces
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
