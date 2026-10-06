import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconFile(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M6 3H14L18 7V21H6V3Z" />
      <path d="M14 3V7H18" />
    </Icon>
  );
}
