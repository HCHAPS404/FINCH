import type { ReactElement } from 'react';
import { StatusChip, TruthBadge, Checkbox, IconReceipt } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

const CHECKLIST = [
  { name: 'Certificado de ingresos y retenciones', checked: true },
  { name: 'Extractos bancarios del año gravable', checked: true },
  { name: 'Certificados de CDT e inversiones', checked: false },
  { name: 'Facturas electrónicas deducibles', checked: false },
  { name: 'Certificado de medicina prepagada', checked: false },
];

export default function ImpuestosPage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Impuestos"
        description="Declaración de renta, calendario DIAN, retención en la fuente y GMF. Simulación educativa, no asesoría tributaria."
      />

      <div className={cls(styles, 'stack')}>
        <section className={cls(styles, 'card')}>
          <div className={cls(styles, 'cardHeader')}>
            <h2 className={cls(styles, 'cardTitle')}>¿Debo declarar renta este año?</h2>
            <TruthBadge truthClass="ESTIMATED" />
          </div>
          <p className={cls(styles, 'cardSubtitle')}>
            Con tus ingresos y patrimonio actuales, no superas los topes DIAN del año gravable 2026
            — probablemente no estás obligada a declarar. Confírmalo cuando tengas el certificado de
            ingresos de diciembre.
          </p>
        </section>

        <div className={cls(styles, 'grid2')}>
          <section className={cls(styles, 'card')}>
            <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 12 }}>
              Calendario DIAN
            </h2>
            <div className={cls(styles, 'row')}>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>Últimos dígitos de tu cédula: 47</p>
                <p className={cls(styles, 'rowMeta')}>
                  Plazo estimado: segunda semana de agosto 2027
                </p>
              </div>
              <StatusChip tone="info">Aún lejos</StatusChip>
            </div>
          </section>

          <section className={cls(styles, 'card')}>
            <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 12 }}>
              GMF (4×1.000)
            </h2>
            <div className={cls(styles, 'row')}>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>Cuenta de ahorros principal</p>
                <p className={cls(styles, 'rowMeta')}>
                  No marcada como exenta — pagaste $18.400 en GMF este mes
                </p>
              </div>
              <StatusChip tone="warning">Revisar exención</StatusChip>
            </div>
          </section>
        </div>

        <section className={cls(styles, 'card')}>
          <div className={cls(styles, 'cardHeader')}>
            <h2 className={cls(styles, 'cardTitle')}>Estimador de renta (simulación)</h2>
            <TruthBadge truthClass="GENERATED_NARRATIVE" />
          </div>
          <p className={cls(styles, 'cardSubtitle')}>
            Con rentas exentas y deducciones típicas (dependientes, intereses de vivienda, medicina
            prepagada, aportes voluntarios, facturas electrónicas) tu impuesto estimado de renta
            para cédula general sería cercano a $0 — por debajo del tope de ingresos. Esto es una
            simulación educativa, no una declaración.
          </p>
        </section>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 14 }}>
            Checklist de documentos
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CHECKLIST.map((item) => (
              <Checkbox
                key={item.name}
                label={item.name}
                name={item.name}
                defaultChecked={item.checked}
              />
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 16,
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: 'var(--fc-text-muted)',
            }}
          >
            <IconReceipt size={14} />
            Alimentado automáticamente desde tu Bóveda y facturas electrónicas.
          </div>
        </section>
      </div>
    </AppShell>
  );
}
