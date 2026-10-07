'use client';

import type { ChangeEvent, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, StatusChip, Banner, IconUpload, IconFile, IconX } from '@finch/ui-web';
import { AppShell } from '../../_components/AppShell';
import { SubPageHeader } from '../_components/SubPageHeader';
import { cls } from '../../../_lib/cx';
import styles from '../_components/shared.module.css';
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
  type DocumentMeta,
} from '../../../_lib/api';
import { getSession } from '../../../_lib/session';

const ALLOWED_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // `data:<mime>;base64,<payload>` — the API wants the payload only.
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };
    reader.readAsDataURL(file);
  });
}

function formatSize(sizeBytes: string): string {
  const bytes = Number(sizeBytes);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BovedaPage(): ReactElement {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const session = getSession();
    if (session === undefined) {
      router.push('/login');
      return;
    }
    setWorkspaceId(session.workspaceId);
    listDocuments(session.workspaceId)
      .then(setDocuments)
      .catch(() => {
        setError('No pudimos cargar tus documentos.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file === undefined || workspaceId === undefined) return;

    setError(undefined);
    if (!ALLOWED_TYPES.has(file.type)) {
      setError('Solo se aceptan PDF, PNG o JPEG.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('El archivo supera el límite de 10 MB.');
      return;
    }

    setUploading(true);
    try {
      const contentBase64 = await readAsBase64(file);
      const uploaded = await uploadDocument(workspaceId, {
        originalFilename: file.name,
        mimeType: file.type,
        contentBase64,
      });
      setDocuments((previous) => [uploaded, ...previous]);
    } catch {
      setError('No pudimos subir el documento.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (workspaceId === undefined) return;
    try {
      await deleteDocument(workspaceId, id);
      setDocuments((previous) => previous.filter((doc) => doc.id !== id));
    } catch {
      setError('No pudimos eliminar el documento.');
    }
  }

  return (
    <AppShell heading="Yo" date="Martes, 29 de septiembre">
      <SubPageHeader
        title="Bóveda"
        description="Guarda facturas, pólizas, contratos y certificados. Solo metadatos y el archivo — sin lectura automática todavía."
      />

      <div className={cls(styles, 'stack')}>
        <section className={cls(styles, 'card')}>
          <div className={cls(styles, 'cardHeader')}>
            <h2 className={cls(styles, 'cardTitle')}>
              {loading ? 'Cargando…' : `${documents.length} documentos guardados`}
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                style={{ display: 'none' }}
                onChange={(event) => {
                  void handleFileChange(event);
                }}
              />
              <Button
                size="medium"
                disabled={uploading || workspaceId === undefined}
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <IconUpload size={16} />
                {uploading ? 'Subiendo…' : 'Subir documento'}
              </Button>
            </div>
          </div>

          {error !== undefined ? (
            <Banner tone="negative" title="Algo salió mal">
              {error}
            </Banner>
          ) : null}

          {!loading && documents.length === 0 ? (
            <p className={cls(styles, 'cardSubtitle')}>Todavía no has subido documentos.</p>
          ) : null}

          {documents.map((doc) => (
            <div key={doc.id} className={cls(styles, 'row')}>
              <span className={cls(styles, 'rowIcon')}>
                <IconFile size={18} />
              </span>
              <div className={cls(styles, 'rowBody')}>
                <p className={cls(styles, 'rowTitle')}>{doc.originalFilename}</p>
                <p className={cls(styles, 'rowMeta')}>{formatSize(doc.sizeBytes)}</p>
              </div>
              <StatusChip tone="positive">{doc.status}</StatusChip>
              <Button
                variant="secondary"
                size="medium"
                onClick={() => {
                  void handleDelete(doc.id);
                }}
              >
                <IconX size={16} />
              </Button>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
