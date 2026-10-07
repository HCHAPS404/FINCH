'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Banner } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';
import { getMe, updateMe, type MeProfile } from '../../../_lib/api';
import { getSession } from '../../../_lib/session';

export default function PerfilPage(): ReactElement {
  const router = useRouter();
  const [profile, setProfile] = useState<MeProfile | undefined>(undefined);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (getSession() === undefined) {
      router.push('/login');
      return;
    }
    getMe()
      .then((me) => {
        setProfile(me);
        setDisplayName(me.displayName);
        setPhone(me.phone ?? '');
        setDateOfBirth(me.dateOfBirth ?? '');
      })
      .catch(() => {
        setError('No pudimos cargar tu perfil.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  async function handleSave(): Promise<void> {
    setSaving(true);
    setSaved(false);
    setError(undefined);
    try {
      const payload: { displayName: string; phone?: string; dateOfBirth?: string } = {
        displayName,
      };
      if (phone !== '') payload.phone = phone;
      if (dateOfBirth !== '') payload.dateOfBirth = dateOfBirth;
      const updated = await updateMe(payload);
      setProfile(updated);
      setSaved(true);
    } catch {
      setError('No pudimos guardar los cambios. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Mi perfil"
        description="Tus datos personales. Esta es la información base que FINCH usa para identificarte."
      />

      <div className={cls(styles, 'stack')}>
        <section className={cls(styles, 'card')}>
          {loading ? (
            <p className={cls(styles, 'cardSubtitle')}>Cargando…</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
              {error !== undefined ? (
                <Banner tone="negative" title="Algo salió mal">
                  {error}
                </Banner>
              ) : null}
              {saved ? (
                <Banner tone="positive" title="Listo">
                  Perfil actualizado.
                </Banner>
              ) : null}
              <Input
                label="Nombre completo"
                name="displayName"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                }}
                required
              />
              <Input
                label="Teléfono"
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                }}
              />
              <Input
                label="Fecha de nacimiento"
                name="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(event) => {
                  setDateOfBirth(event.target.value);
                }}
              />
              {profile !== undefined ? (
                <p className={cls(styles, 'cardSubtitle')}>
                  Correo asociado a la cuenta de acceso.
                </p>
              ) : null}
              <Button
                onClick={() => {
                  void handleSave();
                }}
                disabled={saving}
                style={{ alignSelf: 'flex-start' }}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
