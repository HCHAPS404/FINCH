import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconShield(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 3L20 6V12C20 17 16.5 20 12 21C7.5 20 4 17 4 12V6L12 3Z" />
      <path d="M9 12L11 14L15 10" />
    </Icon>
  );
}
