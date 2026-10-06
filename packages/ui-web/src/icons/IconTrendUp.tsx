import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconTrendUp(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M3 17L9 11L13 15L21 7" />
      <path d="M15 7H21V13" />
    </Icon>
  );
}
