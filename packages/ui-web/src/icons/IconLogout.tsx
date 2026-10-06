import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconLogout(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M15 4H19V20H15" />
      <path d="M10 16L6 12L10 8M6 12H16" />
    </Icon>
  );
}
