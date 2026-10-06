import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconPlus(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 5V19M5 12H19" />
    </Icon>
  );
}
