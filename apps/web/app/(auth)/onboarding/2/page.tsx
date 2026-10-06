'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  IconWallet,
  IconCard,
  IconTarget,
  IconTrendUp,
  IconArrowRight,
} from '@finch/ui-web';
import { OnboardingLayout } from '../../_components/OnboardingLayout';
import { OptionCard } from '../../_components/OptionCard';

const OPTIONS = [
  { id: 'budget', icon: IconWallet, title: 'Que me alcance el mes', subtitle: 'Plan y sobres' },
  { id: 'debt', icon: IconCard, title: 'Salir de deudas', subtitle: 'Tarjetas y créditos' },
  {
    id: 'goal',
    icon: IconTarget,
    title: 'Ahorrar para una meta',
    subtitle: 'Viaje, casa, estudio',
  },
  { id: 'invest', icon: IconTrendUp, title: 'Hacer crecer mi dinero', subtitle: 'CDT e inversión' },
] as const;

const MAX_SELECTIONS = 2;

export default function Onboarding2Page(): ReactElement {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  function toggle(id: string): void {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, id];
    });
  }

  return (
    <OnboardingLayout
      step={2}
      stepCount={3}
      title="¿Qué quieres lograr primero?"
      subtitle="Elige hasta dos. Puedes cambiarlo cuando quieras."
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="large"
            onClick={() => {
              router.push('/onboarding/1');
            }}
          >
            Atrás
          </Button>
          <Button
            type="button"
            size="large"
            disabled={selected.length === 0}
            onClick={() => {
              router.push('/onboarding/3');
            }}
          >
            Siguiente
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
          selected={selected.includes(option.id)}
          onToggle={() => {
            toggle(option.id);
          }}
        />
      ))}
    </OnboardingLayout>
  );
}
