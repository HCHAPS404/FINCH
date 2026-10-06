import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconX(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M6 6L18 18M18 6L6 18" />
    </Icon>
  );
}
