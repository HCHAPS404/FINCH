'use client';

import type { ReactElement, SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Checkbox, Input, IconGlobe, IconArrowRight } from '@finch/ui-web';
import { AuthLayout } from '../_components/AuthLayout';
import { FormHeading } from '../_components/FormHeading';
import { LabeledDivider } from '../_components/LabeledDivider';

export default function SignUpPage(): ReactElement {
  const router = useRouter();

  // No real auth provider yet (FIN-021), so there's no account to actually create or
  // reject — any complete, valid submission moves on to onboarding, matching the real
  // Figma flow (Sign up -> Onboarding 1-3 -> Hoy) instead of dead-ending here.
  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    router.push('/onboarding/1');
  }

  return (
    <AuthLayout
      headline="Tu CFO personal, privado y siempre atento."
      subhead="Planea tu quincena, controla tus tarjetas y encuentra el dinero que estás perdiendo."
    >
      <FormHeading title="Crea tu cuenta" subtitle="Empieza gratis. Sin conectar tu banco." />

      <Button variant="secondary" size="large" style={{ width: '100%' }} disabled>
        <IconGlobe size={18} />
        Continuar con Google
      </Button>

      <LabeledDivider label="o con tu correo" />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Nombre"
          name="name"
          autoComplete="name"
          helperText="Lo usaremos solo para tu cuenta."
          required
        />
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          helperText="Te enviaremos un enlace para verificarlo."
          required
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          helperText="Mínimo 12 caracteres, con un número."
          minLength={12}
          required
        />
        <Checkbox label="Acepto los Términos y la Política de datos" name="acceptTerms" required />
        <Button type="submit" size="large" style={{ width: '100%' }}>
          Crear cuenta
          <IconArrowRight size={18} />
        </Button>
      </form>

      <p
        style={{
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: 'var(--fc-text-secondary)',
          margin: 0,
        }}
      >
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" style={{ color: 'var(--fc-positive-fg)', fontWeight: 500 }}>
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
