import type { InputHTMLAttributes, ReactElement } from 'react';
import { useId } from 'react';
import { IconCheck } from '../icons/index.js';
import { cls, cx } from '../internal/cx.js';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  readonly label: string;
  readonly id?: string;
}

export function Checkbox({ label, id, className, ...rest }: CheckboxProps): ReactElement {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <label className={cx(cls(styles, 'wrapper'), className)} htmlFor={checkboxId}>
      <input id={checkboxId} type="checkbox" className={cls(styles, 'input')} {...rest} />
      <span className={cls(styles, 'box')}>
        <IconCheck className={cls(styles, 'icon')} />
      </span>
      <span className={cls(styles, 'label')}>{label}</span>
    </label>
  );
}
