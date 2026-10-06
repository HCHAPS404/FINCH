'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, IconCalendar, IconCoins, IconUsers, IconArrowRight } from '@finch/ui-web';
import { OnboardingLayout } from '../../_components/OnboardingLayout';
import { OptionCard } from '../../_components/OptionCard';

const OPTIONS = [
  { id: 'biweekly', icon: IconCalendar, title: 'Quincenal', subtitle: 'Día 15 y 30' },
  { id: 'monthly', icon: IconCalendar, title: 'Mensual', subtitle: 'Un pago al mes' },
  {
    id: 'variable',
    icon: IconCoins,
    title: 'Ingresos variables',
    subtitle: 'Freelance o comisiones',
  },
  { id: 'multiple', icon: IconUsers, title: 'Varios ingresos', subtitle: 'Combinado' },
] as const;

export default function Onboarding1Page(): ReactElement {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  return (
    <OnboardingLayout
      step={1}
      stepCount={3}
      title="¿Cómo recibes tu dinero?"
      subtitle="Así planeamos tu quincena desde el primer día."
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
            Omitir
          </Button>
          <Button
            type="button"
            size="large"
            disabled={!selected}
            onClick={() => {
              router.push('/onboarding/2');
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
          selected={selected === option.id}
          onToggle={() => {
            setSelected(option.id);
          }}
        />
      ))}
    </OnboardingLayout>
  );
}
