import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconSun(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" />
      <path d="M12 2V4M12 20V22M2 12H4M20 12H22M5 5L6.4 6.4M17.6 17.6L19 19M5 19L6.4 17.6M17.6 6.4L19 5" />
    </Icon>
  );
}
