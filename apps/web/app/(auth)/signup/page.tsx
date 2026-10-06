'use client';

import type { ReactElement, SubmitEvent } from 'react';
import Link from 'next/link';
import { Button, Checkbox, Input, IconGlobe, IconArrowRight } from '@finch/ui-web';
import { AuthLayout } from '../_components/AuthLayout';
import { FormHeading } from '../_components/FormHeading';
import { LabeledDivider } from '../_components/LabeledDivider';

// UI only — wiring to a real auth provider lands with FIN-021 (Auth provider port) and
// the corresponding apps/api endpoint. Submitting here is intentionally inert rather
// than faking a network call.
function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
  event.preventDefault();
}

export default function SignUpPage(): ReactElement {
  return (
    <AuthLayout
      headline="Tu CFO personal, privado y siempre atento."
      subhead="Planea tu quincena, controla tus tarjetas y encuentra el dinero que estás perdiendo."
    >
      <FormHeading title="Crea tu cuenta" subtitle="Empieza gratis. Sin conectar tu banco." />

      <Button variant="secondary" size="large" style={{ width: '100%' }}>
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
