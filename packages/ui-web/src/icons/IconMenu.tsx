import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconMenu(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M4 7H20M4 12H20M4 17H20" />
    </Icon>
  );
}
