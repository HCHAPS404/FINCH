import type { ReactElement } from 'react';
import { Button, StatusChip, IconUpload, IconSearch, IconFile } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';

const DOCUMENTS = [
  {
    name: 'SOAT · Moto Yamaha FZ',
    meta: 'Vence el 14 oct 2026',
    tone: 'negative' as const,
    label: 'Vence en 8 días',
  },
  {
    name: 'Revisión técnico-mecánica',
    meta: 'Vence el 2 nov 2026',
    tone: 'warning' as const,
    label: 'Vence en 27 días',
  },
  {
    name: 'Póliza seguro hogar — Hogar Pérez',
    meta: 'Vence el 15 mar 2027',
    tone: 'positive' as const,
    label: 'Vigente',
  },
  {
    name: 'Contrato de arrendamiento',
    meta: 'Renueva el 1 feb 2027',
    tone: 'positive' as const,
    label: 'Vigente',
  },
  {
    name: 'Certificado laboral',
    meta: 'Subido el 2 sep 2026',
    tone: 'positive' as const,
    label: 'Vigente',
  },
];

export default function BovedaPage(): ReactElement {
  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Bóveda"
        description="Pólizas, contratos, garantías y certificados. Cifrado en reposo; cuarentena automática al subir."
      />

      <div className={cls(styles, 'stack')}>
        <section className={cls(styles, 'card')}>
          <div className={cls(styles, 'cardHeader')}>
            <h2 className={cls(styles, 'cardTitle')}>5 documentos guardados</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="medium">
                <IconSearch size={16} />
                Buscar
              </Button>
              <Button size="medium">
                <IconUpload size={16} />
                Subir documento
              </Button>
            </div>
          </div>
          {DOCUMENTS.map((doc) => (
            <div key={doc.name} className={cls(styles, 'row')}>
              <span className={cls(styles, 'rowIcon')}>
                <IconFile size={18} />
              </span>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>{doc.name}</p>
                <p className={cls(styles, 'rowMeta')}>{doc.meta}</p>
              </div>
              <StatusChip tone={doc.tone}>{doc.label}</StatusChip>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
