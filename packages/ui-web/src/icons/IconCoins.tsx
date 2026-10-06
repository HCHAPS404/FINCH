import type { ReactElement } from 'react';
import type { IconProps } from './Icon.js';
import { Icon } from './Icon.js';

export function IconCoins(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 9C15.866 9 19 7.65685 19 6C19 4.34315 15.866 3 12 3C8.13401 3 5 4.34315 5 6C5 7.65685 8.13401 9 12 9Z" />
      <path d="M5 6V12C5 13.7 8.1 15 12 15C15.9 15 19 13.7 19 12V6" />
      <path d="M5 12V18C5 19.7 8.1 21 12 21C15.9 21 19 19.7 19 18V12" />
    </Icon>
  );
}
