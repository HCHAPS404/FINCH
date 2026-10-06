import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconCalendar(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M18 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5Z" />
      <path d="M4 10H20M8 3V7M16 3V7" />
    </Icon>
  );
}
