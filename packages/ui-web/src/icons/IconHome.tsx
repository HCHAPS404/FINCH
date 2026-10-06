import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconHome(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M3 11L12 4L21 11" />
      <path d="M5 10V20H19V10" />
      <path d="M10 20V14H14V20" />
    </Icon>
  );
}
