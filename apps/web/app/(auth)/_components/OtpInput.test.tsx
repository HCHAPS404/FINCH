import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { OtpInput } from './OtpInput.js';

describe('OtpInput', () => {
  it('renders six accessible digit slots', () => {
    render(<OtpInput />);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('auto-advances focus to the next slot after a digit is entered', async () => {
    const user = userEvent.setup();
    render(<OtpInput />);
    const first = screen.getByLabelText('Dígito 1');
    const second = screen.getByLabelText('Dígito 2');
    await user.click(first);
    await user.keyboard('4');
    expect(second).toHaveFocus();
  });

  it('moves focus back to the previous slot on Backspace when the current slot is empty', async () => {
    const user = userEvent.setup();
    render(<OtpInput />);
    const first = screen.getByLabelText('Dígito 1');
    const second = screen.getByLabelText('Dígito 2');
    await user.click(first);
    await user.keyboard('4');
    expect(second).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(first).toHaveFocus();
  });

  it('strips non-numeric input', async () => {
    const user = userEvent.setup();
    render(<OtpInput />);
    const first = screen.getByLabelText('Dígito 1');
    await user.click(first);
    await user.keyboard('a');
    expect(first).toHaveValue('');
  });
});
