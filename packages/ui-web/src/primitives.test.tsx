import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './Button/Button.js';
import { Input } from './Input/Input.js';
import { Checkbox } from './Checkbox/Checkbox.js';
import { Toggle } from './Toggle/Toggle.js';
import { StatusChip } from './StatusChip/StatusChip.js';
import { Banner } from './Banner/Banner.js';
import { FreshnessStamp } from './FreshnessStamp/FreshnessStamp.js';

describe('Button', () => {
  it('fires onClick and respects disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={onClick} disabled>
        Guardar
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Input', () => {
  it('associates the label, and renders the error message accessibly', () => {
    render(<Input label="Correo" error="Correo inválido" />);
    const field = screen.getByLabelText('Correo');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Correo inválido')).toBeInTheDocument();
  });
});

describe('Checkbox', () => {
  it('toggles via its accessible label', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Acepto los términos" />);
    const box = screen.getByRole('checkbox', { name: 'Acepto los términos' });
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
  });
});

describe('Toggle', () => {
  it('exposes an accessible switch role', async () => {
    const user = userEvent.setup();
    render(<Toggle label="Modo oscuro" />);
    const toggle = screen.getByRole('switch', { name: 'Modo oscuro' });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });
});

describe('StatusChip', () => {
  it('renders its text content, not just a tone color', () => {
    render(<StatusChip tone="negative">Vencido</StatusChip>);
    expect(screen.getByRole('status')).toHaveTextContent('Vencido');
  });
});

describe('Banner', () => {
  it('renders title and body', () => {
    render(
      <Banner tone="warning" title="Revisa tu presupuesto">
        Vas a superar el límite de Mercado este mes.
      </Banner>,
    );
    expect(screen.getByText('Revisa tu presupuesto')).toBeInTheDocument();
    expect(screen.getByText(/superar el límite/)).toBeInTheDocument();
  });
});

describe('FreshnessStamp', () => {
  it('gives every freshness state its own label', () => {
    const labels = (['FRESH', 'RECENT', 'STALE', 'UNKNOWN'] as const).map((freshness) => {
      const { unmount } = render(<FreshnessStamp freshness={freshness} />);
      const text = screen.getByRole('status').textContent;
      unmount();
      return text;
    });
    expect(new Set(labels).size).toBe(4);
  });
});
