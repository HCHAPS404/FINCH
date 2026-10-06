import type { ReactElement } from 'react';
import {
  Button,
  StatusChip,
  Banner,
  IconAlert,
  IconCard,
  IconShield,
  IconFile,
} from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

const ACTIVE_CASES = [
  {
    name: 'Cobro indebido · Seguro celular Claro duplicado',
    meta: 'Paso 2 de 4 · esperando respuesta del Banco de Bogotá (plazo: 15 días hábiles)',
    tone: 'info' as const,
    label: 'En trámite',
  },
  {
    name: 'Comisión no pactada · Cajero Servibanca',
    meta: 'Paso 1 de 4 · diagnóstico completo, listo para enviar',
    tone: 'warning' as const,
    label: 'Pendiente de enviar',
  },
];

const CASE_TYPES = [
  { icon: IconAlert, name: 'Cobro indebido' },
  { icon: IconCard, name: 'Comisión no pactada' },
  { icon: IconShield, name: 'Seguro cobrado sin autorización' },
  { icon: IconFile, name: 'Compra de cartera / renegociación' },
  { icon: IconFile, name: 'Paz y salvo' },
  { icon: IconAlert, name: 'Reporte negativo en centrales (habeas data)' },
  { icon: IconAlert, name: 'Reclamo no respondido' },
  { icon: IconFile, name: 'Cancelación de productos' },
];

export default function CasosPage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Mis casos"
        description="Copiloto de derechos: diagnóstico guiado → entidad → Defensor del Consumidor Financiero → SFC, con plazos y evidencia de tu Bóveda."
      />

      <div className={cls(styles, 'stack')}>
        <Banner tone="info" title="Marco legal">
          Todos los casos siguen la ruta de la Ley 1328 de 2009 (protección al consumidor financiero
          en Colombia).
        </Banner>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 12 }}>
            Casos activos
          </h2>
          {ACTIVE_CASES.map((item) => (
            <div key={item.name} className={cls(styles, 'row')}>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>{item.name}</p>
                <p className={cls(styles, 'rowMeta')}>{item.meta}</p>
              </div>
              <StatusChip tone={item.tone}>{item.label}</StatusChip>
            </div>
          ))}
        </section>

        <section className={cls(styles, 'card')}>
          <h2 className={cls(styles, 'cardTitle')} style={{ marginBottom: 4 }}>
            Iniciar un caso nuevo
          </h2>
          <p className={cls(styles, 'cardSubtitle')} style={{ marginBottom: 14 }}>
            8 tipos de caso cubiertos hoy.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 8,
            }}
          >
            {CASE_TYPES.map((type) => (
              <Button key={type.name} variant="secondary" style={{ justifyContent: 'flex-start' }}>
                <type.icon size={16} />
                {type.name}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
