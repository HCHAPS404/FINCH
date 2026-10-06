import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconClock(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" />
      <path d="M12 7V12L15 14" />
    </Icon>
  );
}
