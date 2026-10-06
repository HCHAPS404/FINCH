'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, IconShield, IconWallet, IconMail, IconCard, IconArrowRight } from '@finch/ui-web';
import { OnboardingLayout } from '../../_components/OnboardingLayout';
import { OptionCard } from '../../_components/OptionCard';

const OPTIONS = [
  {
    id: 'sample',
    icon: IconShield,
    title: 'Empezar con datos de ejemplo',
    subtitle: 'Recomendado para explorar',
  },
  { id: 'manual', icon: IconWallet, title: 'Ingresar mis números', subtitle: '5 minutos' },
  {
    id: 'forward',
    icon: IconMail,
    title: 'Reenviar notificaciones del banco',
    subtitle: 'Por correo',
  },
  { id: 'import', icon: IconCard, title: 'Importar extracto', subtitle: 'CSV o PDF' },
] as const;

export default function Onboarding3Page(): ReactElement {
  const [selected, setSelected] = useState<string | null>('sample');
  const router = useRouter();

  return (
    <OnboardingLayout
      step={3}
      stepCount={3}
      title="¿Cómo quieres empezar?"
      subtitle="Nada se conecta sin tu permiso. Todo se puede borrar."
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="large"
            onClick={() => {
              router.push('/onboarding/2');
            }}
          >
            Atrás
          </Button>
          <Button
            type="button"
            size="large"
            disabled={!selected}
            onClick={() => {
              router.push('/hoy');
            }}
          >
            Ver mi plan
            <IconArrowRight size={18} />
          </Button>
        </>
      }
    >
      {OPTIONS.map((option) => (
        <OptionCard
          key={option.id}
          icon={option.icon}
          title={option.title}
          subtitle={option.subtitle}
          selected={selected === option.id}
          onToggle={() => {
            setSelected(option.id);
          }}
        />
      ))}
    </OnboardingLayout>
  );
}
