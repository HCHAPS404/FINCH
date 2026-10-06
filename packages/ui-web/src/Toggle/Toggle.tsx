import type { InputHTMLAttributes, ReactElement } from 'react';
import { useId } from 'react';
import { cls, cx } from '../internal/cx.js';
import styles from './Toggle.module.css';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  readonly label: string;
  readonly id?: string;
}

export function Toggle({ label, id, className, ...rest }: ToggleProps): ReactElement {
  const generatedId = useId();
  const toggleId = id ?? generatedId;

  return (
    <label className={cx(cls(styles, 'wrapper'), className)} htmlFor={toggleId}>
      <input
        id={toggleId}
        type="checkbox"
        role="switch"
        className={cls(styles, 'input')}
        {...rest}
      />
      <span className={cls(styles, 'track')}>
        <span className={cls(styles, 'knob')} />
      </span>
      <span className={cls(styles, 'label')}>{label}</span>
    </label>
  );
}
